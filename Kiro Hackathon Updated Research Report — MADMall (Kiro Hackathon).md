# Kiro Hackathon Updated Research Report — MADMall (Kiro Hackathon)

## 1) Executive Summary

AIme: The MAD Mall Social Wellness Hub will deliver a **non-medical, therapeutic, culturally grounded online mall + social network** for Black women living with Graves’ Disease. The v1 system will focus on **community, identity, humor, and support**, while a **Titan Data Engine** gathers engagement signals and produces **predictive “next feature to build” recommendations** and **publishable Models of Care** for real-world providers. The product will be implemented with **Amazon Cloudscape** for UI, **spec-driven development** to align with Kiro’s judging guidance, and a production-ready backend that logs events, computes recommendations, and exposes an API consumed by the Cloudscape app.
The plan aligns to **Kiro Devpost requirements**: a working application built with Kiro, a public repo containing the `/.kiro` directory, a three-minute video, explicit explanation of Kiro usage, and open-source licensing. ([Code with Kiro Hackathon][1])

## 2) Kiro Hackathon Constraints and Criteria

**Verbatim excerpts** (Devpost page):

* **What to build:** “Build a working software application that uses Kiro” with category selection. ([Code with Kiro Hackathon][1])
* **What to submit:** three-minute video, public repo, required `/.kiro` directory, approved OSI license, write-up showing how Kiro was used. ([Code with Kiro Hackathon][1])
* **Judging criteria:** Potential Value; Implementation; Quality of the Idea. ([Code with Kiro Hackathon][1])
* **Deadline:** “Deadline: Sep 15, 2025 @ 12:00pm PDT.” ([Code with Kiro Hackathon][1])
* **Rules link:** “Please check the Official Rules for full details.” ([Code with Kiro Hackathon][1])
* **Eligibility and submission requirements** repeated under the Rules tab. ([Code with Kiro Hackathon][2])

### Matrix: criteria → features → evidence

| Kiro criterion      | MADMall feature mapped                                                                                                                                          | Evidence linkage                                                                                                                                                     |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Potential Value     | Non-medical therapeutic social mall + Black-owned marketplace + peer circles + comedy lounge + story booths + resource hub                                      | Online health communities improve coping and self-management (“peer support can provide emotional support, improve coping skills, and enhance patient empowerment”). |
| Implementation      | Kiro spec files in `/.kiro`; deterministic PRD; CI; Cloudscape UI; backend API; Titan Data Engine with contextual bandit + rules; event pipeline; feature flags | Kiro requirements: working app, public repo, `/.kiro` directory, explanation of Kiro usage. ([Code with Kiro Hackathon][1])                                          |
| Quality of the Idea | Fusion of “digital mall” with culturally grounded community; predictive service roadmap; publishable Models of Care                                             | Black women experience unique psychosocial load (Superwoman Schema research) that increases depression risk; culturally specific support creates value. ([PMC][3])   |

## 3) MADMall Concept Summary (based on MADMALL\_PROMPT\_UPDATED)

* **Core:** AIme will be a **non-medical** sanctuary for **sisterhood, humor, identity, and support**.
* **Digital Mall metaphor:** a **mall concourse** with lounges, comedy, resource hubs, and a marketplace featuring Black-owned brands and wellness goods.
* **Titan Data Engine:** multi-modal event ingestion, predictive ranking, and **“next feature to build”** outputs, plus **Models of Care** for provider audiences.
* **Pipeline to care:** deliberate additions of clinical services **one at a time** at later phases, guided by data, while v1 stays completely non-medical.

## 4) User Segments and Jobs-To-Be-Done

### Segments

* Newly diagnosed Black women seeking clarity, community, and relief
* Long-time patients seeking identity-affirming spaces and practical tips
* Caregivers seeking understanding and supportive culture

### JTBD with acceptance tests

