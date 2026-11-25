# Run 401 — Cross-surface premium polish

**Scope:** progressive visual and interaction polish for Feed, Marketplace, Community, Research, Messages, Discovery, Cart and Profile. **This is not a claim that every backend weakness is fixed.** The change is a shared, visual-only CSS layer so existing data flows and business logic are preserved.

## Ten improvements per surface

### Feed
1. More generous post padding. 2. Improved body-copy line height. 3. Rounded media presentation. 4. Responsive toolbar padding. 5. Consistent skeleton radius. 6. Larger reaction/comment targets. 7. More legible tiny metadata. 8. Stable scrolling/overscroll. 9. Balanced headings. 10. Mobile-specific padding.

### Marketplace
1. Consistent product card radius. 2. Product image surface fallback. 3. Balanced product titles. 4. Stable icon tiles. 5. Constrained search/form widths. 6. Clear input surface. 7. Tactile button feedback. 8. Consistent loading animation duration. 9. Better metadata line height. 10. Contained scrolling.

### Community
1. Stable header sizing. 2. Better post spacing. 3. More readable post copy. 4. Minimum action hit areas. 5. Consistent banner backgrounds. 6. Better metadata legibility. 7. Rounded status/error surfaces. 8. Contained scrolling. 9. Consistent media crop. 10. Long-content wrapping.

### Research
1. Balanced result headings. 2. Improved result-copy line height. 3. Full-width query controls. 4. Table width containment. 5. Progress-state accent. 6. Consistent result-card radius. 7. Touch-friendly actions. 8. Safe long code wrapping. 9. Rounded status surfaces. 10. Keyboard focus visibility.

### Messages
1. Prevent shell overflow. 2. Constrain bubble widths. 3. Comfortable composer height. 4. Rounded media previews. 5. Stable scroll gutters. 6. Larger action targets. 7. Tabular timestamps. 8. Clear status surfaces. 9. Safe code wrapping. 10. Visible composer focus.

### Discovery
1. Clear header spacing. 2. Responsive intro padding. 3. Stable result scroll. 4. Constrained filter controls. 5. Prevent item shrink overflow. 6. Consistent media crop. 7. Balanced card headings. 8. Clear selected filter border. 9. Skeleton/card consistency. 10. Safe long text wrapping.

### Cart
1. Clear item separation. 2. Comfortable quantity controls. 3. Tabular totals. 4. Prominent checkout hit area. 5. Clear error surfaces. 6. Consistent item imagery. 7. Tactile action feedback. 8. Safe-area bottom clearance. 9. Balanced headings. 10. Long-title wrapping.

### Profile
1. Better cover positioning. 2. Safe long identity names. 3. More usable tab scrolling. 4. Comfortable tab hit area. 5. More readable bio line height. 6. Responsive media sizing. 7. Touch-friendly actions. 8. Contained scrolling. 9. Balanced section headings. 10. Consistent status surfaces.

## Safety and limits
- Added a separately imported stylesheet; existing component logic and data contracts are unchanged.
- Added reduced-motion rules, responsive adjustments, and keyboard focus affordances.
- Wired the Research workspace root and both empty/non-empty Cart roots to the scoped `data-gh-module` styling hooks.
- This pass does not repair or certify backend/data issues, accessibility compliance, real-device rendering, payment flows, PI balance/withdrawal eligibility, or production deployment.
- The 100 PI Testnet reward remains blocked pending migration-history reconciliation and verification of the live reward/ledger RPC contracts. No migrations or credits were applied.
