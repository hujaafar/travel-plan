# Travel Plan — submission audit

17 September 2026. **The local application and candidate CI review are verified. Full assignment sign-off remains open for Git-host PR automation/independent approval, owner payment sandbox verification, supported Neo4j least privilege and infrastructure high availability.** This report is not an independent human approval.

## Executed checks

| Check | Observed result |
| --- | --- |
| Java | 78 tests passed; no failures, errors or skips. JaCoCo: 439/456 lines (96.3%), 158/176 branches (89.8%). |
| Dashboard | 63 unit tests, TypeScript/Vite production build and formatting passed; npm audit reported zero vulnerabilities. |
| Provisioning | All 29 tests passed on the native Linux Jenkins agent, including POSIX permissions; Windows previously passed 24 with five explicit skips. |
| Deployment configuration | 38 contracts and actual Ansible syntax passed. |
| Jenkins | Local candidate job `travel-plan-local-review`, build 6: SUCCESS. Dedicated unprivileged agent; controller has zero executors. |
| SonarQube | Candidate gate passed with no ignored conditions: zero bugs, vulnerabilities and hotspots; 0% duplicated lines. 94 existing maintainability findings remain. Combined coverage is 49.8%; frontend LCOV is not imported. |
| Live Chrome | All seven scenarios passed together, including two direct database fixtures. |
| Live Firefox | All five workspace/UI/API scenarios passed under WSL. The two direct database fixtures ran through Windows Chrome. |
| Live infrastructure | HTTPS for all services/gateway, anonymous rejection, private session listener authentication, public internal-path rejection, PostgreSQL least-privilege roles and plaintext rejection, verified Bolt TLS and matching graph projection passed. |
| Ansible deployment | The WSL workstation playbook actually deployed two Java replicas per service and ran the infrastructure verifier. The separate Ubuntu server installation recipe is syntax-checked only. |
| Logging | Correlated travel-to-identity and payments-to-identity requests appeared in centralized Loki over verified TLS. |
| Recovery | Fresh PostgreSQL dump restored into an isolated temporary database; Vault snapshot restored into an isolated temporary instance, verifying the original unseal key/token, all three service records and scoped policies. |
| Portable design | Refreshed preview passed motion, five widths, six screens, local CRUD/persistence/export, no external requests and automated accessibility checks. Shared logo/design and always-enabled motion remain. |

CI analyzed committed application revision `5380cfe659520ccf6cb49b096a534b8ab2d25fe1`. Final runtime/browser checks include Caddy correction `65b44133285224388669be1db0c8e5994cd823ae`; subsequent source changes are documentation. Each raw run records its own revision and dirty state. Earlier failed attempts remain in evidence and are superseded only by the named successful reruns.

The local CI job consumes a verified Git archive, not a Git-host PR event. It has no SCM blame, deployment credentials or application Docker socket. Its Sonar gate preserves Sonar way conditions and adds whole-project zero-bug/zero-vulnerability and maximum 3% duplication conditions. Java and dashboard sources were analyzed; this is not whole-stack dependency or infrastructure security clearance.

## Measured Java replica failover

The probe stopped one replica at a time, required three successful recovery rounds and eighteen additional stable reads, then restored the replica and verified health.

| Service | Requests | Transient failures | Measured recovery | Restored |
| --- | ---: | ---: | ---: | --- |
| identity | 30 | 1 | 7.21 s | Yes |
| travel | 27 | 0 | 2.20 s | Yes |
| payments | 27 | 0 | 2.24 s | Yes |

The first identity probe took 30.87 seconds with eight failed requests. An unpublished Caddy listener now balances read-only session verification across identity replicas; temporary authentication dependency failures return 503 without clearing the browser session. Java clients without SNI receive the existing correct certificate, while hostname/CA validation stays enabled. The final measurement above supersedes the earlier result. This test establishes bounded Java replica recovery, not zero downtime or database/host high availability.

## Requirement map