* **JTBD-001:** When diagnosis feels isolating, I want a safe space to **connect with peers** so I can **feel seen and understood**.
  **Acceptance test:** user completes onboarding, joins one peer circle, posts once, and receives one supportive reply within 48 hours measured via events table.
* **JTBD-002:** When anxiety spikes, I want **quick relief content** (comedy, guided chill), so I can **regulate stress** in minutes.
  **Acceptance test:** user opens Comedy Lounge, streams one clip ≥ 60 seconds, and rates relief ≥ 3 on a 1–5 scale via in-app prompt.
* **JTBD-003:** When I browse the mall, I want **culturally resonant goods** and creator stories, so I can **practice joyful self-care**.
  **Acceptance test:** user taps three marketplace cards, saves one item, and shares one storefront to a peer circle.

## 5) Market Landscape and Differentiation

### Evidence

* **Peer communities benefit:** “emotional support… improve coping skills… enhance empowerment.”
* **Third places create belonging:** malls function as “everyday third places” that encourage social participation. ([PMC][4])
* **Superwoman Schema:** pressure to display strength increases risk of depressive symptoms; culturally safe spaces help mitigate this load. ([PMC][3])
* **Cloudscape design system:** production-grade components with accessibility focus and enterprise patterns.

**Feature-by-feature differentiation**
\| Need | Generic social app | Generic marketplace | MADMall |
\|---|---|---|
\| Culturally safe identity space | Weak cultural scaffolding | Transaction focus | Dedicated Black women community with rituals, humor, and curated stories |
\| Therapeutic non-medical relief | Minimal | None | Comedy Lounge, Story Booth, Chill micro-interactions |
\| Predictive roadmap | Feature backlog guesswork | Sales-led picks | Titan Data Engine predicts next feature builds from engagement signals |
\| Provider-facing insights | Not available | Not available | Models of Care white-papers derived from aggregated signals |

## 6) Technical Feasibility and Risk

### Feasibility

* Cloudscape + React for UI; Node service + SQLite in dev; DynamoDB + S3 in prod; event ingestion at ≥ 10k events/min target for growth.
* Titan Data Engine: rules + contextual bandit at v1; upgrade path to supervised ranking using SageMaker later.

### Key risks

* **Community trust risk:** cultural harm from tone-deaf content. **Mitigation:** Black women editorial council; community guidelines; moderator workflows.
* **Engagement risk:** insufficient content momentum. **Mitigation:** daily comedy drops; scheduled circles; creator partnerships.
* **Data ethics risk:** misinterpretation of signals. **Mitigation:** transparent metrics pages; opt-outs; privacy-preserving aggregation.

## 7) Privacy, Security, Compliance

* v1 remains **non-medical**, no PHI. Data classes: Public, Internal, Confidential.
* PII handling: email, display name, city/region limited to consented fields; encryption in transit and at rest; secrets in a managed vault.
* Cloudscape accessibility patterns complement WCAG targets.

## 8) KPIs and Scoring Alignment

* **Activation (KPI-A):** ≥ 60% complete onboarding within 24 hours.
* **First-week retention (KPI-R7):** ≥ 35%.
* **Peer reply time (KPI-PRT):** median ≤ 24 hours.
* **Comedy relief rating (KPI-CR):** mean ≥ 3.5 on 1–5 scale.
* **Predictive accuracy (KPI-PA):** ≥ 10% lift in engagement when Titan recommends a new feature vs. control.

Each KPI maps to Kiro **Potential Value** and **Implementation** scoring. ([Code with Kiro Hackathon][1])

## 9) Go-To-Market Within Hackathon Timeline

* Code freeze **2025-09-12T23:59:00Z**
* Video, repo, write-up, `/.kiro` directory verified **2025-09-13T23:59:00Z**
* Submission on Devpost by **2025-09-15T19:00:00Z** (matches 12:00 PDT). ([Code with Kiro Hackathon][1])

## 10) Source List with Verbatim Quotes

