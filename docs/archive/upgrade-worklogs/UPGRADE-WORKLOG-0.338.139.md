# Upgrade worklog — GreenHaven 0.338.139 / RUN426 Phase 0

**Date:** 26 November 2026  
**Parent:** 0.338.138 (RUN424/RUN425)  
**Scope:** Community, Messages, Discovery and shared navigation/notifications.

## Implementation steps

1. Reopened the current 0.338.138 candidate as the parent source and retained its RUN424/RUN425 fixes.
2. Reviewed W3C mobile accessibility guidance and translated relevant WCAG 2.2 criteria into the Phase 1 acceptance plan.
3. Reviewed Android messaging progression guidance for offline delivery, retries, notification deep links and read receipts.
4. Reviewed Android conversation notification guidance for target resolution and permission checks.
5. Reviewed Apple notification guidance for concise, deduplicated and privacy-preserving alerts.
6. Reviewed community onboarding research and the European Commission JRC community platform checklist.
7. Inspected the existing Community hub, domain adapters, governance and onboarding components.
8. Inspected the canonical Messages screen, durable server message store, discovery ranking and filtering foundations.
9. Defined shared architecture decisions, performance/accessibility targets, age-appropriate discovery constraints and the cross-surface acceptance matrix.
10. Added the RUN426 static regression gate, registered it in prebuild/static verification, and synchronized release metadata to 0.338.139.

## Implemented

- Researched mobile accessibility, messaging reliability, notification design and community onboarding using W3C, Android Developers, Apple HIG, Community Inc. research and the European Commission JRC community platform checklist.
- Inspected the existing Community, Messages, Discovery, messaging-store, discovery-ranking and performance-budget source foundations.
- Added `docs/RUN426-PHASE0-SOCIAL-EXPERIENCE-FOUNDATION-2026-11-26.md` with source inventory, applied design decisions, shared domain contracts, performance/accessibility targets, release acceptance matrix and explicit non-goals.
- Recorded a Phase 1 age-appropriate Discovery acceptance requirement: teen accounts must not be shown dating-oriented discovery or matching.
- Added `scripts/check-run426-phase0-social-experience-foundation.mjs` and wired it into prebuild and static verification.
- Synchronized package, lockfile and app release identity to `0.338.139`.

## Verification

- **Source-only verification scope:** Phase 0 verifies source contracts and architecture inventory; it does not establish live feature or device acceptance.
- Supported project runtime is Node.js 24.15.0; this workspace uses Node 22.16.0, so dependency-backed typecheck, lint and production build remain outstanding.

- RUN426 Phase 0 source-contract gate: **15/15 PASS**.
- Full `npm run verify:static`: **PASS**, exit code 0; this includes the existing regression suite and the new RUN426 gate.
- Prebuild dry-run: **448/448 checks discovered**; dry-run only. Actual prebuild remains blocked locally by Node 22.16.0 versus required Node 24.15.0.
- No database migrations, Supabase schema changes, live data writes, Pi/GHC/wallet changes, GitHub push or Vercel deployment were performed.

## Release boundary

This is a source-only foundation. It does not claim that the Community, Messages or Discovery redesign is complete. User-facing redesign and functional implementation begin in Phase 1 after detailed component/API journey tracing. Pi remains Testnet-only; Mainnet is out of scope.
