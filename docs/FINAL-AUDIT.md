# Travel Plan — submission audit

14 September 2026. This is a code review and local verification record, not an independent human PR approval.

**The application and local checks pass. Full assignment sign-off remains pending live deployment evidence, high availability, Neo4j least privilege and independent PR approval.** The earlier feature-unit and partial-service-refresh gaps have been addressed. A portable preview does not establish that the Java services are running.

## Fresh verification

- **76 Java tests passed**, with zero failures, errors or skips; all service packages built. JaCoCo reports **436/455 lines (95.8%)** and **158/176 branches (89.8%)** covered. Tests include real Spring transaction interception and mocked database/provider boundaries.
- **62 frontend unit tests passed**, plus TypeScript/Vite production build and formatting. Form payloads, calendar dates, API failures/timeouts, partial availability and stale session/request guards have focused coverage.
- **16 Python tests passed on native Linux temporary files** through WSL. Windows runs 11 and explicitly skips five POSIX permission checks. The tests never touch real credentials, containers or business records.
- **37 Compose/CI configuration contracts passed**, including the credential-free image build model. An actual **Ansible syntax check passed** with ansible-core 2.19.0 and community.docker 5.3.0, using the example inventory without host contact.
- Current npm audit reported **zero vulnerabilities**. This does not establish Java, container or OS vulnerability clearance.
- Final Chrome and Firefox results accompany the handoff: eight portable admin regression flows and 55 scroll/layout/accessibility cases per browser. Review the machine-readable results for execution status. Linux Firefox uses the CSS photographic globe fallback; Firefox WebGL and physical phones are not validated.

The [feature test map](TEST-MATRIX.md) names the tests for each feature and distinguishes unit assertions, portable browser behavior and live integration requirements. The [infrastructure gates](INFRASTRUCTURE-GATES.md) give reproducible commands and exact evidence limits.

## Corrections completed in this follow-up

| Problem | Result |
| --- | --- |
| Controller, provider and frontend feature units were sparse | Added user/session/security, travel persistence/transaction, gateway/provider HTTP, graph outbox, form, calendar, API and refresh suites. Coverage is measured, not inferred from the preview. |
| One failed service discarded healthy dashboard responses | Each healthy response publishes independently. Failed services retain the previous same-session cache; named errors support retry. Session and refresh revisions suppress stale responses. |
| A stalled request could leave loading active indefinitely | The API aborts connection and response-body reads after 15 seconds, clears its timer and supplies a recoverable error. Timeout tests preserve the existing late-401 session guards. |
| Travel reads made extra queries for every trip | Parent, stop and membership data now use three batch queries. A read-only repeatable-read transaction keeps them in one snapshot during concurrent edits. |
| Calendar grouping could shift a day in distant time zones | Local date keys replace UTC conversion; month, leap-day, overlap and UTC+14 regressions pass. |
| Password forms accepted values BCrypt could not hash | Client and server enforce the 72-byte UTF-8 limit without truncation. ASCII and multibyte create/reset boundaries are tested, along with oversized login rejection. |
| Infrastructure checks were difficult to reproduce | Added the pre-submit runner, configuration/Ansible checker, authenticated correlation/Loki verifier and explicitly opted-in Java replica failover verifier. JSON reports distinguish failed, passed and unverified work. |
| Cleanup failure could leave a verifier reporting success | Failover/logging success is recorded only after cleanup succeeds. Mocked preflight, interruption, restoration and cleanup failures cannot leave stale success reports. |
| Browser collection could hang or leave an old success report | Consistency checks use fresh browser processes, bounded readiness/evaluation waits, active-stage diagnostics and an incomplete report from startup. Success requires all 30 screens and completed cleanup. Final Chrome and isolated Firefox runs passed. |
| New verification was not connected to delivery | Jenkins now requires manifest/Ansible syntax checks, formats the browser suites, and runs TLS plus service-log correlation in its trusted integration stage. Actual pipeline execution remains pending. |

Earlier fixes remain in place: durable bootstrap-admin initialization, null-stop validation, private Linux provisioning files, honest gateway configuration badges, preserved price cents, active-profile refresh, complete session draft/cache cleanup, secret-free PR builds and main-only Community Sonar analysis. The shared Atlas design, logo and always-enabled motion are preserved.

## Assignment matrix