1. **Code with Kiro Hackathon — Devpost (Overview, Requirements, Judging, Deadline)**, Devpost, access date 2025-08-27T00:00:00Z. “Build a working software application that uses Kiro” and “Deadline: Sep 15, 2025 @ 12:00pm PDT.” ([Code with Kiro Hackathon][1])
2. **Official Rules page**, Devpost, access date 2025-08-27T00:00:00Z. “Submission requirements and judging criteria are described on the hackathon page.” ([Code with Kiro Hackathon][2])
3. **Online health communities and chronic illness** (systematic insights), Springer Nature site summary, access date 2025-08-27T00:00:00Z. “peer support can provide emotional support, improve coping skills, and enhance patient empowerment.”
4. **“Superwoman Schema” and health outcomes**, peer-review research summary, access date 2025-08-27T00:00:00Z. “pressure to present strength while suppressing emotion can increase depressive symptoms.” ([PMC][3])
5. **Shopping malls as everyday third places**, Taylor & Francis, access date 2025-08-27T00:00:00Z. “everyday third places” framing of malls for social participation. ([PMC][4])
6. **Cloudscape Design System**, cloudscape.design, access date 2025-08-27T00:00:00Z. “Cloudscape provides UI components, guidelines, and patterns for building intuitive web applications.”

---

## Prompt-Product-Plan.md

### Title Page

**Prompt-Product-Plan.md**
Version: **v1.0.0**
Date (UTC): **2025-08-27T00:00:00Z**
Determinism Statement: **This document is deterministic. No randomness permitted. No placeholders.**

## Versioning and Determinism

* Temperature 0, top-p 1, frequency penalty 0, presence penalty 0.
* Prohibited words: **“or”**, **“option”**, **“etc.”** unless inside verbatim citations.
* All requirements use “must” and “will”.

## Part A: COSTAR Machine Prompt for the Kiro AI Agent

### C — Context

* Environment: Kiro Devpost hackathon with deadline **2025-09-15T19:00:00Z**. Submission must include working app, public repo, three-minute video, write-up, `/.kiro` directory, OSI license. ([Code with Kiro Hackathon][1])
* Product: AIme — MADMall Social Wellness Hub, **non-medical** therapeutic social mall for Black women with Graves’ Disease, implemented with **Cloudscape** UI and a backend that logs events and returns recommendations.
* Policies: no PHI; PII minimal; encryption at rest and in transit; secrets in vault; WCAG 2.2 AA targets.
* Tools: Kiro IDE with spec-driven flows; Node + Fastify; SQLite (dev) and DynamoDB + S3 (prod); Vite + React + Cloudscape; Playwright tests; GitHub Actions CI.

### O — Objective

Maximize judging scores by delivering:

1. **Potential Value:** demonstrate cultural safety, peer relief, and measurable benefit.
2. **Implementation:** show Kiro usage via `/.kiro` specs that scaffold code, hooks that run tasks, and commit history.
3. **Quality of the Idea:** demonstrate digital mall + predictive Titan Data Engine uniqueness with publishable insights.
   Numeric targets: Activation ≥ 60%; Retention-7 ≥ 35%; P95 API ≤ 250 ms at 50 RPS; CI pass 100%.

### S — Success Criteria

* App builds from clean clone in ≤ 10 minutes with one command.
* `/.kiro` directory present with valid spec files and hook scripts.
* Demo script completes without failures using deterministic seed data.
* CI gates pass: lint, tests, build, SAST.
* Three-minute video shows Kiro usage and live feature-to-engagement feedback.

### T — Tasks

1. **Scaffold repo**
   Inputs: Node 20, PNPM 9, Git.
   Process: initialize monorepo; set eslint; set prettier; add GitHub Actions CI; create `/.kiro` with machine-readable spec.
   Outputs: repo with `apps/web`, `apps/api`, `packages/shared`, `/.kiro`.
   Validation: CI green; `pnpm -v` logged.

