# Upgrade worklog — GH-CONNECT 0.338.127 / Run 401

**Current source version:** `0.338.127`
**Baseline:** `GREENHAVEN-0.338.126-RUN400-WELCOME-SIGNIN-UX-2026-11-25.zip` (latest generated derivative; original user-designated source of truth remains `GREENHAVEN-0.338.119-PHASE9-COORDINATED-ONBOARDING-IDENTITY-STORAGE-2026-11-24-3.zip`).
**Scope:** coordinated cross-surface premium visual polish. Production remains **NOT APPROVED**.

## Coordinated release implementation steps
1. Inspected the current shared app shell and existing surface selectors before changing styles.
2. Added `app/gh-premium-overhaul.css` as a separate, progressive enhancement layer.
3. Improved Feed card spacing, text readability, toolbar spacing, media presentation and touch targets.
4. Improved Marketplace card consistency, image surfaces, form sizing, loading states and product metadata.
5. Improved Community post spacing, readable copy, group banner consistency, touch targets and scroll containment.
6. Added scoped Research result/query/table/status refinements without changing data or authorization contracts.
7. Improved Messages bubble width, composer height, attachment previews, timestamps, scrolling and focus states.
8. Improved Discovery header/filter spacing, result scroll, selected filter feedback, card text wrapping and loading surfaces.
9. Added scoped Cart line-item separation, total typography, checkout hit area, error treatment and safe-area spacing.
10. Improved Profile cover positioning, identity wrapping, tabs, bio readability, media sizing and scrolling.
11. Added keyboard focus visibility, mobile breakpoints and reduced-motion support.
12. Added `scripts/check-run401-cross-surface-polish.mjs` and registered it in static and prebuild check chains.
13. Synchronized package, package-lock root and current release metadata to `0.338.127`.
14. Ran the Run 401 gate, Run 400 sign-in gate and documentation hygiene check successfully.
15. Preserved existing business logic and did not alter authentication identity, wallet ledger, payment settlement or referral reward issuance.

## Source-only verification scope
- Run 401 cross-surface polish gate: 14/14 passed.
- Run 400 welcome/sign-in gate: 4/4 passed.
- Documentation hygiene: passed after adding current docs to the explicit allowlist.
- Full `npm run verify:static` is still being checked against inherited release-gate expectations.
- Required runtime is Node.js 24.15.0 (`.nvmrc`). This workspace's runtime is Node.js 22.16.0, and installed dependencies are not certified for full TypeScript/lint/production build validation here.

## Limits and deployment safety
- Research and Cart styles are attached to the actual Research workspace root and both empty/non-empty Cart roots through `data-gh-module` attributes.
- This pass does not certify full accessibility compliance, device/browser rendering, data correctness, or production readiness.
- Testnet migration-history reconciliation remains unresolved. No Supabase migration/backfill was executed, no PI credit was issued, and no claim is made that 100 PI is withdrawable.
- No GitHub push or Vercel deployment was performed.
