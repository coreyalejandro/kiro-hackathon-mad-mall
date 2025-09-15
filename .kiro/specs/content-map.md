# Content Map (Page → Copy → Data Source)

Concourse `/`
- Hero: title, description, chips (members/relief/stories) — Static strings (copy) + counts (mock)
- Explore cards: Peer Circles, Comedy, Story Booth, Marketplace, Resource Hub — Mock API fields
- Today’s Highlights: 3 cards — Static copy (demo) or mock activity
- Recent Activity: list items — Mock API `activities`

Peer Circles `/circles`
- Intro header — Static copy
- Circles grid — Mock API `circles`

Comedy Lounge `/comedy`
- Featured player — UI component `ComedyTherapyPlayer`
- Clips list — Mock API `comedyClips`
- Planned badges — Mock relief score (Titan later)

Resource Hub `/resources`
- Filters — Mock lists (categories/formats/credibility)
- Articles list — Mock API `articles`
- Badges — Planned (credibility, inclusivity)

Article Detail `/resources/[id]`
- Header title + excerpt — Mock article
- Body — Mock article content

Story Booth `/stories`
- Uploader — UI component
- Story list w/ pagination — Mock API `stories` (paginated wrapper)
- Featured story — Seeded narrative (“If You Like It, I Love It”)

Auth `/auth`
- Sign‑in/out buttons — Amplify placeholders; copy only

Data Sources
- Mock: `src/lib/mock-api.ts` + `synthetic-data.ts`
- Titan (planned): cultural validation, moderation, credibility/relief scoring, recommendations.

---

**Related Specs:** [MADMall Overview](madmall-overview.md) • [Data Seeds](data-seeds.md) • [UX/A11y Checklist](ux-a11y-checklist.md)

**What to Test on Video:**
- Each page shows populated, meaningful content without placeholders
- All CTA buttons navigate correctly; filters affect Resource Hub list
- Content feels authentic and culturally appropriate throughout
- Consistent branding and messaging across all sections

---

*Last updated: September 14, 2024 by Kiro*

