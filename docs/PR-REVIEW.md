# Draft: Travel Plan admin platform and deployment foundation

Prepared review description; a remote PR has not been created or independently approved.

Adds Java identity, travel and payment administration services with PostgreSQL persistence, an idempotent Neo4j outbox, server sessions, RBAC and CSRF protection. The responsive Atlas dashboard shares its TP logo, controls, forms and native-scroll scenes across every page.

The deployment uses internal TLS, scoped Vault configuration, separate SQL runtime roles and two Java replicas behind Caddy. Read-only session checks now balance across identity replicas, and temporary authentication outages preserve browser state while rejecting protected operations. Jenkins uses a dedicated unprivileged build agent; Ansible supports a separate verified workstation deployment.

Validation: Jenkins candidate build 6 passed 78 Java, 63 frontend and 29 Linux provisioning tests, production build/format/audit checks and configuration/Ansible checks. The strengthened Sonar gate passed with zero detected bugs or vulnerabilities. Current live Chrome (seven scenarios), Firefox workspace (five), database/TLS, centralized tracing, replica failover, Ansible deployment and isolated PostgreSQL/Vault restore checks passed. See FINAL-AUDIT.md for measured failures/recovery and exact source provenance.

Remaining gates: Git-host SCM-triggered PR checks/protection and independent approval; owner Stripe/PayPal sandbox connection tests; scoped Neo4j runtime privileges; independent-host infrastructure HA and production capacity/backup operation. This single-host deployment and local candidate job do not satisfy those external gates. No merge or public deployment is claimed.