2. **Build backend API**
   Inputs: Fastify, SQLite, Drizzle ORM.
   Process: implement tables, migrations, `POST /events`, `GET /recommendations`.
   Outputs: running API with health endpoint and tests.
   Validation: Playwright API tests pass; P95 latency ≤ 250 ms at 50 RPS (k6 script).

3. **Build Cloudscape UI**
   Inputs: React 18 + Cloudscape.
   Process: implement Concourse, Peer Circles, Comedy Lounge, Marketplace, Resource Hub; wire to API; accessibility checks.
   Outputs: web app with instrumented events.
   Validation: Lighthouse a11y ≥ 95; axe automated checks pass.

4. **Implement Titan Data Engine**
   Inputs: events table; bandit library; rules.
   Process: compute engagement features; run contextual bandit; expose recommendations.
   Outputs: live “Next feature to build” endpoint + admin page.
   Validation: synthetic experiment shows ≥ 10% lift vs. control on seed dataset.

5. **Kiro write-up + video**
   Inputs: screen capture, narrative of spec-to-code.
   Process: record three-minute walkthrough; publish YouTube unlisted; add Devpost write-up.
   Outputs: links embedded in README.
   Validation: video ≤ 180 seconds; audio intelligible.

### A — Agents and Tools Policy

* Primary agent: Kiro main AI with spec execution.
* Assistant agents: test runner, linter fixer, formatter.
* Allowed tools: Node, PNPM, Git, Fastify, Drizzle, SQLite, DynamoDB, S3, Cloudscape, Playwright, k6.
* Disallowed tools: any data scrapers hitting personal accounts.
* Rate limits: API local 100 RPS during tests; backoff: 100 ms, max 5 retries.
* Cache policy: `node_modules` cached in CI; build artifacts cached per commit hash.
* Artifact naming: `madmall-web-<sha>.tgz`, `madmall-api-<sha>.tgz`.

### R — Response Format

* Deliver repo with folders exactly named in the **Repository Structure** section below.
* Provide JSON schemas in API docs.
* Provide CSV seeds in `/seeds`.

### Halt and Request conditions

* If OSI license not selected, halt and request license selection (MIT, Apache-2.0, BSD-3-Clause).
* If any secret missing, halt and request `.env` values.

### No Ambiguity Guardrail

* Reject vague directives; require measurable thresholds.

### Citation Discipline

* Any external claim in docs must include a citation reference to the Research Report.

### Compliance Gate

* Parse Devpost requirements before submit; block release when any required artifact missing. ([Code with Kiro Hackathon][1])

## Part B: Comprehensive PRD

### 1. Overview and Goals

* Value statement: **AIme will deliver a therapeutic digital mall that helps Black women with Graves’ Disease feel seen, laugh, learn, and connect without clinical burden.**
* Goals

  * G-001: Activation ≥ 60% by 2025-09-15.
  * G-002: Retention-7 ≥ 35% by 2025-09-15.
  * G-003: P95 API ≤ 250 ms at 50 RPS by 2025-09-10.

### 2. Problem Statement tied to User Jobs

Users experience isolation and identity strain after diagnosis, which reduces help-seeking and increases anxiety. The system will provide a culturally safe mall-like space with reliable peers, comic relief, and actionable stories that improve coping.

### 3. Target Users, Personas, and Scenarios

* Primary persona: **Tasha** (34), new diagnosis, needs immediate human warmth and fast relief.
* Scenario SCN-001

  * Preconditions: verified email; completed onboarding.
  * Trigger: evening anxiety spike.
  * Main flow: opens Comedy Lounge → plays “Graves Giggles” clip → posts reaction in peer circle → receives two reactions.
  * Postconditions: mood score prompt submitted; event log updated.
  * Acceptance tests: TC-001..TC-003 pass.

### 4. Exact Feature List with Priorities (P0 for hackathon)

**Table-stakes components (30) — each “system must provide …”**

