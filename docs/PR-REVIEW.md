# Draft: Travel Plan admin platform and deployment foundation

This is a prepared review description. A remote PR has not been created.

## Problem and resulting behavior

The initial repository was empty. This change adds a Java admin platform for
people, travel itineraries and Stripe/PayPal gateway administration, with
authenticated roles, CSRF protection, PostgreSQL persistence and a Neo4j outbox
projection. The responsive dashboard uses a shared visual system and scroll
scenes across its landing experience and administration pages.

Deployment includes containerized services/databases, scoped Vault provisioning,
internal TLS, two Java replicas in the base profile, Caddy routing, Jenkins/Sonar
configuration, Ansible provisioning, and request-correlation/logging tools.
The laptop startup path builds sequentially and waits for real readiness.

## Validation

- [x] Java tests and dashboard build pass: unchanged application baseline has
  76 Java tests and 62 frontend tests; four application Docker images also built.
- [ ] Relevant live integration and browser tests pass: portable Chrome/Firefox
  checks passed, but live Chrome navigation failed while Docker was unresponsive.
- [ ] SonarQube quality gate passes: execution is pending.
- [ ] Schema, permissions, secrets and deletion behavior reviewed: unit/config
  checks and the bootstrap migration passed; complete live cascade/graph and
  scoped Neo4j privilege verification remain open.
- [x] Documentation updated with the exact evidence and unresolved requirements.

Current provisioning verification: 22 Windows Python tests passed, five POSIX
tests skipped, and 38 configuration contracts passed. A new Linux/Ansible run
is pending because WSL did not start. Earlier native Linux and Ansible syntax
results are retained as baseline evidence, not a successful rerun.

## Review

Keep this work unmerged until live checks, the required infrastructure/security
gates, branch protection and an independent reviewer approval are complete.
The existing course repository contains `feature/admin-platform`; its API
returned 403, so remote PR/protection setup remains pending. No approval has
been fabricated. See FINAL-AUDIT.md and INFRASTRUCTURE-GATES.md for the full list.
