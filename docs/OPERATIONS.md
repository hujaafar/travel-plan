# Operations

## Start, stop, and inspect

```powershell
python scripts/bootstrap.py
docker compose -f compose.yml -f compose.local.yml up -d --build --wait --wait-timeout 240
docker compose ps
docker compose logs --since 5m identity travel payments
docker compose stop
```

Stopping preserves data. Do not run `down -v` unless intentionally destroying the development databases and Vault. After restarting Vault, run bootstrap to unseal it before starting the agents. The startup script does this. App processes wait for scoped configuration before launching; readiness probes are HTTPS.

For the 14 September identity update, run `python scripts/bootstrap.py` before starting new identity replicas. Its idempotent database upgrade adds/backfills `identity.bootstrap_state`, which prevents a restart from recreating a deleted bootstrap administrator. The Ansible playbook runs this upgrade automatically. Starting Compose alone does not apply it to an existing database; preserve the database volume.

## Local TLS

The generated development root is `.secrets/ca.crt`. The application does not silently install a root certificate in Windows. You may import that certificate into your own development browser/OS trust store after inspecting its identity. Alternatively, inspect the local development certificate warning when opening localhost. Do not use this development CA for public deployments.

Some antivirus products replace even localhost certificates. The setup script therefore talks to Vault through a short-lived Python container on the private Docker network, with certificate and hostname verification enabled. Browser tests accept local certificate errors only within their isolated test contexts. Internal application traffic verifies certificates normally.

Certificates include SANs, key usage, extended usage, subject/authority identifiers and expiry. Each service receives only its own private certificate and a trust store containing public roots plus the development CA. Bootstrap renews certificates approaching expiry; restart affected services after renewal so they load the new certificate. Keep the CA private key out of Git.

## Vault

Vault runs with TLS and a persistent integrated Raft store. A development one-share unseal key and root token are stored in `.secrets/vault-init.json`. This is a convenience for a local assignment deployment, not a production key-custody design. Use a managed KMS auto-unseal setup and separate operator custody in production.

Each service agent authenticates with its own AppRole, reads only `secret/data/<service>`, and renders a properties file into a read-only application volume. Runtime Java services do not receive a Vault root token. After secret rotation, restart the Java service so Spring reloads properties. Agent credentials expire after 30 days; rerun bootstrap to renew them.

Bootstrap also retains the local provisioning credentials in ignored `.secrets/bootstrap.json`. Restrict access to that directory and back it up securely with the corresponding Vault data. All of these files are excluded from the source archive.

## Stripe and PayPal

Use the authenticated Vault UI at `https://localhost:18200` or Vault CLI. In KV v2 at `secret/payments`, preserve `DB_PASSWORD` and `SERVICE_KEY`, then add:

- `STRIPE_SECRET_KEY`: a Stripe **test** key beginning with `sk_test_`.
- `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET`: credentials from a PayPal sandbox application.

Restart the payments service after the agent has rendered the change. Open Payments and choose **Test connection**. Stripe verifies through `/v1/balance`; PayPal exchanges the client credentials at its sandbox OAuth endpoint. Outbound requests have connection and response timeouts. Raw provider error bodies and credential values are not returned to the browser. Live Stripe keys are rejected.

Read the official [Stripe development documentation](https://docs.stripe.com/development) and [PayPal authentication documentation](https://developer.paypal.com/api/rest/authentication/). Phase two should use hosted payment flows, verified webhooks, idempotency keys, authoritative amounts, and a proper payment state machine.

## Logs

All Java requests produce JSON logs containing service name, request ID, method, path, status, latency and authenticated actor ID. A sanitized `X-Request-ID` is propagated into the identity service during session verification. Passwords and session cookies are not intentionally logged.

```powershell
docker compose -f compose.yml -f compose.tools.yml --profile monitoring up -d --build loki log-collector grafana
```

Grafana is at `https://localhost:13443`; username `admin`, password `GRAFANA_ADMIN_PASSWORD` in the local provisioning file. Explore the preconfigured Loki datasource with `{project="travel-plan"}` or `{service="travel"}` and search a request ID. Collection begins when the collector starts; earlier logs remain available through Docker. The collector retries briefly but is not a durable audit ledger. The Docker socket is privileged even when its bind mount is read-only: deploy this collector only on a trusted host.

## Backups and recovery

Use PostgreSQL `pg_dump -Fc` and restore into a separate clean database to test it. On PowerShell, redirect binary output through a binary-safe Python subprocess or a file inside the container; avoid text pipelines. Back up `.secrets/` through an encrypted, access-controlled channel. Use Vault Raft snapshots after unsealing. Neo4j's graph can be rebuilt from PostgreSQL by enqueuing all current travel IDs, but take a Neo4j database dump if other graph data is introduced.

No backup policy is claimed to be in place until a restore has been tested. The current development deployment uses named volumes on one Docker host.

## Graph connection on an approved deployment

The travel service accepts optional `NEO4J_URI` and `NEO4J_USERNAME` properties. Defaults remain `bolt+s://neo4j:7687` and the local `neo4j` account; the password continues to come from the existing scoped Vault configuration. Supply these settings to the service through the approved deployment configuration, preserve a verified-TLS URI and trusted certificates, and use a scoped runtime account only on a Neo4j offering that supports it. Renaming a Community account does not remove its implied admin privileges. No alternate database or license was activated in this pass.
