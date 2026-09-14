# Docker reinstall and Travel Plan recheck

14 September 2026. **Docker is repaired; Travel Plan is not yet fully rechecked or ready for submission.**

## What happened

The coordinated Neo4flix task reinstalled Docker Desktop 4.90.0. Its keep-data uninstall nevertheless removed the old Docker data disk. No PostgreSQL/Neo4j dump was found in Travel Plan's repository or task workspace. Source archives are not database backups. Source, the Git remote and local `.secrets/` files survived, but old records have not been recovered. The user approved finishing a fresh installation with initial project data after being told about the loss.

This task independently confirmed Engine 29.7.2, 4,108,664,832 bytes of Docker memory and no running containers at handoff. Approximately 77 GB of disk space was free. The first fresh Maven build failed PKIX verification; a temporary build trust store now adds the existing approved PEM roots without changing global trust or disabling TLS checks.

The corrected startup advanced through image builds and reached PostgreSQL. The user then requested Neo4flix only, left open for viewing. Travel Plan's launcher was stopped, its residual healthy PostgreSQL container was cleanly stopped, and a final project-filtered check found no running Travel Plan containers. The fresh PostgreSQL volume remains. No complete post-reinstall Vault/application startup, live browser pass or database restore test is claimed.

## Checks actually completed

| Check | Result |
| --- | --- |
| Reinstalled engine | Responsive, version 29.7.2 |
| Current Python provisioning/build/verifier suite | 24 passed; five POSIX checks skipped; 29 collected |
| Java build trust helper | Compiles for Java 17; valid root merge passes; empty/invalid bundles fail; base store remains unchanged |
| Configuration contracts | 38 passed without daemon contact; current Ansible execution not run |
| New database E2E source | TypeScript and formatting pass; all seven Chrome scenarios collect |
| Fresh complete startup and live E2E | Pending; stack paused for Neo4flix |
| Fresh database backup/restore | Prepared but not executed |

Application baseline `5e5e1fb` retains 76 passing Java tests, 62 frontend tests, production builds and portable Chrome/Firefox design evidence. Product source is unchanged. Those results do not prove a running post-reinstall backend. See FINAL-AUDIT.md and TEST-MATRIX.md for the complete assignment matrix and provenance.

## Resume when capacity is available

Keep the current WSL allocation and the user's active app undisturbed. From the Travel Plan checkout, once a test window is available:

```sh
python scripts/start.py
python scripts/verify-infrastructure.py
python scripts/verify-logging.py --service-logs-only
cd dashboard
node node_modules/@playwright/test/cli.js test --project=chrome
node node_modules/@playwright/test/cli.js test --project=firefox
```

On this inspected network, set `BUILD_CA_FILE` to the existing approved public PEM bundle before the build. Use the installed compatible Firefox runtime; WSL Firefox and its environment are separate from Windows Chrome. Full browser checks include the two database scenarios. They create unique temporary records and clean them up; their stored-deadline changes affect only those fixtures.

After the single-replica checks, save a PostgreSQL custom-format dump and Vault Raft snapshot outside Docker, retain the matching private credentials securely, and verify restoration in an isolated database. No Travel Plan backup has been created since reinstall. Then use a suitable test window/host for two replicas, the explicit failover probe, centralized Loki ingestion, actual Jenkins/Sonar and Ansible deployment. Remote PR/protection, independent approval and owner payment sandbox verification remain separate gates. The existing scheduled follow-up is paused while Neo4flix remains open.
