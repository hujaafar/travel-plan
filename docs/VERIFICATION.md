# Verification record — 13 September 2026

This record distinguishes completed checks from configuration and checks that remain pending.

| Check | Result |
| --- | --- |
| Java unit tests | 21 tests passed in the completed Maven `verify` run. JaCoCo reports were generated. |
| Frontend unit tests | 4 tests passed with Vitest 4.1.11. |
| Frontend production build | TypeScript and Vite build passed. |
| Frontend dependency audit | Zero reported vulnerabilities after updating Vitest; this is not a whole-stack security audit. |
| Live Chrome workflows | Navigation/logout, persisted itinerary CRUD, and API security/cascade integration scenarios passed before the runtime interruption. |
| Mobile accessibility | All six screens passed axe WCAG A/AA checks and document-overflow checks at 390 × 844 after the CSS fix, using frontend sample fixtures. This is not a complete accessibility certification. |
| Visual inspection | Desktop, itinerary viewer, and mobile screenshots reviewed. Final screenshots use the built frontend with fixtures derived from the SQL sample data; they are not proof of current backend availability. |
| Running infrastructure | PostgreSQL, Neo4j, Vault, agents, and one replica of each Java service were exercised successfully before the interruption. Neo4j contained four Travel nodes matching the seeded PostgreSQL records. |
| TLS | Application HTTPS, JDBC TLS, Vault HTTPS and verified Bolt TLS were exercised. The repeatable `scripts/verify-infrastructure.py` script was added later and still needs its first complete run. |
| Firefox | Windows launch failed with a side-by-side runtime error. The Linux test image downloaded, but its test run was blocked by the full C: drive. |
| Jenkins / SonarQube / Ansible / monitoring | Configuration and documentation provided; YAML parsed successfully. No completed Jenkins pipeline, Sonar quality gate, Ansible deployment, or centralized-log ingestion run is claimed. |
| Replicas and failover | Two Java replicas are declared in base Compose. The laptop profile runs one. A replica failure test has not been completed. |
| Remote review | Local feature branch only. No remote PR, independent approval, branch protection, or deployment has been claimed. |

## Current environment blocker

The host C: drive reached zero free space during the final container/browser work. Docker/WSL stopped responding and could not restart. Removing three generated application JARs recovered about 65 MB; sources, test reports, credentials, and database volumes were preserved. The last Maven `install` attempt consequently failed for lack of disk space, rather than a failed test. Do not treat the stopped local URL as a working deployment until Docker is recovered.

Automatic approval review blocked deletion of the Firefox runtime downloaded for this task; it supplied no more specific reason. Cleanup permission was requested. Avoid deleting database volumes or unrelated user files to recover space.

## Finish after recovering disk space

Allow several GB of free host space, start Docker Desktop, then:

```powershell
python scripts/bootstrap.py
docker compose -f compose.yml -f compose.local.yml up -d --build --wait --wait-timeout 240
.\mvnw.cmd -B -ntp verify
python scripts/verify-infrastructure.py
cd dashboard
npm ci
npm test
npm run build
npx playwright test --project=chrome
```

Rerun Firefox on a compatible Linux runner with Playwright's matching browser image, or repair the Windows runtime through the vendor's supported installer. On Linux CI the Jenkinsfile sets `PLAYWRIGHT_CHROMIUM=1` to select bundled Chromium; the local `chrome` project uses installed Google Chrome by default.

Then validate monitoring ingestion and Ansible syntax, connect the Jenkins agent/Sonar server, run the quality gate, exercise two replicas and failover, and obtain the independent review required by the assignment.
