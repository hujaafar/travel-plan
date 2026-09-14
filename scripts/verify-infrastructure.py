"""Read-only checks against the running development environment. No secrets printed."""

import json
from pathlib import Path
import subprocess
from process_runtime import run_command

ROOT = Path(__file__).resolve().parents[1]


def run(args, **kwargs):
    return run_command(args, cwd=ROOT, check=True, text=True, timeout=60, **kwargs)


run(["docker", "compose", "config", "--quiet"])
run(
    [
        "docker",
        "compose",
        "-f",
        "compose.yml",
        "-f",
        "compose.tools.yml",
        "--profile",
        "tools",
        "--profile",
        "monitoring",
        "config",
        "--quiet",
    ]
)

# The private network avoids host antivirus HTTPS interception. Every request
# verifies both the generated CA chain and the server's hostname.
worker = r"""
import json, ssl, urllib.request, urllib.error
ctx = ssl.create_default_context(cafile='/certs/ca.crt')
for name in ['identity', 'travel', 'payments']:
    with urllib.request.urlopen('https://' + name + ':8443/actuator/health', context=ctx, timeout=15) as response:
        assert json.load(response)['status'] == 'UP', name
    print('PASS verified HTTPS and health: ' + name)
request = urllib.request.Request('https://dashboard:8443/api/travels', headers={'Host': 'localhost:8443'})
try:
    urllib.request.urlopen(request, context=ctx, timeout=15)
    raise AssertionError('Anonymous API access was allowed')
except urllib.error.HTTPError as error:
    assert error.code == 401, error.code
print('PASS gateway TLS and anonymous-access rejection')
"""
run(
    [
        "docker",
        "run",
        "--rm",
        "--memory=128m",
        "--network",
        "travel-plan_backend",
        "-v",
        str(ROOT / ".secrets" / "ca.crt") + ":/certs/ca.crt:ro",
        "python:3.13-alpine",
        "python",
        "-c",
        worker,
    ]
)

sql = """
SELECT count(*) FROM pg_roles WHERE rolname IN ('identity','travel','payments')
AND NOT rolsuper AND NOT rolcreatedb AND NOT rolcreaterole;
SELECT count(*) FROM pg_namespace WHERE nspname IN ('identity','travel','payments')
AND pg_get_userbyid(nspowner) = nspname || '_owner';
SELECT count(*) FROM travel.graph_outbox;
SELECT count(*) FROM travel.travels;
"""
result = run(
    [
        "docker",
        "compose",
        "exec",
        "-T",
        "postgres",
        "psql",
        "-At",
        "-v",
        "ON_ERROR_STOP=1",
        "-U",
        "postgres",
        "-d",
        "travelplan",
    ],
    input=sql,
    capture_output=True,
)
roles, owners, pending, travels = map(int, result.stdout.split())
assert (
    roles == owners == 3
), "Runtime roles must not own schemas or have administrative privileges"
assert (
    pending == 0
), "Neo4j projection is still pending; retry after the graph worker runs"
print(f"PASS separate runtime roles; graph outbox drained; {travels} saved travels")

plain = run_command(
    [
        "docker",
        "compose",
        "exec",
        "-T",
        "postgres",
        "sh",
        "-c",
        'PGPASSWORD="$POSTGRES_PASSWORD" psql "host=postgres user=postgres dbname=travelplan sslmode=disable" -c "SELECT 1"',
    ],
    cwd=ROOT,
    capture_output=True,
    text=True,
    timeout=30,
)
assert (
    plain.returncode != 0 and "no encryption" in plain.stderr
), "PostgreSQL must reject plaintext TCP"
print("PASS PostgreSQL rejects unencrypted TCP")

graph = run(
    [
        "docker",
        "compose",
        "exec",
        "-T",
        "neo4j",
        "sh",
        "-c",
        'JAVA_OPTS="-Djavax.net.ssl.trustStore=/certificates/truststore.p12 -Djavax.net.ssl.trustStorePassword=changeit" '
        'cypher-shell -a bolt+s://neo4j:7687 -u neo4j -p "${NEO4J_AUTH#*/}" '
        '"MATCH (t:Travel) RETURN count(t) AS travels;"',
    ],
    capture_output=True,
)
graph_count = int(graph.stdout.strip().splitlines()[-1])
assert graph_count == travels, "Neo4j and PostgreSQL travel counts differ"
print(f"PASS verified Bolt TLS and matching Neo4j projection: {graph_count} travels")
print("Infrastructure verification passed.")
