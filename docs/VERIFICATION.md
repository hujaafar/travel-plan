# Verification record · updated 14 September 2026

## Latest submission follow-up

The final combined local run passed 76 Java tests, 62 Vitest tests, TypeScript/Vite build, formatting and npm audit (zero reported vulnerabilities). Java JaCoCo coverage is 436/455 lines (95.8%) and 158/176 branches (89.8%). Sixteen Python tests pass on native Linux fixtures; Windows explicitly skips five POSIX assertions. All 37 configuration contracts and real Ansible syntax passed.

This pass added broad feature units, independent service refresh, API deadlines, calendar date corrections, batched repeatable-read travel queries and BCrypt byte-boundary validation. Verifier tests cover preflight failures, opt-in safety, interrupted stops, restoration and cleanup failures. Jenkins source now includes configuration/Ansible checks and trusted TLS/service-log correlation. These pipeline edits are configuration evidence until a real Jenkins run succeeds.

Fresh portable browser results are exported separately for Chrome and WSL Firefox: eight admin regression flows and 55 design/orbit/consistency cases per browser. The exact JSON results and source revision are in the handoff. These suites include new invalid-date/password and partial-service retry checks. Firefox uses the photographic CSS fallback, so its WebGL behavior is unverified. Read [FINAL-AUDIT.md](FINAL-AUDIT.md), [TEST-MATRIX.md](TEST-MATRIX.md) and [INFRASTRUCTURE-GATES.md](INFRASTRUCTURE-GATES.md) for the evidence limits and outstanding live checks.

Motion remains always enabled under the user's explicit request. Historical sections below preserve earlier builds and earlier motion policies; they are not the current interface's specification.

## Unified Atlas — current verification

| Check | Observed result |
| --- | --- |
| Visual consistency suites | `dashboard/scripts/verify-consistency.mjs` passed 30 screens in Chrome and the same 30 in Linux Firefox: six pages, three lower Home sections, three editors, travel detail, help and login, each at desktop 1440 × 1000 and mobile 390 × 844. All 60 had zero axe violations and zero document overflow; navigation, dialog access and return from sign-in completed without uncaught page errors. |
| Orbital motion suites | `verify-orbit.mjs` passed 12 cases per browser at widths 320, 390, 700, 820, 1024 and 1440, including the scene frames and short laptop layout. Motion remained active under OS reduced motion and an old stored off choice. Chapter controls, skip-to-workspace and navigation/remount passed. Chrome rendered WebGL and passed context loss/restoration; Linux Firefox had no WebGL and passed through the CSS photographic fallback. This is not a Firefox WebGL validation. |
| Design and workflow suites | `verify-design.mjs` passed 13 cases per browser covering the scroll layers, route, pointer depth, gallery movement and keyboard reveal, responsive layouts, local travel creation/editing, reload persistence, search, deletion, CSV export and zero/one-plan layouts. These portable-preview runs reported no uncaught page errors or external requests. |
| Combined automated accessibility/layout | The three suites completed 110 cases across Chrome and Linux Firefox: 60 consistency + 24 orbital + 26 design. No axe WCAG 2 A/AA or 2.1 AA violations and no document overflow were reported. |
| Visual evidence | Desktop/mobile page sheets, mobile forms and lower Home, and the six-stage Home contact sheet were visually reviewed. `all-pages-contact-sheet.png`, `forms-contact-sheet.png`, `home-contact-sheet.png`, `scroll-contact-sheet.png`, individual captures and the refreshed `design-motion.webm` cover the final interface. Computed palette and font values are recorded for review. Current Home evidence uses scene contact sheets in place of full-page screenshots, which cannot represent an always-active pinned sequence accurately. |
| Build, units and formatting | Final TypeScript/Vite production build passed; all four Vitest tests passed; Prettier checks passed for all frontend source and scripts. |
| Backend and deployment | Not rerun for this design revision. The portable sample checks do not verify live Java services, authentication, payment-provider connectivity or infrastructure availability. Existing Docker and deployment limitations below still apply. |

