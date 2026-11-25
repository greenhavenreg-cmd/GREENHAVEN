# Run 398 — Referral Session Isolation and Public API Minimization

**Package:** `gh-connect@0.338.125`  
**Baseline:** Run 397 source archive 0.338.124  
**Classification:** source-only follow-up; production remains **NOT APPROVED**.

## Findings and changes

1. The referral card cleared account-derived state before loading, but overlapping asynchronous requests could still complete out of order and restore stale referral information after an account/session switch. Added abortable requests, a monotonic request sequence, and freshness checks before accepting both status and fallback-code responses.
2. The card now explicitly reloads referral state after `ghc:wallet-auth-changed` and the existing `ghc:referral-refresh` event. Unmount invalidates the request sequence and aborts in-flight reads.
3. The visibility-resume code already dispatched `ghc:referral-refresh` but had no matching listener; this is now wired.
4. Removed the internal `referrerUserId` from the public referral status API and client response contract. Server-side attribution still resolves and stores referral relationships; no internal account identifier is required by the card.
5. Added a focused source regression gate and registered it in `verify:static` and `prebuild:checks`.
6. Synchronized current release metadata to `0.338.125`; dependency versions and database schema are unchanged.

## Verification

- `npm run verify:static`: **passed**, exit 0; 5,053 PASS lines, zero FAIL lines.
- Run 398 referral session-isolation gate: 8/8.
- Run 397 registration rewards/referral gate: 16/16.
- Phase 9 membership session safety: 15/15.
- Phase 9 membership release gate: 16/16.
- Phase 8 rewards history: 20/20.
- Project truth: 11/11.
- Release hygiene: 17/17.
- SQL lexical integrity: 251 migration/proposal files passed.
- Run 301 release gate: previously failed three worklog contract assertions; corrected the current worklog to include numbered implementation steps, source-only verification scope and Node runtime declaration. The subsequent complete static run passed Run 301 and the full static chain.

## Additional live Testnet migration-history finding (read-only)

The follow-up reconciliation in `docs/RUN399-TESTNET-MIGRATION-HISTORY-RECONCILIATION.md` compares all 47 recorded database migration rows with the 242-file source inventory: 16 exact version-prefix matches, 11 normalized-name candidates with version drift, and 20 records without an exact source filename match. These are filename-level classifications, not proof of deployed SQL equivalence. The detailed CSV is `docs/RUN397-TESTNET-MIGRATION-HISTORY-RECONCILIATION.csv`. This reinforces the decision not to apply the Run 397 reward/referral migrations or execute the 100 PI backfill until the ledger is reconciled.

## Outstanding release gates

`npm run prebuild:checks` stops because the workspace has no installed `typescript` package (`ERR_MODULE_NOT_FOUND`) and uses Node 22.16.0 rather than the required Node.js 24.15.0. Dependency-backed TypeScript, lint, Next production build, and browser/device account-switch tests are not certified.

No database migrations or backfill were applied; no PI was credited; no referral reward was settled; no GitHub push or Vercel deployment occurred. The Run 397 Testnet migration-history mismatch remains unresolved, so the 100 PI Testnet campaign migrations remain review-required and must not be applied or backfilled until migration history and live RPC contracts are reconciled.