| Requirement | Result and evidence still needed |
| --- | --- |
| Java microservices | Implemented: identity, travel and payments with separate images and internal HTTPS; shared security library and ownership-separated SQL schemas. |
| Replicas, balancing and failover | Base Compose declares two of every Java service; the laptop override has one. Caddy balances upstreams. Execute the new continuity probe on a healthy replicated deployment before claiming measured failover. |
| PostgreSQL and Neo4j containers | Persistent, internal and TLS-configured. Current live recheck is blocked by Docker startup. Both databases remain single instances. |
| Jenkins and SonarQube | Pipeline and tools configuration supplied; local configuration checks pass. Connect the actual build agent/Sonar server and retain a successful run and gate result. Community analysis is main-only, not a pre-merge PR Sonar gate. |
| Docker and Ansible | Four Compose models validate; real Ansible syntax passes. A completed remote deployment has not been demonstrated. |
| Cross-service logging | Sanitized request IDs, JSON service logs and TLS Loki collection are implemented. Unit correlation tests pass. Live target/identity correlation and centralized ingestion still require the deployment. |
| User, travel and payment-method CRUD | Implemented and covered by feature units and portable forms. Role/status/password updates, ordered destinations, dates/duration, activities, accommodation, transport and participant assignments are included. |
| Cascading updates/deletes | SQL foreign keys, transactional child replacement, immutable IDs and graph outbox are implemented. Fresh actual PostgreSQL cascade/rollback and graph relationship/update/delete convergence checks remain pending. |
| Stripe and PayPal | Gateway metadata CRUD and sandbox credential verification are implemented and HTTP request/error contracts are tested. Owner sandbox credentials have not been verified. Checkout/capture/refunds/webhooks remain phase-two work. |
| Authentication and RBAC | Sessions, hashing, cookies, CSRF/origin checks, role checks, revocation and login-attempt bookkeeping have unit coverage. Live TTL boundaries, throttle timing and current deployment enforcement remain integration checks. |
| Responsive Chrome / Firefox UI | Portable suites cover desktop/mobile pages, Home scroll scenes, forms and keyboard behavior with automated axe/overflow checks. This is not a claim of a full manual accessibility certification. |
| Unit tests for features | Major phase-one behavior now has named unit coverage; see TEST-MATRIX.md. 95.8% Java line coverage is not 100% behavior coverage, and mocked persistence does not prove the deployed database. |
| PRs, code reviews and approved merges | Local feature branch, template and review guidance exist; this pass included cross-review. Git-host branch protection, a remote PR and an independent human approval are not verified. Nothing was pushed or merged. |
| TLS and private networking | Configuration and request construction verified locally; actual service/SQL/Bolt trust chains need the live infrastructure probe. |
| Vault and least privilege | Scoped AppRoles and PostgreSQL owner/runtime roles are implemented. Neo4j Community implies admin privileges; a differently named Community user does not solve this. Optional runtime URI/username configuration allows a future approved deployment. |
| High availability | Not complete: PostgreSQL, Neo4j, Vault, ingress and the Docker host remain single points of failure. Replicated Java services alone do not satisfy end-to-end HA. |
| Regular patching and package justification | Renovate/audit gates and package/asset decision documentation supplied. Whole-stack patch review remains an ongoing operation. |
| Documentation / integration bonus | Architecture, schema, API, security, delivery, test map and verification procedures supplied. Live E2E cases exist but have not run against this revision. Kubernetes is optional and is not implemented. |

## Remaining submission gates

1. Use a working Docker test environment with sufficient disk capacity. This laptop's supported Docker start attempt failed on `sailor-ingest.sock`; no reset, database deletion or previously rejected socket cleanup was performed. Rerun bootstrap migration/concurrent initialization, TLS, cascades and current live browser tests there.
2. Execute Jenkins/Sonar and Ansible, verify centralized logs, and retain measured Java replica failure/recovery results. Provision and test redundant database, Vault and ingress services before claiming high availability.
3. Use an owner-approved Neo4j deployment that supports scoped runtime roles. Community's implicit administrative privileges cannot meet that portion of least privilege. [Neo4j user privileges](https://neo4j.com/docs/operations-manual/current/authentication-authorization/manage-users/).
4. Verify the owner's Stripe/PayPal sandbox credentials through the protected provider endpoint; establish branch protection and obtain independent PR approval before merging or submitting a claim of full compliance.

Lists remain unbounded. The three-query read removes the N+1 issue, but server-side pagination and catalogue-scale performance testing remain appropriate before large deployments. Graph node counts alone do not prove relationship content or update/delete convergence. The current live browser expiry scenario simulates the UI expiry event; actual server TTL boundaries need separate live evidence.

## Required upgrade step

Run `python scripts/bootstrap.py` before starting updated identity replicas against an existing database. It applies the idempotent `003-runtime-privileges.sql` upgrade and backfills the durable initialization marker, preventing a deleted bootstrap administrator from returning after restart. Ansible already runs it. Plain Compose startup does not migrate an existing volume. Preserve the database.

## Reproduce and review

`python scripts/pre-submit.py --offline` runs the local checks with cached Maven dependencies. Install Ansible and its declared collection, or select its executable with `--ansible`. Native Linux is required for the POSIX checks and the Ansible controller. Retain both browser reports; optional live and failover flags are documented in TEST-MATRIX.md and INFRASTRUCTURE-GATES.md.

The current Sonar Community limitations and provider scope are described in [delivery](DELIVERY.md) and [operations](OPERATIONS.md), based on [Sonar's comparison](https://docs.sonarsource.com/sonarqube-community-build/feature-comparison-table.md), [Stripe keys](https://docs.stripe.com/keys) and [PayPal authentication](https://developer.paypal.com/api/rest/authentication).

No push, merge, external message, paid activation or public deployment was performed. The source archive excludes secrets, dependencies, databases and generated builds.
