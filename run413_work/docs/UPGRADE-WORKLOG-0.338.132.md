# GreenHaven upgrade worklog — 0.338.132 / Run 406

This worklog records the coordinated release implementation steps and source-only verification scope. The project requires Node.js 24.15.0 for the dependency-backed production build.

## Implementation steps
1. Preserve Run 405 as the parent source and keep the existing architecture and UI structure intact.
2. Inspect the user's 110-second wallet/rewards/settings recording.
3. Inspect the correct Testnet Supabase project's live table grants and RLS status.
5. Confirm missing service-role SELECT on the canonical social visibility tables.
6. Confirm missing service-role SELECT on marketplace listings and variants.
7. Confirm missing service-role SELECT on membership entitlements.
8. Add the Run 406 idempotent, least-privilege server-read grant migration.
9. Apply the grant migration to the correct Testnet database and verify all 11 tables.
10. Keep RLS enabled and explicitly deny direct client-role SELECT privileges.
11. Improve profile timeline failure messaging without bypassing privacy enforcement.
12. Remove misleading marketplace local-catalog fallback wording.
13. Expose PI registration rewards directly in Wallet for both asset rails.
14. Remove background auto-claim; registration rewards now require explicit user action.
15. Refine the wallet hero with a deep GreenHaven forest palette while keeping PI/GHC ledgers separate.
16. Synchronize version metadata, migration inventory, documentation hygiene and static/prebuild gates.

## Verification
- Run 406 focused gate: 9/9.
- Run 405 local handoff gate: 10/10.
- Run 403 registration reward visibility gate: 6/6.
- SQL lexical integrity: passed.
- Migration inventory check: passed (244 source migrations; 125 REQUIRED, 1 REQUIRES_APPROVAL, 2 PROPOSAL, 116 REVIEW_REQUIRED).
- Supabase Testnet ACL verification: 11/11 tables grant SELECT to service_role, deny SELECT to anon/authenticated, and retain RLS.
- Full static verification is being run against the current source; dependency-backed typecheck/lint/build and browser/device acceptance are not certified in this Node 22/no-node_modules workspace.

## Testnet release gates still outstanding
Vercel Preview flags scoped to the `testnet` branch have been staged for the next deployment: registration bonus, activity rewards, referral settlement, curation redistribution v1/v2, and Pi purchase payments are true. The current deployment has not been redeployed, so these values are not yet active in the running build. `PI_EARNINGS_PAYOUT_REQUESTS_ENABLED`, `PI_EARNINGS_PAYOUT_EXECUTION_ENABLED`, and `PI_A2U_ENABLED` remain false because the payout executor is not yet verified; enabling requests without execution would strand reserved PI. Actual Pi A2U execution must remain disabled until a funded Testnet executor and end-to-end authorization, idempotency, receipt reconciliation, recovery and duplicate-payment acceptance are verified. Production/Mainnet settings remain unchanged.
