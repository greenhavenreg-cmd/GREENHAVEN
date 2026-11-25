# Run 398 — Referral Session Isolation and Public API Minimization

**Package:** `gh-connect@0.338.125`
**Baseline:** Run 397 archive `GREENHAVEN-0.338.124-RUN397-MEMBERSHIP-REWARDS-REFERRAL-100PI-2026-11-25.zip`
**Scope:** Surgical source-only follow-up; no dependency versions or database schema changed.

## Findings fixed

1. Referral status requests could overlap; a slower response started under an old account/session could finish after a newer request and repopulate stale account-derived data. Added an AbortController plus monotonically increasing request sequence and checked freshness before accepting responses.
2. Referral card listened to wallet-auth changes only indirectly; now auth changes explicitly trigger a fresh status load. Unmount invalidates and aborts pending requests.
3. The UI dispatched `ghc:referral-refresh` on visibility resume but had no matching listener. Added the matching listener.
4. The public referral status endpoint exposed an internal referrer user ID even though the UI did not need it. Removed it from the status route and client contract; internal attribution operations remain server-side.

## Verification

- Run 398 source regression gate: run with `node scripts/check-run398-referral-session-isolation.mjs`.
- Existing Run 397 gate and relevant static checks should be run with the project's supported Node.js 24 runtime.
- Package, lockfile root version, and app release metadata are synchronized at `0.338.125`; no dependencies were changed.
- This is a source-only change. It does not apply the held Run 397 migrations, issue any PI reward, settle referral rewards, or change live Testnet/Production configuration.
- Full TypeScript, lint, production build, browser account-switch test, and live API integration test remain release gates until run in the project Node 24 environment with dependencies installed.
