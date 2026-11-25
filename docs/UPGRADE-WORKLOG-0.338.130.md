# GreenHaven upgrade worklog — 0.338.130 / Run 404

Date: 2026-11-25

## Correct workspace
- Supabase Testnet: `jhlsjnmfpakvibuuoygx`.
- GitHub: `greenhavenreg-cmd/GREENHAVEN`, branch `testnet`.
- Vercel: project `greenhaven`, team `greenhavenreg-5659`.

## Changes in this source candidate
1. Synced `package.json`, lockfile, `lib/app-release.ts`, README, project truth and verified manifest to `0.338.130`.
3. Restored the safe credential-free `.env.example`; private credentials are blank and Testnet payout/A2U execution defaults remain disabled.
4. Added Run 404 regression coverage for Pi username-only public handles. Profile hero and profile screen now display the verified Pi username exactly as the sole public handle; they no longer synthesize a second handle from the display name. GreenHaven ID remains separately labelled as an account/lookup ID in its dedicated identity card.
5. Preserved the visible reward status card when the campaign is paused; the server ledger remains authoritative.
6. Added the live workspace reconciliation report and retained existing UI/domain architecture.

## Live Testnet changes independently verified
7. Applied `run397_testnet_registration_bonus_100_pi`; migration ledger version `20261125065113`.
8. Explicitly invoked the bounded Testnet backfill. Result: 1 processed, 1 credited, 0 failed.
9. Verified identity `EUCLIDABO`, account `cee048f6-2457-4883-8a7a-3bcb21250b5a`, has one `available` PI ledger credit of `1,000,000,000` atomic PI (100 PI) with idempotency ref `registration_bonus:testnet_100:v1:cee048f6-2457-4883-8a7a-3bcb21250b5a`.
10. `gh_earnings_registration_bonus_status` returns claimed=true and 100 PI. `gh_earnings_withdrawable` returns available=100 PI, withdrawable=100 PI, eligible=true, linked Pi wallet=true and 300 bps fee.
11. Vercel Testnet Preview has listing fee 10 PI and community creation fee 5 PI. The registration campaign flag is held at `0` until source `0.338.130` is deployed; payout request, execution and A2U flags remain disabled.

## Validation
- Run 403 reward visibility: 6/6.
- Run 402 net-first withdrawal fee: PASS.
- Run 400 welcome/sign-in UX: 4/4.
- Run 401 cross-surface styling: 16/16.
- Run 404 Pi username-only public handle: 5/5.
- Run 300 release integrity: 22/22.
- The source-level verification scope includes the full `npm run verify:static` chain, which passed after restoring `.env.example`, synchronizing release metadata, adding the Run 404 worklog/build context, and classifying the new report. The project requires Node.js 24.15.0; this environment uses Node 22.16.0 and dependencies are not installed, so dependency-backed typecheck/lint/production build are not certified.

## Not complete
- GitHub branch creation was denied by the connected integration (403); no push has occurred.
- No Vercel deployment has occurred. Do not enable the campaign flag until the matching source is deployed and the route/status contract is verified against the deployed app.
- The correct database currently has one verified Pi identity, not the six identities found in the wrong database. Do not fabricate or duplicate those other accounts. Import them only after a stable account mapping and every PI/GHC transaction and progress record are reconciled from an authoritative source.
- Remaining migration history/source inventory differences need row-by-row provenance review. The separate Run 397 referral migration is not confirmed applied.
- No Pi A2U transfer was submitted. Withdrawal eligibility is a ledger/quote result, not proof of payout completion.
- Feed, Marketplace, Community, Research, Messages, Discovery, Cart and Profile have existing Run 401 style hooks; complete device-level visual QA and broader functional redesign still remain outstanding.

Production remains NOT APPROVED.
