# Package and design decisions

| Choice | Why it is used |
|---|---|
| Java 17 / Spring Boot 3.5 | Familiar Java ecosystem, validated request DTOs, dependency management, operational health endpoints |
| Spring JDBC | Explicit SQL, visible cascade rules, small service footprint; avoids hidden ORM relationship behavior |
| Spring Security BCrypt | Mature password hashing implementation rather than custom cryptography |
| PostgreSQL | Transactions, numeric money types, constraints, cascade rules and shared session consistency |
| Neo4j Java driver | Explicit destination relationships projected transactionally |
| React + TypeScript + Vite | Typed reusable forms and responsive interaction, static production output |
| DM Sans + Fraunces | A readable operational face and an expressive editorial face for the itinerary spreads; both served locally |
| Lucide | Consistent, lightweight SVG icon vocabulary |
| Native HTML dialog | Focus trapping, Escape handling and browser semantics without a modal library |
| Playwright + axe | Actual Chrome/Firefox workflows, narrow viewport checks, reduced motion and accessibility assertions |
| Vitest | Small, fast unit checks for formatting, search, CSV safety and date-only handling |
| Caddy | TLS termination, verified upstream TLS, static files, DNS discovery and round-robin balancing |
| Vault | Per-service AppRole policies and agent rendering rather than credentials baked into images |
| Jenkins / SonarQube / Ansible | Required build, quality-gate and repeatable deployment ecosystem |
| Loki / Grafana | Optional central view of structured service logs and request IDs |

The `.npmrc` enables legacy peer resolution because npm 10/11 otherwise traverses Vitest's optional browser peers into incompatible major-version cycles. This project uses Playwright directly for browsers and Vitest for Node-only units. The exact resolved dependencies are committed in the lockfile and audited; no TLS verification or vulnerability checking is disabled.

## Scroll Craft adaptation

The user explicitly requested [Scroll Craft](https://github.com/nateherkai/scroll-craft), then rejected the first restrained dashboard and delegated a stronger scroll-led redesign. The complete skill is installed locally. The latest direction is a kinetic travel atlas. It expands the photograph into a pinned scene, draws a flight path, moves the foreground ticket independently, changes into a dark itinerary spread, then uses measured native scroll to move through a dimensional saved-journey gallery. A large orbital closing composition opens the actual planning form. The brief distinguishes supplied evidence from authored decisions.

The rejected fingerprint remains in the registry. The initial redesign differs in all six dimensions; its kinetic expansion differs in five. See `scrollcraft/builds/kinetic-atlas/BRIEF.md` and `REPORT.md`. The upstream engine is preserved unmodified for reference. A small React hook implements the relevant progress and reveal behavior with lifecycle cleanup and one queued animation frame, avoiding duplicate observers after navigation. It never intercepts wheel input. The gallery pin span equals its measured horizontal travel. Focus reveals the corresponding card immediately, while small screens use native horizontal scrolling and reduced motion removes pinning. No extra animation dependency was added. No generated media, paid API calls, scroll-scrubbed video or full video encoder is required for this photographic composition.

## Photography and assets

Cover photographs are illustrative assets from Unsplash, downloaded and served locally. They are not booking listings or evidence of an included property. The sample itineraries are fictional teaching data. The brand mark is an original interlocking TP monogram, drawn as compact filled SVG paths on the vermilion tile. Its open counters remain readable at favicon and sidebar sizes. The same asset supplies the sidebar, login, loading screen and favicon. Both font families are distributed under the SIL Open Font License; copies are in `docs/licenses` and embedded in the standalone preview. Scroll Craft includes its upstream license.

| Local asset | Original image |
|---|---|
| Bali | https://images.unsplash.com/photo-1537996194471-e657df975ab4 |
| Japan | https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e |
| Mountains | https://images.unsplash.com/photo-1464822759023-fed622ff2c3b |
| Morocco | https://images.unsplash.com/photo-1539020140153-e479b8c22e70 |
| Greece | https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e |
| Iceland | https://images.unsplash.com/photo-1476610182048-b716b8518aae |
| Ubud route photograph | https://images.unsplash.com/photo-1555400038-63f5ba517a47 |
| Uluwatu route photograph | https://unsplash.com/photos/a-view-of-the-ocean-from-the-top-of-a-cliff-GA7rJUjzbJQ (Reynardo Etenia Wongso) |

See [Unsplash license](https://unsplash.com/license). Replace these local covers with project-owned photography if the product is publicly launched.
