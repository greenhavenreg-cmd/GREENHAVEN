# GreenHaven Upgrade Worklog — 0.338.177

**Candidate:** RUN506 — Direct-call control state and accessibility  
**Date:** 28 November 2026  
**Status:** Source candidate only; not approved for production.

1. Established v0.338.176 RUN505 as the exact parent source archive supplied in this conversation.
2. Verified the ZIP archive integrity before extraction.
3. Reviewed the existing direct-call sheet and call session state lifecycle.
4. Identified that local microphone/camera toggle UI state was not explicitly reset when `session.callId` changed.
5. Reset both local toggle states on call identity changes.
6. Added `aria-pressed` to microphone and camera controls so assistive technology can perceive their toggle state.
7. Added a polite, atomic live region for call-phase announcements.
8. Added a focused RUN506 regression check and registered it in `verify:static` and `prebuild:checks`.
9. Updated package, lockfile, in-app release identity, current source documents and migration manifest version to 0.338.177.
10. Preserved all SQL migrations and financial authority code; no payment, Pi, GHC, withdrawal, membership, reward, referral or curation settlement implementation was changed.

## Verification scope

The project requires **Node.js 24.15.0**. The available runtime for this pass is Node.js 22.16.0. Static verification was attempted; it stopped at the release-gate check because the versioned worklog was initially absent. The worklog has now been added; the complete static suite must be rerun.

`prebuild:checks` was also attempted and stopped because the installed dependency tree is incomplete (`typescript` cannot be resolved). A full dependency-backed TypeScript check, ESLint run and Next.js production build are therefore not certified.

## Source-only verification scope and limits

No live Supabase, Pi SDK, Pi Testnet, Pi Mainnet, Vercel deployment, GitHub push, database migration application, browser/device acceptance or real call transport test was performed. Production remains NOT APPROVED pending the supported-runtime and operator gates.

## RUN512
Testnet activation profile gains `PI_EARNINGS_ADAPTERS_ENABLED=true` and `GH_WITHDRAWAL_OPERATOR_IDS`; new `check-run512-testnet-profile-parity` guard in `verify:static`. See `RUN512-TESTNET-PROFILE-PARITY-2026-11-28.md`.
