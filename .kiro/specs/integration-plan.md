# Integration Plan (Next Steps)

Order of Work
1) SSR Image Validation
- Add Next API route → Titan cultural/image check → cache → placeholder fallback.

2) Resource Badges
- Add credibility/inclusivity badges to `/resources` list from SSR scores.

3) Comedy Relief Score
- Add “Relief” badge and hide low‑score clips.

4) Circle Recommendations
- Recommend 3 circles on Concourse based on interests/history (mock → SSR).

5) Explainability
- “Why this?” tooltips referencing Titan fields.

6) Safety Guardrails
- Coach boundaries, disclaimers, escalation links.

## Implementation Milestones
- **D1**: SSR image validation + resource credibility badges
- **D2**: Comedy relief scoring + content filters  
- **D3**: Circle recommendations + explainability tooltips
- **D4**: Safety guardrails + medical disclaimers
- **D5**: Performance optimization + caching

## Technical Dependencies
- Titan agents must be deployed and accessible via SSR endpoints
- Image validation service needs S3 integration for placeholder fallbacks
- Recommendation engine requires user preference tracking
- All endpoints need caching layer for demo performance

---

**Related Specs:** [Titan Contracts](titan-contracts.md) • [Milestones](milestones.md) • [Risk Log](risk-log.md) • [MCP Ops](mcp-ops.md)

**What to Test on Video:**
- Show progression from mock data to live Titan integration
- Demonstrate badge system and content filtering in action
- Highlight explainability features ("Why this recommendation?")
- Show safety disclaimers and escalation pathways

---

*Last updated: September 14, 2024 by Kiro*

