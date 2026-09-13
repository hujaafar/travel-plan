# Verification record Ã‚Â· 13 September 2026

This record separates tested behavior, supplied configuration and remaining work. The final design is Kinetic Atlas, expanding The Departure Desk in response to the request for more ambitious scroll effects.

| Check | Observed result |
| --- | --- |
| Java units | 21 tests passed in the completed Maven `verify` run before the host disk interruption. JaCoCo reports were generated. Java implementation is unchanged by the redesign. |
| Frontend units | 4 tests passed with Vitest 4.1.11 after the redesign. |
| Frontend build | TypeScript and Vite production build passed, including an additional unused-local/parameter check. |
| Frontend dependency audit | Zero reported vulnerabilities in the resolved npm dependency tree. This is not a whole-stack security audit. |
| Chrome design checks | Installed Chrome 152.0.7977.83 passed against the self-contained preview. |
| Firefox design checks | Playwright Firefox 155.0 on native Ubuntu through WSL passed against the same preview. Windows Firefox still has a side-by-side runtime startup error. |
| Motion | The photograph expands in a pinned frame; ticket and photograph move independently; the SVG route draws; pointer depth responds; scrolling selects Ubud then Uluwatu; the gallery pans and reveals keyboard-focused cards. Direct route and gallery controls work. Reduced motion disables parallax and pinning. Closing copy remains visible. |
| Layout and automated accessibility | Overview with motion at 1440, 1024, 820, 390 and 320 pixels, reduced-motion overview at 1440, 390 and 320 pixels, and five other mobile screens passed horizontal-overflow checks and axe WCAG 2 A/AA and 2.1 AA rules: 26 checks across Chrome and Firefox with no violations. |
| Preview workflows | Create, edit, reload persistence, search, delete, CSV download and zero/one-plan layouts passed in both browsers using local fictional data. No uncaught page errors or external HTTP requests. These checks do not verify Java authentication or provider connectivity. |
| Visual inspection | Desktop opening, intermediate scroll states, changing route photograph, closing action, editor, mobile and reduced-motion renders reviewed. A new scroll contact sheet and a browser recording accompany the deliverables. The main full-page image uses reduced motion so the complete content is visible without photographing empty pin travel. |
| Earlier live Chrome workflows | Navigation/logout, persisted itinerary CRUD and API security/cascade scenarios passed before the runtime interruption. They have not been rerun against the final frontend because Docker is offline. |
| Earlier running infrastructure | PostgreSQL, Neo4j, Vault, agents and one replica of each Java service were exercised. Neo4j contained four Travel nodes matching the seeded PostgreSQL records. |
| TLS | Application HTTPS, JDBC TLS, Vault HTTPS and verified Bolt TLS were exercised earlier. The later repeatable `scripts/verify-infrastructure.py` still needs its first complete run. |
| Jenkins / SonarQube / Ansible / monitoring | Configuration and documentation provided; YAML parsed. No completed Jenkins pipeline, Sonar quality gate, Ansible deployment or centralized-log ingestion run is claimed. |
| Replicas and failover | Base Compose declares two Java replicas; the laptop profile runs one. A replica failure test is pending. |
| Remote review | Local feature branch only. No remote PR, independent approval, branch protection or public deployment. |

Automated browser emulation is not a real phone test or a complete accessibility certification. Safari, physical touch interaction and screen-reader use have not been verified.

## Logo refresh

The starburst was replaced with an original TP monogram. The production build passed; the exported preview was checked for the same embedded SVG in its sidebar, login and favicon. Rendered sizes of 16, 24, 38 and 64 pixels were inspected, and the main screenshots and motion recording were refreshed. No application logic or dependencies changed in this branding update; the broader browser results above are from the preceding motion pass.

## Current environment

The C: drive previously filled completely and interrupted Docker. Clearing npm's download cache and compressing downloaded runtimes recovered roughly 2 GB in total; subsequent browser setup used part of that space. Source files, generated credentials and existing database volumes were preserved.

Docker now fails startup at its stale `sailor-ingest.sock` socket files. Automatic approval review rejected deleting those files, and also rejected earlier Firefox-runtime deletion without giving a more specific reason. Those deletions were not retried or bypassed. There is no pending request for broad file cleanup. The usable design preview is independent of Docker.

## Reproduce the design checks

```powershell
cd dashboard
npm ci
npm test
npm run build
python ../scripts/export-preview.py
node scripts/verify-design.mjs
# On a compatible host with Playwright Firefox installed:
$env:DESIGN_BROWSER = 'firefox'
node scripts/verify-design.mjs
```

The script writes screenshots and `design-verification.json` to `dashboard/test-results/design`, or to `DESIGN_SHOTS`. `PREVIEW_PATH` selects a different exported HTML file. The final handoff has separate Chrome and Firefox reports. Fonts, photographs and fictional records are embedded; the exporter never reads credentials.

## Remaining live validation

After restoring Docker Desktop through its supported recovery tools and allowing sufficient free space:

```powershell
python scripts/bootstrap.py
docker compose -f compose.yml -f compose.local.yml up -d --build --wait --wait-timeout 240
.\mvnw.cmd -B -ntp verify
python scripts/verify-infrastructure.py
cd dashboard
npm run build
npm test
npx playwright test --project=chrome
npx playwright test --project=firefox
```

Run Firefox on a compatible host with its matching Playwright runtime. Linux CI sets `PLAYWRIGHT_CHROMIUM=1` to select bundled Chromium; local Chrome uses installed Google Chrome by default. Then validate monitoring ingestion and Ansible syntax, connect Jenkins and Sonar, exercise two replicas and failover, and obtain the independent PR approval required by the assignment. Provider checks require the owner's Stripe/PayPal sandbox credentials. Capture, checkout, refunds and webhooks remain phase-two work.
