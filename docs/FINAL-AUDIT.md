# Travel Plan — final requirements audit

14 September 2026. This is an implementation review and local verification record, not an independent PR approval.

**Verdict: the project is substantially implemented, but it cannot yet be described as satisfying every assignment requirement.** The dashboard and Java services exist and build; the remaining mandatory gaps concern complete feature unit coverage, live delivery/infrastructure evidence, end-to-end availability, and database least privilege. A polished portable preview does not establish that the services are running.

## Checks completed on 14 September

- Maven offline `verify`: **26 Java tests passed**, all service packages built.
- Vitest: **12 frontend tests passed**; TypeScript/Vite production build and frontend formatting passed.
- Native Linux provisioning tests: **6 passed**, using isolated temporary fixtures. No real secrets were modified.
- Chrome and Firefox: **5 admin form/regression flows passed per browser**, covering user creation/edit/status/deletion, gateway creation/edit/deletion, fractional prices, active-account edits and expiry cleanup. These use fictional portable data.
- Refreshed Chrome/Firefox visual consistency: **60 screens total**, zero reported axe violations or document overflow, including desktop/mobile pages, lower Home, forms and login.
- Compose runtime/tools configuration and a secret-free build model validated. The live E2E suite successfully listed **10 browser cases**; listing is not execution.
- Current npm audit: **0 reported vulnerabilities**. This does not cover the full Java/container/OS stack.

The earlier 110-case scroll/design record remains historical evidence. Motion code was unchanged in this audit; the form and consistency suites above were rerun against the new exported interface.

## Defects corrected during this audit

| Defect | Correction and evidence |
| --- | --- |
| Deleted bootstrap administrator returned after an identity restart | Durable `identity.bootstrap_state`, a transaction advisory lock, atomic first initialization, and an idempotent existing-store upgrade. Four focused Java regressions cover initial creation, deletion/restart, existing accounts and failed insertion. |
| A null itinerary element reached persistence and caused a server error | Container-element `@NotNull` validation and a real Bean Validation regression reject `stops: [null]`. |
| Clean CI container builds depended on absent runtime credentials | `compose.build.yml` contains only image/build declarations. Its four image tags, contexts, Dockerfiles and arguments match the runtime model. Empty-environment Compose validation passes. |
| Community Sonar analysis ran on PR/feature jobs | Both analysis and quality-gate waiting are scoped to main. PR Java/frontend/build/format/dependency checks remain. Community does not provide a pre-merge PR analysis gate; the deployment documentation now states this explicitly. |
| Stored fractional travel prices were displayed rounded to whole dollars | Currency formatting preserves cents; whole-dollar prices retain their compact formatting. |
| Editing the active account left sidebar/settings identity stale | Refresh reconciles the active name, email and role while preserving the session CSRF token. |
| Credential presence was labelled as a verified connection | Gateway badges now say Configured / Not configured; provider verification remains an explicit separate action. |
| Session-owned drafts and cached records could survive expiry/logout | Session cleanup clears dialogs, cached data and workspace state. Session revisions prevent old refresh/save/delete completions from restoring previous data. Late 401 handling is tested separately. |
| Linux provisioning secrets could inherit permissive host modes | A private host secret directory and restrictive operator-file permissions are enforced while retaining the scoped files that containers must read. POSIX tests verify behavior. |
| Ansible claimed wider OS support than its package recipe supplied | Provisioning now explicitly targets the supported Ubuntu releases documented in the playbook. |

## Requirement-by-requirement result