| Assignment requirement | Status |
| --- | --- |
| Java microservices, replicas and balancing | Implemented and live tested: identity, travel, payments, internal HTTPS and two replicas each. |
| Containerized PostgreSQL and Neo4j | Running with persistent volumes, private networks and verified TLS. Both remain single instances. |
| Jenkins and SonarQube | Local candidate CI and quality gate executed successfully. Full SCM-triggered PR/deployment job remains unconnected. |
| Docker and Ansible | Images built; workstation deployment executed. Independent Ubuntu deployment is not claimed. |
| Request tracing | Correlation and centralized ingestion passed; the simple collector is not a durable audit ledger. |
| Admin CRUD | People, role/status/password updates, travels/ordered destinations/participants, and gateway metadata are implemented and tested. |
| Complete travel details | Multiple destinations, dates, inclusive duration, activities, accommodation and transport persist correctly. |
| Cascades and consistency | Real PostgreSQL rollback, stale edit rejection, child/member cascades, null historical transaction references, ordered graph relationships, duplicate outbox replay and graph deletion convergence passed. |
| Authentication/authorization | BCrypt, server sessions, secure cookies, CSRF/origin checks, RBAC and revocation passed. Stored eight-hour/fifteen-minute boundaries and fixture-expiry enforcement were tested; those durations were not waited out in wall-clock time. |
| Stripe and PayPal | Sandbox gateway administration and protected credential-test endpoints exist, with HTTP contract unit tests. Owner sandbox credentials have not been supplied or verified. Payment capture/refunds/webhooks are phase two. |
| Responsive Chrome and Firefox | Current live browser checks passed. Earlier broader portable consistency/orbit evidence is historical; current portable design was rerun. Firefox WebGL and physical phones are not certified. |
| Feature unit tests | 78 Java, 63 frontend and 29 provisioning tests passed. See TEST-MATRIX.md; coverage is not proof of all possible behavior. |
| PR workflow, review and approved merges | [PR #1](https://learn.reboot01.com/git/hujaafar/travel-plan/pulls/1) is open against protected `main`. Direct/force pushes are disabled; one approval and the exact `travel-plan/jenkins` status are required, including for administrators. SCM check publishing and independent human approval remain pending. Gitea visibly blocks merging; no merge was performed. |
| TLS, private networking and Vault | Live transport checks passed; scoped AppRoles and separate SQL runtime roles are in use. The development CA is not a public-domain certificate. |
| Least privilege | Application RBAC, SQL roles and Vault scopes verified. Neo4j Community's implied administrative privileges remain a gap. |
| High availability | Incomplete: PostgreSQL, Neo4j, Vault, ingress and Docker host are single points of failure. Requires independent failure domains and a supported clustered Neo4j offering. |
| Maintenance/packages | Renovate, audit gates and package/asset decision records supplied. Java/container/OS vulnerability review remains ongoing work. |
| Bonuses | Schema/API/architecture/operations documentation, real integration/E2E tests, measured failover and isolated backup restores supplied. Kubernetes is not implemented. |

## Remaining owner/environment gates

1. Connect SCM-triggered Jenkins checks to the open PR and obtain independent human approval. The Git host now enforces the exact `travel-plan/jenkins` status and one approval on `main`; neither is satisfied. No collaborator is currently assigned. The local candidate job does not replace an exact-revision PR run.
2. Supply owner sandbox secrets through the documented Vault paths, then execute both protected Stripe/PayPal connection tests. Do not place keys in Git or chat.
3. Provide a Neo4j deployment supporting scoped runtime privileges and a reviewed HA environment with redundant database, Vault and ingress services on independent hosts. No license, paid account or public domain was activated.
4. Establish off-device protected backups, rotation, recovery targets and production capacity testing. Local lists are still unbounded; pagination and catalogue-scale load testing remain before large deployments.

The earlier Docker uninstall lost the old data disk. Current checks use newly initialized project data; previous records were not recovered. The latest private backups are outside Docker under `.secrets/backups/` and are excluded from deliverables. Read DOCKER-RECHECK.md before any runtime repair.

## Git-host review setup verified on 17 September

`main` was created at the existing foundation commit `19c9fdd22b9a68ceef1fe3930da4ccdf1be561a1` and made the default branch. The completed implementation stays on `feature/admin-platform` until review. PR #1 initially contained the subsequent nineteen commits; this audit update is also submitted through that PR. The foundation itself had no independent review, so the reviewer must inspect its files as well as the PR diff. No history was rewritten, and creating the base branch does not retroactively establish reviewed development history.

The saved protection rule also dismisses stale approvals, blocks rejected and outstanding requested reviews, blocks outdated PRs, and has no bypass allowlist. The PR page showed the required Jenkins check missing and **0 of 1** approvals. The collaborator list was empty. No reviewer access, API token or webhook endpoint was invented. See DELIVERY.md for the remaining CI integration contract.
