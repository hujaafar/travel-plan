# Travel Plan — submission audit

14 September 2026. This is a code review and local verification record, not an independent human PR approval.

**Not ready for full assignment sign-off. Docker was reinstalled and responds again. Travel Plan's live recheck is paused because the user requested that Neo4flix remain running on this shared 4 GB Docker runtime.** CI execution, live database/TLS/browser/failover verification, high availability, Neo4j least privilege, provider verification and independent PR approval remain open.

## Docker reinstall and current recheck

- Docker Desktop 4.90.0 was reinstalled by the coordinated Neo4flix task. This task independently verified Docker Engine **29.7.2**, approximately 3.83 GiB available to Docker, and zero running containers at handoff.
- **The uninstall removed the old Docker database disk despite the keep-data option. No Travel Plan database export was found.** Source and host-side credentials survived; the previous database records were not recovered. The user approved fresh initial data through the reinstall task.
- The first clean-cache build failed Maven certificate verification through the host's HTTPS inspection software. The fix merges the already trusted public PEM bundle with the JDK's normal roots in a temporary build mount. TLS verification stays enabled; neither the supplied bundle nor the temporary store is copied into the application image.
- The corrected startup advanced through image builds and reached fresh PostgreSQL bootstrap. When the user requested Neo4flix for live viewing, the Travel Plan launcher was stopped. A residual healthy PostgreSQL container was then cleanly stopped with its new volume preserved. A project-filtered check confirmed **no running Travel Plan containers**. A complete successful startup was not recorded.
- **29 Python tests were collected: 24 passed and five POSIX permission tests were skipped on Windows.** New JDK-backed tests prove public-root preservation, unchanged base stores and rejection of invalid/empty bundles. Python compilation and **38 configuration contracts** passed. The current Ansible controller was not run while WSL operations were paused.
- Two new local database E2E scenarios cover stored session/throttle deadlines, SQL rollback, transaction-history references, graph properties/ordered relationships, duplicate outbox replay and deletion convergence. TypeScript validation and collection of all seven Chrome scenarios passed. **These new live scenarios have not run.** Advancing only fixture deadlines is not an eight-hour/fifteen-minute wall-clock timing test.
- The source is backed up on `feature/admin-platform`; the remote revision is verified during packaging. PR creation/protection and independent approval remain pending. The existing follow-up automation is paused so it cannot interrupt the active Neo4flix viewing session.

See [Docker recheck](DOCKER-RECHECK.md) for the incident, current state and next commands. The Java application and dashboard product source remain unchanged from baseline `5e5e1fb7ed9176696d186850862f2eb106f4fdfa`; the retained results below are not fresh runtime results.

Before the reinstall, all four images and Vault/bootstrap had passed during a responsive interval, then Docker hung and two live Chrome navigations timed out. Those earlier observations and build logs remain historical evidence only. The old database contents and image cache did not survive the uninstall.

