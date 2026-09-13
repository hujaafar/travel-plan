# Package and design decisions

| Choice | Why it is used |
|---|---|
| Java 17 / Spring Boot 3.5 | Familiar Java ecosystem, validated request DTOs, dependency management, operational health endpoints |
| Spring JDBC | Explicit SQL, visible cascade rules, small service footprint; avoids hidden ORM relationship behavior |
| Spring Security BCrypt | Mature password hashing implementation rather than custom cryptography |
| PostgreSQL | Transactions, numeric money types, constraints, cascade rules and shared session consistency |
| Neo4j Java driver | Explicit destination relationships projected transactionally |
| React + TypeScript + Vite | Typed reusable forms and responsive interaction, static production output |
| DM Sans + Manrope | Two locally served families with consistent reading and display roles |
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

The user explicitly requested [Scroll Craft](https://github.com/nateherkai/scroll-craft). The full skill was installed and read. This is an admin application, so its live-surface grammar and design floor were applied instead of a long marketing scroll sequence. The authored brief is labelled as assumptions, not invented user quotations. There is no generated video or API spend. Standard photographs, native scrolling, a destination ribbon, restrained hover transitions and a reduced-motion variant support the real tasks.

The local fingerprint registry started empty. The signature interaction is a route ribbon that shows each destination's experiences, stay and transport. See `scrollcraft/builds/travel-plan/BRIEF.md` and the verification notes.

## Photography and assets

Cover photographs are illustrative assets from Unsplash, downloaded and served locally. They are not booking listings or evidence of an included property. The sample itineraries are fictional teaching data. The brand mark is an original SVG created for this project. Font licenses are included with the installed Fontsource packages; both families are distributed under the SIL Open Font License. Scroll Craft includes its upstream license.

| Local asset | Original image |
|---|---|
| Bali | https://images.unsplash.com/photo-1537996194471-e657df975ab4 |
| Japan | https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e |
| Mountains | https://images.unsplash.com/photo-1464822759023-fed622ff2c3b |
| Morocco | https://images.unsplash.com/photo-1539020140153-e479b8c22e70 |
| Greece | https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e |
| Iceland | https://images.unsplash.com/photo-1476610182048-b716b8518aae |

See [Unsplash license](https://unsplash.com/license). Replace these local covers with project-owned photography if the product is publicly launched.
