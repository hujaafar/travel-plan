"""Operational gates must reject missing evidence and unexpected service changes."""
import importlib.util
from pathlib import Path
import sys
from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))


def module(name):
    spec = importlib.util.spec_from_file_location(name, Path(__file__).resolve().parents[1] / (name + '.py'))
    loaded = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(loaded)
    return loaded


providers = module('verify-providers')
deploy = module('verify-service-deploy')


class ProviderVerificationTest(unittest.TestCase):
    def test_absent_credentials_never_contact_providers_or_pass(self):
        probe = Mock()
        probe.command.return_value = {'ok': True, 'gateways': [
            {'id': 'stripe', 'provider': 'STRIPE', 'configured': False},
            {'id': 'paypal', 'provider': 'PAYPAL', 'configured': False}]}
        result = providers.verify(probe)
        self.assertTrue(all(not entry['passed'] for entry in result.values()))
        probe.command.assert_called_once_with('providers')

    def test_missing_gateway_is_not_success(self):
        probe = Mock()
        probe.command.return_value = {'ok': True, 'gateways': []}
        self.assertFalse(providers.verify(probe)['STRIPE']['passed'])

    def test_each_provider_must_return_success_independently(self):
        probe = Mock()
        probe.command.side_effect = [
            {'ok': True, 'gateways': [
                {'id': 'stripe', 'provider': 'STRIPE', 'configured': True},
                {'id': 'paypal', 'provider': 'PAYPAL', 'configured': True}]},
            {'ok': True, 'status': 200}, {'ok': False, 'status': 502}]
        result = providers.verify(probe)
        self.assertTrue(result['STRIPE']['passed'])
        self.assertFalse(result['PAYPAL']['passed'])
        self.assertEqual(probe.command.call_args_list[-1].kwargs, {'gateway_id': 'paypal'})


class IndependentDeploymentTest(unittest.TestCase):
    def test_rejects_unrelated_recreation_and_restart(self):
        original = {'identity1': {'service': 'identity', 'started_at': 'original'},
                    'travel1': {'service': 'travel', 'started_at': 'original'}}
        deploy.assert_unchanged(original, {**original, 'travel2': {'service': 'travel', 'started_at': 'new'}}, 'travel')
        for changed in ({}, {'identity1': {'service': 'identity', 'started_at': 'restarted'}}):
            with self.assertRaises(deploy.VerificationError):
                deploy.assert_unchanged(original, changed, 'travel')

    def test_refuses_workstation_before_touching_docker(self):
        with patch.dict(deploy.os.environ, {}, clear=True), patch.object(deploy, 'running_replicas') as replicas:
            with self.assertRaises(deploy.VerificationError):
                deploy.run(SimpleNamespace())
        replicas.assert_not_called()