## Verified application baseline

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
| PostgreSQL and Neo4j containers | Both databases are containerized single instances. Fresh PostgreSQL reached healthy status after reinstall and is now stopped; full bootstrap, Neo4j and live persistence verification remain pending. |
| Jenkins and SonarQube | Pipeline and tools configuration supplied; local configuration checks pass. Connect the actual build agent/Sonar server and retain a successful run and gate result. Community analysis is main-only, not a pre-merge PR Sonar gate. |
| Docker and Ansible | The rebuild reached database bootstrap; 38 current configuration contracts passed. Earlier Ansible syntax passed, but no current Ansible deployment or complete post-reinstall startup has been demonstrated. |
| Cross-service logging | Sanitized request IDs, JSON service logs and TLS Loki collection are implemented. Unit correlation tests pass. Live target/identity correlation and centralized ingestion still require the deployment. |
| User, travel and payment-method CRUD | Implemented and covered by feature units and portable forms. Role/status/password updates, ordered destinations, dates/duration, activities, accommodation, transport and participant assignments are included. |
| Cascading updates/deletes | SQL foreign keys, transactional child replacement, immutable IDs and graph outbox are implemented. The new database E2E scenarios cover PostgreSQL cascade/rollback and graph relationship/update/delete convergence; execution remains pending. |
| Stripe and PayPal | Gateway metadata CRUD and sandbox credential verification are implemented and HTTP request/error contracts are tested. Owner sandbox credentials have not been verified. Checkout/capture/refunds/webhooks remain phase-two work. |
| Authentication and RBAC | Sessions, hashing, cookies, CSRF/origin checks, role checks, revocation and login-attempt bookkeeping have unit coverage. Live TTL boundaries, throttle timing and current deployment enforcement remain integration checks. |
| Responsive Chrome / Firefox UI | Portable suites cover desktop/mobile pages, Home scroll scenes, forms and keyboard behavior with automated axe/overflow checks. This is not a claim of a full manual accessibility certification. |
| Unit tests for features | Major phase-one behavior now has named unit coverage; see TEST-MATRIX.md. 95.8% Java line coverage is not 100% behavior coverage, and mocked persistence does not prove the deployed database. |
| PRs, code reviews and approved merges | The feature branch is pushed to the course repository and verified remotely. Review guidance and the earlier code cross-review remain available. Git-host branch protection, a remote PR and independent human approval are still pending. No merge was performed. |
| TLS and private networking | Configuration and request construction verified locally; actual service/SQL/Bolt trust chains need the live infrastructure probe. |
| Vault and least privilege | Scoped AppRoles and PostgreSQL owner/runtime roles are implemented. Neo4j Community implies admin privileges; a differently named Community user does not solve this. Optional runtime URI/username configuration allows a future approved deployment. |
| High availability | Not complete: PostgreSQL, Neo4j, Vault, ingress and the Docker host remain single points of failure. Replicated Java services alone do not satisfy end-to-end HA. |
| Regular patching and package justification | Renovate/audit gates and package/asset decision documentation supplied. Whole-stack patch review remains an ongoing operation. |
| Documentation / integration bonus | Architecture, schema, API, security, delivery, test map and verification procedures supplied. The prior live E2E attempt timed out; the post-reinstall run is paused for the other app's viewing session. Kubernetes is optional and is not implemented. |

## Remaining submission gates

1. Resume Travel Plan only when runtime capacity is released or a suitable test host is available. Rebuild from the final source, finish fresh provisioning, then verify concurrent initialization, TLS, persistence and both live browser suites. Save host-side database/Vault backups and test restoration. Do not stop the user's active Neo4flix session or reset Docker again.
2. Execute Jenkins/Sonar and Ansible, verify centralized logs, and retain measured Java replica failure/recovery results. Provision and test redundant database, Vault and ingress services before claiming high availability.
3. Use an owner-approved Neo4j deployment that supports scoped runtime roles. Community's implicit administrative privileges cannot meet that portion of least privilege. [Neo4j user privileges](https://neo4j.com/docs/operations-manual/current/authentication-authorization/manage-users/).
4. Verify the owner's Stripe/PayPal sandbox credentials through the protected provider endpoint; establish branch protection and obtain independent PR approval before merging or submitting a claim of full compliance.

Lists remain unbounded. The three-query read removes the N+1 issue, but server-side pagination and catalogue-scale performance testing remain appropriate before large deployments. Graph node counts alone do not prove relationship content or update/delete convergence. The existing browser expiry case simulates the UI event. The new database fixture checks stored TTL/throttle boundaries and expired-deadline enforcement; it still requires execution.

## Required upgrade step

Run `python scripts/bootstrap.py` before starting updated identity replicas against an existing database. It applies the idempotent `003-runtime-privileges.sql` upgrade and backfills the durable initialization marker, preventing a deleted bootstrap administrator from returning after restart. Ansible already runs it. Plain Compose startup does not migrate an existing volume. Preserve the database.

## Reproduce and review

`python scripts/pre-submit.py --offline` runs the local checks with cached Maven dependencies. Install Ansible and its declared collection, or select its executable with `--ansible`. Native Linux is required for the POSIX checks and the Ansible controller. Retain both browser reports; optional live and failover flags are documented in TEST-MATRIX.md and INFRASTRUCTURE-GATES.md.

The current Sonar Community limitations and provider scope are described in [delivery](DELIVERY.md) and [operations](OPERATIONS.md), based on [Sonar's comparison](https://docs.sonarsource.com/sonarqube-community-build/feature-comparison-table.md), [Stripe keys](https://docs.stripe.com/keys) and [PayPal authentication](https://developer.paypal.com/api/rest/authentication).

The checked source was pushed only to `feature/admin-platform` in the existing course repository. No merge, reviewer message, paid activation or public application deployment was performed. The source archive excludes secrets, dependencies, databases and generated builds.
