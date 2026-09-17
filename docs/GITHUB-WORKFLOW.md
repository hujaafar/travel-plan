# GitHub development and course delivery

The working repository is https://github.com/hujaafar/travel-plan. The owner explicitly approved making the source public. Before publication, all 376 existing Git-history blobs were checked for known generated secrets, private keys and GitHub-token patterns; none were found. This bounded scan is not a guarantee that every possible secret format is detectable.

`github` is the development remote. `origin` remains the course repository at https://learn.reboot01.com/git/hujaafar/travel-plan. Both retain the same source history. `main` holds the initial foundation until independent review; current work is on `feature/admin-platform`. Do not treat the original foundation as an already reviewed implementation.

GitHub's saved main-branch protection requires one approval, dismisses stale approvals, requires resolved conversations and an up-to-date branch, and applies to administrators. Force pushes and branch deletion are disabled. Two exact required checks are configured:

| Check | What executes |
| --- | --- |
| `travel-plan/jenkins` | A disposable, authenticated TLS Jenkins controller and separate unprivileged agent execute `Jenkinsfile.review`: Java tests/coverage, frontend build/format/unit/audit, provisioning tests, configuration/Ansible syntax, then a real SonarQube candidate scan and quality gate. |
| `travel-plan/live-tests` | A separate disposable Linux runner deploys two Java replicas with real PostgreSQL/Neo4j/Vault, verifies internal TLS and centralized request logging, runs Chrome/Firefox integration tests and measures replica recovery. |

`.github/workflows/verify.yml` runs on pull requests targeting main, main pushes and manual dispatch. Actions are pinned to verified commit hashes. The token has read-only source permission, checkout does not persist credentials, and neither `pull_request_target` nor a self-hosted runner is used. PR code never receives course Git, payment, laptop or deployment credentials. Fresh random development secrets exist only inside the disposable runner; the Jenkins agent has no Docker socket. The CI control script refuses local and self-hosted execution.

SonarQube Community runs a fresh candidate project for each workflow, not native Sonar pull-request analysis. The gate copies the installed Sonar way conditions and adds zero whole-project bugs, zero vulnerabilities and at most 3% duplication. A fresh project has no historical new-code baseline; inspect the archived gate result for evaluated and unavailable conditions. This is different from persistent branch analysis and does not claim zero maintainability debt or whole-stack security certification.

GitHub retains sanitized Jenkins console/quality-gate evidence and live test reports for fourteen days. Private generated files and database volumes are excluded. The laptop deployment is unaffected. Workflow definitions alone do not prove a successful run; use the actual PR check results and their recorded source SHA.

After passing checks and independent approval, merge on GitHub, fetch its main branch, and sync the reviewed commit through the course repository's review policy. Keep course credentials local; no unattended cross-site write token is installed in Actions. A GitHub pass must never be manually reported for a different source revision. Until approval, syncing `feature/admin-platform` updates the course review without bypassing its main protection.
