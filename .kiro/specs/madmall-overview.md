# MADMall Overview (Kiro Spec)

Purpose
- Deliver a Cloudscape-grade wellness hub for Black women with Graves’ disease.
- Prove Kiro can orchestrate culturally safe UX + Titan agents across an Amazon‑style ecosystem.

Scope (MVP demo)
- UI: Cloudscape app with pages: Concourse, Peer Circles, Comedy Lounge, Resource Hub, Story Booth, Auth.
- Data: Mock API (client hooks via React Query) backed by `synthetic-data` generator.
- Agents: Titan agent stubs for cultural validation, moderation, recommendations, wellness coach (wired later SSR).

Routes
- `/` Concourse (hero, highlights, cards to sections)
- `/circles` Peer Circles (grid, descriptions)
- `/comedy` Comedy Lounge (featured player, clips)
- `/resources` Resource Hub (filters: category/format/credibility; article list)
- `/resources/[id]` Article details
- `/stories` Story Booth (uploader + list)
- `/preview/page-header` Page header visual preview

Architecture (current)
- Cloudscape UI → React Query hooks → `src/lib/mock-api.ts` → `synthetic-data.ts`
- Client env validation in `src/lib/env.ts` (NEXT_PUBLIC_* only)
- Image validation placeholder via `src/lib/image-validation.ts` (to be SSR‑backed by Titan)
- Agents (JS libs): `packages/bedrock-agents/lib/agents/*`

Key Files
- Concourse: `packages/web-app/src/components/pages/ConcourseContent.tsx`
- Hero: `packages/web-app/src/components/ui/CloudscapeHero.tsx`
- Mock API: `packages/web-app/src/lib/mock-api.ts`
- Synthetic data: `packages/web-app/src/lib/synthetic-data.ts`
- Queries (hooks): `packages/web-app/src/lib/queries.ts`

Open Gaps (post‑demo)
- Move image/content validation SSR; unify Titan JSON contracts.
- Surface explainability badges (credibility/inclusivity/relief) across lists.
- Circle matching + coach guardrails (medical/legal safety).

What to Test on Video
- Concourse hero (chips, actions) → Circles → Comedy → Resources → Stories → back to Concourse highlights.
- Smooth nav, zero console errors, clear culturally safe framing.

---

## Data Flow (today)
1) UI calls React Query hooks in `queries.ts`.
2) Hooks call `api` in `mock-api.ts` (in‑memory, persisted to `localStorage`).
3) Synthetic data seeds lists for articles, clips, stories, activity, circles.

Planned (next)
- SSR endpoints proxy Titan agents; add caching and schemas; annotate items with scores.

## How to Run + Routes

### Quick Start
```bash
# Clone and install
git clone [repo-url]
cd kiro-hackathon-mad-mall
pnpm install

# Start development server
pnpm run dev

# Open browser to http://localhost:3000
```

### Environment Setup
1. Copy `packages/web-app/.env.local.example` to `packages/web-app/.env.local`
2. No additional configuration needed for demo (uses mock data)

### Available Routes
- `/` - Concourse (main hub)
- `/circles` - Peer Circles discovery
- `/comedy` - Comedy Lounge with relief tracking
- `/resources` - Resource Hub with filtering
- `/resources/[id]` - Individual article pages
- `/stories` - Story Booth community sharing
- `/preview/page-header` - Component preview page

## Constraints
- Pure Cloudscape; zero custom CSS dependencies
- Demo stable on `pnpm run dev:web` with `.env.local` in `packages/web-app/`
- All data mocked via `synthetic-data.ts` for consistent demo experience

---

**Related Specs:** [Content Map](content-map.md) • [Data Seeds](data-seeds.md) • [Integration Plan](integration-plan.md) • [Milestones](milestones.md)

**What to Test on Video:**
- Concourse hero with action buttons and community stats
- Smooth navigation between all sections without console errors
- Cultural authenticity visible in all content and imagery
- Responsive design on different screen sizes

---

*Last updated: September 14, 2024 by Kiro*

