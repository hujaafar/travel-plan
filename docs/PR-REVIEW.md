# Draft: Travel Plan admin platform and deployment foundation

This is a prepared review description. A remote PR has not been created.

The empty repository now contains Java services for people, travel itineraries and Stripe/PayPal gateway administration, with session authentication, RBAC, CSRF protection, PostgreSQL persistence and a Neo4j outbox projection. The responsive dashboard shares one visual system, logo and scroll treatment across the administration experience.

Deployment supplies internal TLS, scoped Vault provisioning, two Java replicas in the base profile, Caddy routing, Jenkins/Sonar configuration, Ansible and request-correlation tools. Startup is staged and bounded. An optional public CA bundle supports inspected build networks through temporary trust stores while retaining TLS checks.

## Validation

- [x] Unchanged application baseline: 76 Java tests, 62 frontend tests, production builds and portable Chrome/Firefox checks passed.
- [x] Current source verification: 24 Python tests passed, five POSIX cases skipped; Java 17 trust-helper fixtures and 38 configuration contracts passed.
- [x] Two new persistence/security E2E scenarios compile; all seven Chrome scenarios collect.
- [ ] Full post-reinstall startup and live tests: pending while the user keeps Neo4flix running on the shared 4 GB Docker runtime.
- [ ] Actual Jenkins/Sonar, Ansible deployment, centralized ingestion and measured replica failover: pending.
- [ ] Owner sandbox verification, supported scoped Neo4j privileges, redundant infrastructure and recovery evidence: pending.
- [ ] Remote PR, branch protection and independent human approval: pending; no merge performed.

Docker's uninstall lost its old database disk despite keep-data. Fresh startup reached PostgreSQL after a Maven trust fix, then was stopped for the user's other application. No old data recovery or completed post-reinstall backup/restore is claimed. Prior build/bootstrap/Linux results remain historical evidence. See FINAL-AUDIT.md and DOCKER-RECHECK.md.

The source is backed up on the course repository's `feature/admin-platform` branch, with its remote revision verified. The repository API previously returned 403. Keep the change unmerged until the applicable runtime, security and review gates are complete.
