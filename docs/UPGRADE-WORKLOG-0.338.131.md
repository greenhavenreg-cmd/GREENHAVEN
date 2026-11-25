# GreenHaven upgrade worklog — 0.338.131 / Run 405

## Scope
Local-only source handoff prepared for the user to review and push through GitHub Desktop. This work does not claim a GitHub commit, Vercel deployment, or new live Supabase mutation.

## Changes
1. Added `20261125150000_run405_registration_backfill_account_discovery.sql` to expand the existing operator-only, bounded Testnet reward backfill across stable account roots: verified Pi identities, profiles, sessions, progress, achievements, GHC accounts, GHC transactions and PI ledger accounts.
2. The new migration only replaces the backfill function; it does not invoke it or issue rewards. The campaign's existing claim function remains the authority for cumulative credits and idempotency.
3. Updated profile hero title precedence to use the Pi username when available, while retaining the GreenHaven ID as a separate account identifier.
4. Standardized withdrawal authorization failure copy to “Try again”. The welcome sign-in screen retains one fingerprint-style action: “Sign in” before an attempt, “Try again” after a failed attempt, and a busy state while authentication is in flight.
5. Preserved the Run 401 scoped premium CSS layer for Feed, Marketplace, Community, Research, Messages, Discovery, Cart and Profile.
6. Synchronized package, lockfile and release metadata to `0.338.131`; added Run 405 release gate to static and prebuild checks.
7. Added a reconciliation handoff that explicitly distinguishes ledger credits from on-chain transfers and requires source/destination migration comparison before import.

8. Kept reward and payout execution feature gates fail-closed; the source does not enable payouts by default.
9. Preserved server-side account ownership and financial authority; no client-supplied reward amount was introduced.
10. Added explicit local handoff and source-to-destination reconciliation steps for the user’s GitHub Desktop workflow.

## Source-only verification scope
This is source-only verification scope. It does not certify live database state, provider transfer completion, browser/device acceptance, or Production readiness.

## Validation
- Run 400 welcome/sign-in UX: 4/4.
- Run 401 cross-surface polish: 16/16.
- Run 402 net-first withdrawal fee contract: pass.
- Run 403 reward-card visibility: 6/6.
- Run 404 canonical Pi username display: 5/5.
- Run 405 local handoff: 10/10.
- Full `npm run verify:static`: initially stopped at Run 300 because README, project truth and verified manifest still declared the old version; these pointers were updated in this increment. Re-run the full chain after the metadata updates.

## Acceptance still required
- Run `npm ci` and `npm run typecheck`, `npm run lint`, `npm run build` under exact Node 24.15.0.
- Apply the new migration to the intended Testnet project after reviewing its actual migration history and confirming the project reference.
- Reconcile the other historical accounts by stable IDs and provenance; do not infer or create missing identities from display names.
- Run the bounded backfill in batches and verify each result against the actual available/withdrawable PI RPC.
- Deploy to the correct Vercel Testnet Preview only after source and database contract agree; test Pi Browser authentication and a small real Testnet payout before enabling payout execution.
