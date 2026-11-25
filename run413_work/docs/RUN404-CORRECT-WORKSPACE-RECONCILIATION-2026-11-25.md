# Run 404 — Correct workspace, canonical Pi identity, and 100 PI ledger reconciliation

**Source candidate:** `gh-connect@0.338.130` (source-only; not pushed/deployed).

## Verified live project
- Supabase Testnet project: `jhlsjnmfpakvibuuoygx` (`https://jhlsjnmfpakvibuuoygx.supabase.co`).
- GitHub repository: `greenhavenreg-cmd/GREENHAVEN`, branch `testnet`.
- Vercel project: `greenhaven` under team `greenhavenreg-5659`, linked to the repository above.
- The older `gh-connect-5p3o` and `tpckwgdsjlkzscjlxiwe` project records are not the deployment/database targets for this run.

## Ledger migration and reward result
- Applied the Testnet-only `run397_testnet_registration_bonus_100_pi` migration. The Supabase migration ledger recorded it as `20261125065113`.
- Invoked the bounded idempotent backfill with explicit Testnet confirmation. Result: 1 account processed, 1 credit issued, 0 failures.
- Verified Pi identity: `EUCLIDABO`, account `cee048f6-2457-4883-8a7a-3bcb21250b5a`.
- Ledger unique reference: `registration_bonus:testnet_100:v1:cee048f6-2457-4883-8a7a-3bcb21250b5a`.
- Ledger amount: `1,000,000,000` atomic PI (100 PI), status `available`, asset `PI`, source `registration_bonus`, campaign `testnet_registration_100_v1`.
- Verified `gh_earnings_registration_bonus_status`: claimed true, cumulative target 100 PI.
- Verified `gh_earnings_withdrawable`: available 100 PI, withdrawable 100 PI, linked Pi wallet true, fee 300 bps (3%), eligible true.
- This is an internal Testnet ledger credit and withdrawal quote eligibility; no Pi A2U transfer was executed.

## Identity result
- The correct database currently contains exactly one distinct Pi identity, one profile, one GHC account, one session owner, and no prior PI earnings entries before the campaign backfill.
- Profile username and display name are `EUCLIDABO`.
- Source changes preserve the verified Pi username's exact spelling as the only public handle. Missing Pi usernames show `Pi username not linked`; the GreenHaven ID remains separately labeled as an ID, not a second username.
- Do not import the six accounts observed in a different database without authoritative identity mapping and transaction provenance. They do not exist as verified identities in this correct project at the time of this audit.

## Withdrawal and environment safety
- Live payout request, payout execution, and Pi A2U flags remain disabled. They must remain disabled until the correct source release is deployed and the Pi Testnet provider worker is verified end-to-end. A withdrawable ledger quote is not proof of an executed payout.
- Marketplace listing and community creation fee variables are set to 10 PI and 5 PI, respectively, for Preview/testnet only.
- The registration campaign flag remains disabled in Vercel until source compatibility and deployment are verified; do not enable it against the older `0.338.119` repository source.

## Migration history status
- The connected database had 235 migration records before Run 397 and 236 after it.
- The source tree has 242 migration SQL files. Remaining migration-source discrepancies must be reconciled row-by-row; files explicitly marked REVIEW_REQUIRED (including research quota and payout/referral work) must not be blindly applied or marked as applied.
- No historical transaction or balance rows were overwritten or copied from the wrong project.

## Verification
- Full `npm run verify:static`: PASS under Node 22.16.0; dependency-backed typecheck/lint/production build remain uncertified because Node 24.15.0 and installed dependencies are unavailable in this workspace.
- Run 403 reward visibility: 6/6; Run 402 net-first fee: PASS; Run 400 welcome/sign-in: 4/4; Run 401 cross-surface polish: 16/16; Run 404 canonical username: 5/5; Run 300 release integrity: 22/22; Run 301 release hardening: 20/20.

## Deployment status
- The current remote `testnet` package version remains `0.338.119` at audit time. The updated local source package is `0.338.130`.
- GitHub branch creation was denied by the connected integration (HTTP 403). No source push or Vercel deployment is claimed by this report.