1. Account creation with email verification.
2. Profile page with privacy toggles and culture tags.
3. Onboarding that captures goals and comfort level.
4. Concourse home with mall-like navigation.
5. Peer Circles with membership controls.
6. Direct messages with abuse report.
7. Comedy Lounge streaming with rating prompt.
8. Story Booth for audio and text posts.
9. Resource Hub with curated articles and saved lists.
10. Marketplace directory featuring Black-owned brands with affiliate tracking links.
11. Search with scoped filters by circle, shop, topic.
12. Notifications center with digest.
13. Accessibility controls for text size and contrast.
14. Moderation dashboard and flagged content queue.
15. Community guidelines acceptance gate.
16. Event logging pipeline for all interactions.
17. Titan Data Engine service with rules and contextual bandit.
18. Recommendations API feeding Concourse modules.
19. Feature flags service with kill-switch.
20. Admin curation tools for homepage sections.
21. Consent tracker with timestamps and policy versioning.
22. Internationalization scaffold for en-US baseline.
23. Health endpoint `/healthz` with status JSON.
24. Observability: structured logs with trace IDs.
25. Metrics exporter for RED metrics.
26. Error pages with retry and feedback.
27. Survey micro-prompts for quick sentiment.
28. Favorites saved items library.
29. Backup and restore scripts for SQLite dev.
30. Seed data loader for deterministic demos.

#### Value-added components (20) — P1 roadmap

1. VR Chill links and kiosk integration.
2. AR guide inside “Your Body” tour.
3. Live Comedy Open-Mic events.
4. AI peer matching picker with safety constraints.
5. Creator storefront pages with story videos.
6. Biofeedback mini-lab via webcam pulse.
7. Ancestral healing garden page with rituals guide.
8. Music-based calming page with personalization.
9. Art therapy studio prompts.
10. Cooking studio live stream with nutrition guests.
11. Outreach van schedule tracker page.
12. Alexa skill handoff for reminders.
13. Loyalty rewards wallet with streaks.
14. Guest events with advocates.
15. Telepresence pods directory for future clinics.
16. Storytelling recording booth scheduler.
17. Research hub page for opt-in studies.
18. Holistic spa partner directory.
19. Grants and assistance navigator.
20. Provider insight portal preview.

### 5. Non-Functional Requirements

* Availability: 99.9% monthly for public endpoints.
* Latency: P95 ≤ 250 ms at 50 RPS for `GET /recommendations`.
* Throughput: ≥ 10,000 events/min ingest with backlog ≤ 500.
* Observability: span coverage ≥ 95%.
* Maintainability: cyclomatic complexity ≤ 10 per function.

### 6. Security and Privacy Requirements

* Authentication: email + password with Argon2id.
* Authorization: RBAC with roles: user, moderator, admin.
* Transport: TLS 1.2+ with HSTS.
* At rest: AES-256-GCM for sensitive fields.
* Secrets: stored in a managed vault; never committed.
* Privacy: consent recording with ISO-8601 timestamps and policy version.

### 7. Compliance and Licensing

* Repo license: **Apache-2.0**.
* Dependencies checked via license scanner; deny list enforced.

### 8. Data Model and Schemas (selected)

**users**(id UUID pk, email, password\_hash, display\_name, created\_at, updated\_at)
**circles**(id, name, visibility, created\_at)
**circle\_members**(circle\_id, user\_id, role)
**posts**(id, user\_id, circle\_id, type, body, media\_url, created\_at)
**shops**(id, name, url, tags)
**events**(id, user\_id, type, target\_id, props JSON, ts)
**recommendations**(id, user\_id, payload JSON, ts)
**consents**(id, user\_id, policy\_version, ts)

### 9. APIs and Contracts

**POST /v1/events**
Request:

```json
{"type":"circle.join","target_id":"user-uuid-123","props":{"source":"concourse"}}
```

Response:

```json
{"status":"ok","id":"event-uuid-456","ts":"2025-08-27T00:00:00Z"}
```

