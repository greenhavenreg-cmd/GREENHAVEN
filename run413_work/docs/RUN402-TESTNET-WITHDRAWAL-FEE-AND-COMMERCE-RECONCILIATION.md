# Run 402 — Testnet withdrawal and commerce reconciliation

## Applied to source
- Net-first withdrawal semantics: the amount typed into the PI withdrawal sheet is treated as the intended amount to receive. Server-side helper calculates the minimum gross atomic amount at 300 bps, and existing database quote remains responsible for available balance, identity linkage, wallet authorization, minimum/maximum checks, and authoritative fee/net quote.
- Quote freshness is tied to the user's requested net amount, not the gross reservation. Request creation re-derives gross on the server and fingerprints the server-derived quote and recipient.
- Testnet fee settings were added to Vercel project `gh-connect-5p3o` for Preview only and branch `testnet`: marketplace listing fee `10 PI`; community creation fee `5 PI`.

## Database state
The connected Testnet Supabase project `tpckwgdsjlkzscjlxiwe` has 47 migration records, while this source tree contains 242 SQL migration files. There are exact version matches, normalized-name candidates, and unmatched rows; filenames do not prove SQL equality. Existing registration-bonus RPCs differ from the Run 397 100 PI campaign policy. The campaign migration remains unapplied, and no reward claims or operator backfill were run.

## Withdrawal math
The requested net amount is `N`; server estimates gross as the smallest atomic `G` for which `G - ceil(G * 300 / 10000) >= N`. The database quote still calculates the final `grossAtomic`, `feeAtomic`, and `netAtomic`, and payout request creation reserves the gross. Before enabling requests, verify the database policy remains exactly 300 bps and that provider A2U submits exactly the quoted `netAtomic`. If database fee policy or rounding differs, fail closed and reconcile before deployment.

## Vercel environment scope
- `GHC_MARKETPLACE_LISTING_FEE_PI=10` — Preview target, `testnet` branch only.
- `GHC_COMMUNITY_CREATE_FEE_PI=5` — Preview target, `testnet` branch only.
- No production targets were added/changed. No payout or registration bonus flags were enabled.

## Verification
- `npm run verify:static`: PASS (full chain, exit 0).
- Run 402 net-first withdrawal contract: PASS.
- Run 400 welcome/sign-in: 4/4.
- Run 401 cross-surface styling: 16/16.
- Phase 4 withdrawal request lifecycle: 21/21.
- Phase 28 wallet consent flow: 46/46.
- SQL lexical integrity: PASS (251 migration/proposal files).
- Release hygiene: 17/17.
- ZIP integrity: PASS.

## Not done / deployment blockers
- No Supabase migration applied and no migration ledger rewritten.
- No 100 PI rewards issued; no Testnet backfill run.
- No PI withdrawal submitted; execution flags remain fail-closed.
- No dependency-backed TypeScript/lint/production build on Node 24.15.0; local runtime was Node 22.16.0.
- No live Pi Browser authentication/withdrawal E2E acceptance.
- No GitHub push and no Vercel deployment.