| Assignment requirement | Assessment | Evidence / remaining work |
| --- | --- | --- |
| Java microservices | Implemented | Identity, travel and payments modules; shared security library; independent service images and internal HTTPS APIs. A shared PostgreSQL cluster with ownership-separated schemas is a documented cascade/consistency tradeoff. |
| Multiple replicas, balancing, failover and high availability | Partial | Base Compose declares two of each Java service; laptop profile uses one. Caddy discovers upstreams. No measured replica failover/recovery run is recorded; PostgreSQL, Neo4j, Vault and ingress remain single instances. |
| Containerized PostgreSQL and Neo4j | Implemented configuration; live recheck unavailable | Images, persistent volumes, internal networks and TLS configuration exist. Prior application tests used the databases. Docker is currently unavailable, so no new live database result is claimed. |
| Jenkins CI and unit testing | Implemented configuration; execution pending | Pipeline builds/tests Java and frontend, audits dependencies, builds images, and supplies trusted integration/staging stages. A configured agent, reachable controller and successful pipeline run are still needed. |
| SonarQube quality checks | Partial | Community analysis and quality gate are configured for main. No successful live quality-gate execution is recorded. Full PR analysis requires a supported Sonar offering and CI configuration; no purchase or license activation was performed. |
| Docker and Ansible deployment | Implemented configuration; execution pending | Runtime/build Compose models and an Ubuntu provisioning/deployment playbook exist. No completed remote Ansible deployment is recorded. |
| Cross-service logging | Implemented; centralized ingestion pending | Sanitized request IDs flow from travel/payment calls into identity verification; JSON logs include request/actor context. TLS Loki/Grafana collection is configured. No fresh centralized ingestion/correlation result is claimed. |
| User CRUD, roles and account status | Implemented | API and UI support creation/editing/deletion, role/status changes and password resets. SQL deletion cascades sessions and memberships; server-side rules protect remaining admin access. Full live UI submission coverage remains incomplete. |
| Travel CRUD and all required details | Implemented | Multiple ordered destinations, dates, duration, activities, accommodation and transportation; transactional child replacement, memberships, optimistic versions and graph projection. |
| Payment-method administration | Implemented phase-one scope; provider credentials unverified | Stripe/PayPal gateway metadata CRUD and sandbox credential probes exist. No owner sandbox credentials were used in this audit. Checkout/capture/refunds/webhooks remain documented phase-two work; this audit treats the present scope as gateway administration. |
| Cascading update/delete | Implemented; latest live regression pending | SQL foreign keys cascade users/trips into dependent rows and null historical payment references; travel edits replace children atomically; immutable IDs avoid primary-key rewrite ambiguity. A durable graph outbox projects deletion. |
| Authentication and authorization | Implemented; tests incomplete | Hashed opaque sessions, BCrypt, secure cookies, exact-origin and CSRF checks, request-time role enforcement, session revocation and shared login throttling. Backend integration checks need Docker. |
| Responsive UI, Chrome and Mozilla Firefox | Verified portable frontend | Prior full design evidence covers 110 layout/axe cases across both browsers. This audit adds focused admin form and session regressions. Linux Firefox used the CSS globe fallback; Firefox WebGL and physical phones were not validated. |
| Package justification | Documented | `docs/DECISIONS.md` explains React, JDBC, browser dialogs, Lucide, local fonts and test tooling. No new runtime dependency was added for these fixes. |
| Unit tests for every feature | Not satisfied | The suite now covers more regressions, but complete controller persistence/auth/provider behavior, UI CRUD forms, API failure handling and calendar logic do not each have unit coverage. Browser checks do not substitute for this explicit requirement. |
| PR workflow, independent code review and approved merges | Not verified | Feature branch, PR template and review guidance exist. No remote PR, independent reviewer approval or enforced branch protection is recorded. Local self-review cannot provide these. |
| TLS in transit and private services/databases | Implemented configuration; live repeat pending | Gateway/service/PostgreSQL/Neo4j/Vault/provider TLS and internal networks exist. Local browser tests accepting development certificates do not validate the TLS trust chain; use the dedicated infrastructure verifier. |
| Vault secret management | Implemented development setup | Scoped service AppRoles; runtime containers do not receive Vault root tokens. Local operator backups, one-node Vault and one-share unseal custody remain development limits. |
| Least privilege | Partial | PostgreSQL owner/runtime separation and application RBAC are implemented. The Neo4j worker uses administrative credentials, and Community users have implicit admin privileges. A differently named Community user would not resolve this. |
| Regular patching | Process supplied; ongoing duty | Renovate configuration and npm audit gate exist. A current npm dependency audit found zero reported vulnerabilities. Container/OS/Java whole-stack vulnerability clearance is not claimed. |
| Documentation bonus | Implemented | Architecture, schema, API, operations, security, delivery, review and verification documents exist. |
| Kubernetes bonus | Not implemented | Optional; not counted as a mandatory failure. |
| Integration/E2E bonus | Implemented tests; latest live run pending | Source includes live API/browser scenarios, portable form/workflow suites and visual checks. They have distinct scopes and must not be conflated. |

## Current blockers and remaining engineering work

1. Restore a usable Docker runtime and enough working disk space, then rerun authenticated TLS, database cascade, graph projection, the new bootstrap migration and concurrent startup checks. This audit observed no running Docker Linux engine and about 1.1 GB free; it did not delete data or attempt the previously rejected socket cleanup.
2. Execute Jenkins/Sonar and Ansible against a configured test environment, demonstrate log correlation, and exercise replica failure/recovery. Add redundant data/secret/ingress services before claiming high availability.
3. Complete feature-level unit coverage and live person/payment form workflows, and obtain independent PR approval with branch protection.
4. Resolve graph least privilege with a deployment that actually supports scoped roles. Neo4j Community has no roles and gives users implied administrative access. [Neo4j user-management documentation](https://neo4j.com/docs/operations-manual/current/authentication-authorization/manage-users/).
5. Address scale/resilience limits: travel listing makes one parent query plus two queries per travel, lists are unbounded, and a payments-list failure currently rejects the dashboard's combined initial data refresh. These are remaining engineering gaps, not fixed by adding replicas.

## Upgrade requirement

Run `python scripts/bootstrap.py` before starting the updated identity replicas on an existing database. This applies the idempotent `003-runtime-privileges.sql` upgrade and backfills the durable initialization marker. Ansible already invokes bootstrap. A plain `docker compose up` does not apply this upgrade to an existing volume. Preserve the database volume.

## External checks

The current Sonar feature table does not provide Community PR analysis; the pipeline now avoids promising it. [Sonar comparison](https://docs.sonarsource.com/sonarqube-community-build/feature-comparison-table.md).

Provider probe code follows the official server-side authentication mechanisms: Stripe test secret-key authentication and PayPal sandbox client-credential token exchange. Configured strings alone do not demonstrate valid credentials or payment processing. [Stripe API keys](https://docs.stripe.com/keys), [PayPal authentication](https://developer.paypal.com/api/rest/authentication).

Detailed local command results and the source revision accompany the exported audit handoff. No push, merge, external message, paid service activation or public deployment was performed.