**GET /v1/recommendations?user_id=user-uuid-123**
Response:

```json
{
  "user_id":"user-uuid-123",
  "modules":[
    {"slot":"concourse.hero","component":"peer_circles","reason":"cold-start-rules"},
    {"slot":"concourse.row1","component":"comedy","reason":"recent-anxiety-signal"}
  ],
  "next_feature_to_build":{
    "id":"FX-014",
    "title":"AI peer matching pilot",
    "confidence":0.71,
    "evidence":{"lift_estimate":0.12,"n":500}
  }
}
```

### 10. UX Flows and Content

* Buttons: “Continue”, “Submit”, “Save”.
* Error banner: “Something went wrong. Please try again.”
* Flow: Onboarding → Concourse → Join Peer Circle → Post → Watch Comedy → Rate Relief → Save Shop.

### 11. Test Strategy

* Unit ≥ 80%; Integration ≥ 90%; e2e smoke all critical paths.
* Playwright: user signup, post flow, video play, save favorite.
* k6: latency and throughput targets.
* Accessibility: axe automated pass ≥ 98%.

### 12. Analytics and KPIs

* Event names: `auth.signup.succeeded`, `circle.join.clicked`, `comedy.play.started`, `relief.rating.submitted`.
* Storage: write to `events` table ≤ 2 seconds P95.
* Governance: fields containing PII flagged and hashed where needed.

### 13. Delivery Plan and Milestones

* M1 scaffolding 2025-08-30
* M2 backend complete 2025-09-03
* M3 UI complete 2025-09-07
* M4 Titan baseline 2025-09-09
* M5 demo + video 2025-09-12
* Submission 2025-09-15

### 14. Risks and Mitigations

* RK-001 community harm risk; mitigation: moderator SLAs and removal workflows.
* RK-002 engagement stall; mitigation: daily programming.
* RK-003 latency regression; mitigation: index tuning and caching.

### 15. Definition of Done

* All P0 FR/NFR tests pass; CI green; video recorded; Devpost fields filled; repo public with `/.kiro`.

## Part C: Step-by-Step Implementation Plan

### Environment Setup

**Inputs:** macOS 14 or Ubuntu 22.04; Node 20; PNPM 9; Git.
**Commands:**

```bash
# Verify toolchain
node -v
pnpm -v
git --version
```

**Expected outputs:** versions printed without errors.
**Validation:** Node ≥ 20.0.0; PNPM ≥ 9.0.0.
**Failure handling:** install Node via nvm; install PNPM via corepack.

### Repository Structure

```text
madmall/
  /.kiro/               # Kiro specs and hooks
  /apps/web/            # Cloudscape React app
  /apps/api/            # Fastify API
  /packages/shared/     # Types, schemas
  /seeds/               # CSV seed data
  /e2e/                 # Playwright tests
  .github/workflows/ci.yml
  LICENSE
  README.md
```

### Backend Implementation

**Commands:**

```bash
pnpm create vite@latest apps/web --template react
pnpm dlx create-fastify apps/api
pnpm add -w typescript tsx eslint prettier
pnpm -C apps/api add fastify zod drizzle-orm better-sqlite3 pino
pnpm -C apps/api add -D @types/node tsup vitest
```

Create **apps/api/src/index.ts** with Fastify server, `/healthz`, `/v1/events`, `/v1/recommendations`.
**Expected outputs:** `pnpm -C apps/api dev` prints “listening on 3001”.
**Validation:** `curl :3001/healthz` returns `{"status":"ok"}`.
**Failure handling:** check port conflicts; kill stale process.

### Frontend Implementation

**Commands:**

```bash
pnpm -C apps/web add react-router-dom @cloudscape-design/components @cloudscape-design/global-styles axios
```

