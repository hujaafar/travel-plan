"""Safety boundaries for the disposable cloud CI controller; no live services."""
import contextlib
import importlib.util
import io
from pathlib import Path
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('github_ci', Path(__file__).resolve().parents[1] / 'github-ci.py')
ci = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ci)


class GitHubCISafetyTest(unittest.TestCase):
    def test_refuses_local_or_self_hosted_runner_before_touching_services(self):
        for environment in ({}, {'GITHUB_ACTIONS': 'true', 'RUNNER_ENVIRONMENT': 'self-hosted'}):
            with self.subTest(environment=environment), patch.dict(ci.os.environ, environment, clear=True), patch.object(ci, 'run') as run:
                with self.assertRaisesRegex(SystemExit, 'GitHub-hosted'):
                    ci.main()
                run.assert_not_called()

    def test_mask_escapes_workflow_commands_and_redacts_longest_secret_first(self):
        with patch.object(ci, 'PRIVATE', set()), contextlib.redirect_stdout(io.StringIO()) as output:
            ci.mask('test-secret')
            ci.mask('test-secret-extended%\r\n')
            self.assertEqual(ci.redacted('test-secret-extended%\r\n test-secret'), '[REDACTED] [REDACTED]')
            self.assertIn('extended%25%0D%0A', output.getvalue())
            self.assertNotIn('extended%\r\n', output.getvalue())

    def test_api_uses_verified_ca_and_session_bound_crumb_for_mutation(self):
        with patch.object(ci.ssl, 'create_default_context') as context, patch.object(ci.urllib.request, 'build_opener') as build:
            api = ci.API('https://localhost:18443', 'disposable-fixture-password')
            context.assert_called_once_with(cafile=str(ci.ROOT / '.secrets/ca.crt'))
            with patch.object(api, 'json', return_value={'crumbRequestField': 'Jenkins-Crumb', 'crumb': 'fixture-crumb'}):
                api.call('/createItem?name=fixture', b'<xml/>', 'application/xml', crumb=True)
            request = build.return_value.open.call_args.args[0]
            self.assertEqual(request.full_url, 'https://localhost:18443/createItem?name=fixture')
            self.assertEqual(request.get_header('Jenkins-crumb'), 'fixture-crumb')
            self.assertTrue(request.get_header('Authorization').startswith('Basic '))
            self.assertEqual(build.return_value.open.call_args.kwargs['timeout'], 30)

    def test_service_wait_has_a_hard_deadline(self):
        with patch.object(ci.time, 'monotonic', side_effect=[0, 2]), patch.object(ci.time, 'sleep') as sleep:
            with self.assertRaisesRegex(RuntimeError, 'did not become ready'):
                ci.wait_for('fixture', lambda: False, timeout=1)
            sleep.assert_not_called()


if __name__ == '__main__':
    unittest.main()