Page entry animation now translates fully opaque content, maintaining text contrast throughout entry. A Firefox test-readiness race around preview restoration was corrected before the successful final run. See `scrollcraft/builds/unified-atlas/BRIEF.md` and `REPORT.md` for the design contract and current evidence. Source-archive packaging remains a separate final step; no archive status is asserted here.

## Assignment audit follow-up — 14 September 2026

The live `dashboard/e2e/workspace.spec.ts` now includes a focused session-cleanup regression: expire a session with an editor, detail or delete dialog open, sign back in without reloading, and temporarily hold the data requests to verify that old dialogs and cached records do not return. This new real-service case has been authored but has not been executed against the current Java deployment. Portable-preview authentication behavior is not evidence of server expiry enforcement.

That initial combined-refresh limitation is now fixed: each service publishes independently; failures retain the previous same-session cache. Session/refresh revisions reject stale completions, and 15-second API deadlines bound stalled requests. Unit and rendered portable retry regressions cover this behavior.

## Historical Kinetic Atlas verification

The following table records the completed Kinetic Atlas pass, before the orbital opening and current consistency revision. Its reduced-motion behavior and screenshot strategy were those of that earlier build.

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

## Historical logo refresh

The starburst was replaced with an original TP monogram. The production build passed; the exported preview was checked for the same embedded SVG in its sidebar, login and favicon. Rendered sizes of 16, 24, 38 and 64 pixels were inspected, and the main screenshots and motion recording were refreshed. No application logic or dependencies changed in this branding update; the broader browser results above are from the preceding motion pass.

## Historical Orbital departure update

The topbar sample-data badge was removed. A finite Earth-to-destination opening responded to native scrolling at all viewport widths. Three direct chapter controls, skip-to-workspace with keyboard focus, an OS-aware persistent motion choice, and an expanding arrival photograph accompanied the original working desk. The current Unified Atlas removes that motion choice under the user's later instruction.

The new `scripts/verify-orbit.mjs` passed 12 additional axe/layout cases in each browser: widths 320, 390, 700, 820, 1024 and 1440, route/arrival frames, a 640px-high laptop, and reduced motion. First-scroll visual changes, chapter buttons, featured detail, keyboard skip, persisted on/off, explicit opt-in under OS reduced motion, and navigation/remount passed. Chrome rendered the WebGL sphere and passed context loss/fallback/restoration. Firefox's Linux test environment did not expose WebGL and passed using the CSS photographic fallback. No Firefox WebGL validation is claimed. The original 13-case suite was also rerun in each browser: 50 automated axe/layout cases combined, with no reported violations or overflow. No external requests or page errors were recorded.

NASA Blue Marble texture attribution is in `docs/licenses/NASA-Blue-Marble.md`. No new packages or remote runtime dependencies were introduced. See `scrollcraft/builds/orbital-departure/BRIEF.md` and `REPORT.md` for reference analysis, layer contracts and final evidence.

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
node scripts/verify-orbit.mjs
node scripts/verify-consistency.mjs
# On a compatible host with Playwright Firefox installed:
$env:DESIGN_BROWSER = 'firefox'
node scripts/verify-design.mjs
node scripts/verify-orbit.mjs
node scripts/verify-consistency.mjs
```

The design and orbit suites write their screenshots and reports under `dashboard/test-results/design`; the consistency suite defaults to `dashboard/test-results/consistency` and writes `consistency-verification.json` plus two contact sheets. `DESIGN_SHOTS` overrides the output directory for each suite, and `PREVIEW_PATH` selects a different exported HTML file. Use separate Chrome and Firefox output folders to preserve both sets of evidence. Fonts, photographs and fictional records are embedded; the exporter never reads credentials. Current scripts exercise the always-on motion policy; historical reduced-motion pass descriptions above do not describe the current behavior.

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
