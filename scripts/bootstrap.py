"""Create development certificates and secrets, initialize Vault, start data services.
Requires Python 3.10+, cryptography, Docker Compose and a JDK keytool.
Never prints secret material. Existing secrets are retained on rerun.
"""

from pathlib import Path
import os, secrets, subprocess, json, time, ssl, urllib.request, urllib.error, datetime, ipaddress, shutil
from cryptography import x509
from cryptography.x509.oid import NameOID
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives.serialization import pkcs12
from secret_permissions import prepare_secret_storage, publish_runtime_exports

ROOT = Path(__file__).resolve().parents[1]
os.chdir(ROOT)
S = ROOT / ".secrets"
prepare_secret_storage(S, ROOT / ".env")
state = S / "bootstrap.json"
if state.exists():
    config = json.loads(state.read_text())
else:
    config = {
        k: secrets.token_hex(24)
        for k in [
            "POSTGRES_PASSWORD",
            "NEO4J_PASSWORD",
            "TLS_PASSWORD",
            "SERVICE_KEY",
            "ADMIN_PASSWORD",
            "identity",
            "travel",
            "payments",
        ]
    }
    state.write_text(json.dumps(config, indent=2))
    (S / "admin-login.txt").write_text(
        "URL: https://localhost:8443\nEmail: admin@travelplan.local\nPassword: "
        + config["ADMIN_PASSWORD"]
        + "\n"
    )
for key in ["JENKINS_ADMIN_PASSWORD", "SONAR_DB_PASSWORD", "GRAFANA_ADMIN_PASSWORD"]:
    config.setdefault(key, secrets.token_hex(24))
state.write_text(json.dumps(config, indent=2))
(ROOT / ".env").write_text(
    "\n".join(
        k + "=" + config[k]
        for k in [
            "POSTGRES_PASSWORD",
            "NEO4J_PASSWORD",
            "TLS_PASSWORD",
            "JENKINS_ADMIN_PASSWORD",
            "SONAR_DB_PASSWORD",
            "GRAFANA_ADMIN_PASSWORD",
        ]
    )
    + "\n"
)
(S / "000-roles.sql").write_text(
    "\n".join(
        "CREATE ROLE " + name + " LOGIN PASSWORD '" + config[name] + "';"
        for name in ["identity", "travel", "payments"]
    )
    + "\nREVOKE CREATE ON SCHEMA public FROM PUBLIC;\n"
)
from certificates import generate

generate(S, config["TLS_PASSWORD"])
publish_runtime_exports(S)
subprocess.run(
    ["docker", "compose", "up", "-d", "postgres", "neo4j", "vault"], check=True
)
for attempt in range(60):
    result = subprocess.run(
        [
            "docker",
            "compose",
            "exec",
            "-T",
            "postgres",
            "pg_isready",
            "-U",
            "postgres",
            "-d",
            "travelplan",
        ],
        capture_output=True,
    )
    if result.returncode == 0:
        break
    time.sleep(1)
subprocess.run(
    [
        "docker",
        "compose",
        "exec",
        "-T",
        "postgres",
        "psql",
        "-v",
        "ON_ERROR_STOP=1",
        "-U",
        "postgres",
        "-d",
        "travelplan",
    ],
    input=(ROOT / "infra/postgres/003-runtime-privileges.sql").read_bytes(),
    check=True,
    capture_output=True,
)


def api(path, data=None, token=None, method=None):
    # Execute inside the private Docker network. This keeps host HTTPS interception
    # software out of the development certificate chain, while verifying TLS.
    worker = "import sys,json,ssl,urllib.request; p=json.load(sys.stdin); ctx=ssl.create_default_context(cafile='/certs/ca.crt'); h={'Content-Type':'application/json'}; h.update({'X-Vault-Token':p['token']} if p['token'] else {}); r=urllib.request.Request('https://vault:8200/v1/'+p['path'],data=None if p['data'] is None else json.dumps(p['data']).encode(),headers=h,method=p['method']); response=urllib.request.urlopen(r,context=ctx,timeout=10); print(response.read().decode() or '{}')"
    result = subprocess.run(
        [
            "docker",
            "run",
            "--rm",
            "-i",
            "--network",
            "travel-plan_backend",
            "-v",
            str(S / "ca.crt") + ":/certs/ca.crt:ro",
            "python:3.13-alpine",
            "python",
            "-c",
            worker,
        ],
        input=json.dumps(
            {"path": path, "data": data, "token": token, "method": method}
        ),
        capture_output=True,
        text=True,
    )
    if result.returncode:
        if "HTTP Error 400" in result.stderr:
            raise urllib.error.HTTPError(path, 400, "Already enabled", {}, None)
        if "HTTP Error 404" in result.stderr:
            raise urllib.error.HTTPError(path, 404, "Not found", {}, None)
        raise OSError("Vault request failed: " + result.stderr[-300:])
    return json.loads(result.stdout)


for i in range(60):
    try:
        initialized = api("sys/init")["initialized"]
        break
    except (OSError, urllib.error.URLError):
        time.sleep(1)
else:
    raise SystemExit("Vault did not start")
initfile = S / "vault-init.json"
if not initialized:
    initfile.write_text(
        json.dumps(
            api("sys/init", {"secret_shares": 1, "secret_threshold": 1}, method="PUT")
        )
    )
if not initfile.exists():
    raise SystemExit(
        "Existing Vault needs its unseal key. Keep .secrets with its data volumes."
    )
init = json.loads(initfile.read_text())
api("sys/unseal", {"key": init["keys"][0]}, method="PUT")
token = init["root_token"]
for path, data in [
    ("sys/mounts/secret", {"type": "kv", "options": {"version": "2"}}),
    ("sys/auth/approle", {"type": "approle"}),
]:
    try:
        api(path, data, token)
    except urllib.error.HTTPError as e:
        if e.code != 400:
            raise
for service in ["identity", "travel", "payments"]:
    data = {"DB_PASSWORD": config[service], "SERVICE_KEY": config["SERVICE_KEY"]}
    if service == "identity":
        data["ADMIN_PASSWORD"] = config["ADMIN_PASSWORD"]
    if service == "travel":
        data["NEO4J_PASSWORD"] = config["NEO4J_PASSWORD"]
    # Preserve provider credentials when rerunning bootstrap.
    try:
        data = {**api("secret/data/" + service, token=token)["data"]["data"], **data}
    except urllib.error.HTTPError as e:
        if e.code != 404:
            raise
    api("secret/data/" + service, {"data": data}, token)
    api(
        "sys/policies/acl/" + service,
        {"policy": 'path "secret/data/' + service + '" { capabilities = ["read"] }'},
        token,
        method="PUT",
    )
    api(
        "auth/approle/role/" + service,
        {
            "token_policies": [service],
            "token_ttl": "1h",
            "token_max_ttl": "24h",
            "secret_id_ttl": "720h",
        },
        token,
    )
    folder = S / "approle" / service
    folder.mkdir(parents=True, exist_ok=True)
    (folder / "role-id").write_text(
        api("auth/approle/role/" + service + "/role-id", token=token)["data"]["role_id"]
    )
    (folder / "secret-id").write_text(
        api("auth/approle/role/" + service + "/secret-id", {}, token)["data"][
            "secret_id"
        ]
    )
publish_runtime_exports(S)
print("Bootstrap complete. Login details: .secrets/admin-login.txt")
print("Run docker compose up -d --build to start the dashboard and service replicas.")
