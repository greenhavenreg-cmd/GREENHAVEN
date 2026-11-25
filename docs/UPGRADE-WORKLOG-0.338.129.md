# Upgrade worklog — GH-CONNECT 0.338.129 / Run 403

**Current source version:** `0.338.129`  
**Baseline:** `GREENHAVEN-0.338.128-RUN402-NET-FIRST-WITHDRAWAL-COMMERCE-2026-11-25-1.zip`.  
**Scope:** restore visible status for paused PI registration rewards. Production remains **NOT APPROVED**.

## Coordinated release implementation steps
1. Re-opened the designated Run 402 archive and confirmed the reward-card component still returned `null` when the campaign was disabled and the account had not claimed it.
2. Replaced the silent hide with a visible paused-state panel.
3. Explained that claims are unavailable while the Testnet setup is verified and that showing the card does not credit PI.
4. Explicitly stated that existing PI balances and transaction history are unchanged.
5. Added a real refresh action using the existing server status endpoint.
6. Preserved server-authoritative claims and the empty client request body; no client-supplied reward amount was introduced.
7. Added `scripts/check-run403-reward-card-visible.mjs` for visibility, safety copy, refresh behavior, endpoint contract and version alignment.
8. Registered the Run 403 contract in `verify:static` and `prebuild:checks`.
9. Synchronized package, lockfile, app release, README, project truth, source-of-truth and verified manifest to `0.338.129`.
10. Preserved disabled PI reward and payout flags until the live migration history and RPC contracts are reconciled.
11. Ran the Run 403 gate, Run 300 release-integrity gate, and inherited Run 383/397/398/400/401/402 focused gates.
12. Attempted to create an isolated branch in the connected GitHub repository; the GitHub integration returned HTTP 403, so no branch or remote code update was made.

## Source-only verification scope
- Run 403 reward visibility gate: **6/6 passed**.
- Run 300 release integrity: **22/22 passed**.
- Run 383 identity/privacy grants: **9/9 passed**.
- Run 397 registration reward/referral gate: **16/16 passed**.
- Run 398 referral session isolation: **8/8 passed**.
- Run 400 sign-in UX: **4/4 passed**.
- Run 401 cross-surface polish: **16/16 passed**.
- Run 402 net-first withdrawal contract: **passed**.
- Full `npm run verify:static`: **PASS**, exit 0, under Node 22.16.0. Dependency-backed typecheck, lint, production build and browser/device acceptance remain unverified because the environment does not satisfy the project-pinned Node.js 24.15.0 runtime/dependency setup.
- Dependency-backed typecheck, lint, production build and browser/device acceptance remain unverified.

## Live environment / deployment limits
- The correct Supabase project is `jhlsjnmfpakvibuuoygx`. An additive service-role grant migration was applied and verified, and the existing verified `EUCLIDABO` identity received a missing profile projection with username/display name sourced from the verified Pi username. No PI/GHC transaction or balance was changed.
- Correct Vercel project `greenhaven` has Preview/`testnet` fee variables `GHC_MARKETPLACE_LISTING_FEE_PI=10` and `GHC_COMMUNITY_CREATE_FEE_PI=5`. Financial claim/withdrawal execution flags remain disabled.
- GitHub branch creation returned HTTP 403 from the connected integration. No GitHub push or Vercel deployment occurred. The current remote `testnet` branch still reports package version `0.338.119`; this archive is not yet the remote deployed source.
- Testnet migration history and historical account/transaction migration remain unresolved. No registration reward backfill or payout was run.
