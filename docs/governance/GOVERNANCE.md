## Community Governance

This document defines how the MADMall project collaborates, makes decisions, and incorporates community feedback.

### Goals and principles
- Be open by default and inclusive of diverse viewpoints
- Prefer lazy consensus; escalate only when needed
- Make design changes through an open review (OR) pull request process
- Keep feedback loops short with clear service-level targets

### Project roles
- Maintainers: Own releases, repo settings, final decisions, and moderation. They steward process, not outcomes.
- Contributors: Anyone proposing changes via issues, discussions, or pull requests.
- Advisory Board: A small, rotating group that provides non-binding guidance on strategy, ethics, risk, and major designs. See `ADVISORY_BOARD.md`.

### Decision-making
- Trivial/low-risk changes: Merge by lazy consensus after standard code review.
- Non-trivial design or user-facing changes: Use an Open Review Pull Request (OR-PR) labeled `rfc`.
- High-impact or sensitive proposals: Label the OR-PR with `advisory-needed` to trigger Advisory Board review.

### Proposal lifecycle (OR-PR)
1. Draft: Author opens a PR with the `rfc` label and fills the RFC template.
2. Community review: Minimum 7 calendar days open for comments unless clearly trivial.
3. Advisory review (conditional): If labeled `advisory-needed`, the board has up to 14 days to provide a recommendation.
4. Decision: Maintainers confirm consensus and decide to merge, iterate, or defer.
5. Implementation: Follow-up commits or PRs land the change behind flags if needed.
6. Retrospective: Capture learnings and update docs if the change is material.

### Breaking changes and deprecations
- Breaking changes always require an OR-PR (`rfc`) and a migration plan.
- Deprecations require timelines and communication in releases and `packages/docs`.

### Communication channels
- GitHub Issues: Bugs, actionable tasks, and implementation work.
- GitHub Discussions: Ideas, Q&A, announcements, and community calls.
- PR reviews: Technical and product feedback threaded to the specific change.

### Meetings and cadence
- Community call: Monthly, agenda and notes tracked via Discussions.
- Advisory Board: Quarterly sessions plus ad-hoc reviews for `advisory-needed` items.

### Moderation and conduct
We follow the Contributor Covenant. See `CODE_OF_CONDUCT.md`. Maintainers act as moderators and may escalate according to that policy.

### Amending this governance
Propose changes via an OR-PR labeled `rfc`. Maintainers ratify after community review; if the change affects board scope, request `advisory-needed` input.

