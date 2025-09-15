# UX/A11y Checklist (Cloudscape)

- Headings: Single H1 per page (`Header variant="h1"`); H2/H3 for sections/cards.
- Landmarks: ContentLayout header/content; avoid duplicate landmarks.
- Keyboard: All CTAs keyboard reachable; `role="button"` used sparingly; rely on Buttons.
- Focus: Visible focus rings; no focus traps.
- Labels: aria-labels on icon‑only buttons; meaningful link text.
- Contrast: Default Cloudscape tokens OK; avoid custom low‑contrast overlays.
- Motion: Subtle parallax tolerances; no rapid flashing
- Screen readers: All images have meaningful alt text; decorative images marked appropriately
- Color: Information not conveyed by color alone; sufficient contrast ratios maintained
- Forms: All inputs properly labeled; error messages clear and helpful
- Navigation: Consistent navigation patterns; skip links available

## Cultural Accessibility
- Language: Plain language used; medical terms explained
- Representation: Diverse imagery reflecting community
- Context: Cultural references appropriate and inclusive
- Tone: Respectful, empowering, trauma-informed language throughout

## Testing Checklist
- [ ] Keyboard navigation works on all interactive elements
- [ ] Screen reader announces all content meaningfully  
- [ ] Color contrast meets WCAG AA standards
- [ ] Focus indicators visible and logical
- [ ] All images have appropriate alt text
- [ ] Forms provide clear validation feedback
- [ ] Content scales properly at 200% zoom
- [ ] No flashing or rapidly moving content

---

**Related Specs:** [Content Map](content-map.md) • [Risk Log](risk-log.md) • [MADMall Overview](madmall-overview.md)

**What to Test on Video:**
- Demonstrate keyboard navigation through all sections
- Show screen reader compatibility (if possible)
- Highlight cultural sensitivity in language and imagery
- Test responsive design at different screen sizes

---

*Last updated: September 14, 2024 by Kiro*

