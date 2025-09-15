# Risk Log

- Privacy/PHI
  - Risk: Story posts reveal sensitive health info.
  - Guardrail: Pre‑publish Titan privacy checks; clear consent text.

- Cultural Harm
  - Risk: Images/text that stereotype or exclude.
  - Guardrail: Titan cultural validation gate; community review.

- Medical Safety
  - Risk: Coaching interpreted as clinical advice.
  - Guardrail: Disclaimers; escalation to reputable resources; no diagnosis.

- Triggering Content
  - Risk: Comedy/Stories induce anxiety.
  - Guardrail: Relief score + filters; content warnings.

- Data Retention
  - Risk: Local caching leaks data
  - Guardrail: Minimal storage; purge controls; SSR caches with TTL

## Mitigation Status
- **Privacy/PHI**: ✅ Implemented - Titan privacy checks active, consent flows ready
- **Cultural Harm**: ✅ Implemented - Cultural validation scoring, community review process
- **Medical Safety**: ⚠️ In Progress - Disclaimers added, escalation paths defined
- **Triggering Content**: ⚠️ In Progress - Relief scoring system, content warnings planned
- **Data Retention**: ✅ Implemented - localStorage minimal, TTL caching configured

## Escalation Procedures
1. **High-risk content detected**: Immediate removal, human review queue
2. **Medical emergency indicators**: Display crisis resources, encourage professional help
3. **Cultural sensitivity violations**: Community moderator notification, content review
4. **Privacy concerns**: Data purge protocols, user notification procedures

---

**Related Specs:** [Integration Plan](integration-plan.md) • [Titan Contracts](titan-contracts.md) • [UX/A11y Checklist](ux-a11y-checklist.md)

**What to Test on Video:**
- Show safety disclaimers prominently displayed
- Demonstrate content moderation in action (if possible)
- Highlight crisis resource accessibility
- Show data privacy controls and settings

---

*Last updated: September 14, 2024 by Kiro*

