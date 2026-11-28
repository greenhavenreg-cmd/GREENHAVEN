# Upgrade worklog — 0.338.165 / RUN453

1. Used the uploaded `GREENHAVEN-0.338.164-RUN452-CREATE-OTHERS-SCROLL-AND-APP-POLISH-2026-11-27.zip` as the sole implementation baseline.
2. Audited the shared authenticated app shell, full-screen flow variants, bottom navigation and existing scroll-root rules.
3. Added a shared `100vh` fallback followed by `100dvh` sizing for all `.gh-app-shell` instances, so older Android WebViews that do not support dynamic viewport units retain a usable full-screen layout.
4. Kept `min-height: 0` in the shell flex contract so nested screen panels can continue to scroll instead of forcing the outer shell to grow.
5. Standardized the bottom-navigation destination touch target to at least 48px without changing its route actions, tab state or cart behavior.
6. Added an 8-point focused RUN453 contract and registered it once in both `prebuild:checks` and `verify:static`.
7. Bumped package/release metadata to `0.338.165` and synchronized the package lock, in-app release marker and verified manifest.
8. Updated README, project truth, source-of-truth, build context and the current source-of-truth record while retaining the prior accepted-baseline distinction.
9. Added RUN453 to the documentation hygiene allowlist and registered its focused gate in both verification pipelines.
10. Re-ran RUN452 and RUN453 focused source contracts, release hygiene, dependency-lock integrity and project-truth checks.
11. Enumerated the full prebuild manifest in dry-run mode; 474 checks were discovered. No prebuild execution or deployment was claimed.

## Verification and acceptance boundary

The focused RUN453 source contract passes 8/8; RUN452 regression passes 7/7. Release hygiene passes 17/17, dependency-lock integrity passes, documentation hygiene passes, and project-truth checks pass 11/11. The 474-check prebuild manifest was enumerated in dry-run mode only. This source-only verification scope is a targeted shell viewport/navigation increment, not completion of the full RUN453 cross-device audit or the product-wide roadmap. Browser/device interaction, keyboard-resize behavior, accessibility testing, TypeScript, and a Next.js production build still require the project's Node 24.15.0 environment. The full static suite was attempted and stopped at four pre-existing RUN301 documentation-contract failures; those are documented by the failing gate and were not bypassed. No remote Git, Vercel, database, migration or payment-provider operation was performed.