Implement **Cloudscape** pages: Concourse, Peer Circles, Comedy Lounge, Marketplace, Resource Hub. Wire to API endpoints.
**Expected outputs:** `pnpm -C apps/web dev` serves on [http://localhost:5173](http://localhost:5173) with functional navigation.
**Validation:** click Join Circle; verify network `POST /v1/events` 200.
**Failure handling:** inspect console; fix CORS by enabling Fastify CORS plugin.

### Data and Integration

Seed CSVs in `/seeds` with users, circles, shops, videos.
**Commands:**

```bash
pnpm -C apps/api exec tsx scripts/migrate.ts
pnpm -C apps/api exec tsx scripts/seed.ts
```

**Expected outputs:** tables created; rows inserted counts printed.
**Validation:** `sqlite3 dev.db 'select count(*) from users;'` shows expected counts.
**Failure handling:** wipe `dev.db` and re-seed.

### AI and Prompting

Titan baseline = rules + contextual bandit over engagement features: dwell time, clicks, replies, ratings.

* Compute reward = weighted sum: `reply_received*2 + dwell_secs*0.01 + relief_rating*0.5`.
* Bandit updates on each session end; serialization to `recommendations` table.

### CI/CD

**.github/workflows/ci.yml** gates: install, lint, test, build, SAST.
**Expected outputs:** green checks on PR.
**Validation:** required checks block merge until green.
**Failure handling:** fix eslint issues; update snapshots.

### QA

* Playwright **e2e**: signup, join circle, post, play comedy, rate relief.
* k6: run `k6 run load.js` with 50 RPS for 5 minutes; assert P95 ≤ 250 ms.
  **Failure handling:** add index on `events(ts)` and `events(user_id)`; enable Fastify keep-alive.

### Deployment

* Staging on a single VM or Fargate task behind ALB; TLS via managed cert.
* Health checks hit `/healthz`.
  **Rollback:** swap task definition **n-1** and redeploy.

### Demo Script (deterministic)

1. Start API and Web.
2. Create new user; complete onboarding.
3. Join a peer circle; make a post.
4. Play one comedy clip; submit relief rating.
5. Refresh Concourse; show recommendations and “Next feature to build” card.
   **Screenshots:** Concourse, Circle post, Comedy player, Admin: Titan panel.

### Submission Bundle

* Public repo with license, `/.kiro` folder, README describing Kiro usage.
* Three-minute video link in README.
* Devpost fields completed: category selection and write-up referencing Kiro spec-to-code. ([Code with Kiro Hackathon][1])

## Appendices

### A. Glossary

* Concourse: homepage mall walkway.
* Titan Data Engine: engagement-driven recommender with predictive build guidance.
* Models of Care: aggregated insights formatted for provider adoption.

### B. Assumptions

* v1 is **non-medical** and handles zero PHI.
* Users consent to analytics during onboarding.

### C. Dependencies with licenses

* Fastify (MIT), React (MIT), Cloudscape (Apache-2.0), Drizzle (MIT), Playwright (Apache-2.0).

### D. Full Bill of Materials

* Will be emitted by CI license scanner as `bom.json` with name, version, license, hash.

### E. Change Log

* v1.0.0 — initial hackathon release.

---

**End of consolidated deliverable.**

[1]: https://kiro.devpost.com/?ref_content=featured&ref_feature=challenge&ref_medium=portfolio "Code with Kiro Hackathon: A challenge for developers to explore Kiro, an AI IDE that works alongside you to turn ideas into production code with spec-driven development. - Devpost"
[2]: https://kiro.devpost.com/rules "Code with Kiro Hackathon: A challenge for developers to explore Kiro, an AI IDE that works alongside you to turn ideas into production code with spec-driven development. - Devpost"
[3]: https://pmc.ncbi.nlm.nih.gov/articles/PMC9174593/?utm_source=chatgpt.com "Disparities in thyroid care - PMC"
[4]: https://pmc.ncbi.nlm.nih.gov/articles/PMC11222593/?utm_source=chatgpt.com "Overall, sex-and race/ethnicity-specific prevalence ..."
