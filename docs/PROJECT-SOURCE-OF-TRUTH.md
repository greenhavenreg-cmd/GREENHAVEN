> **Current authority override (26 November 2026):** The current working candidate is `gh-connect@0.338.154` / RUN442, documented in `docs/CURRENT-SOURCE-OF-TRUTH-2026-11-26.md`. Three additive migrations were applied and postflight-verified on Testnet; four remain held. The old RUN390/RUN384 state below is historical and must not override RUN442's live reconciliation report. The accepted source baseline remains 0.338.139; RUN442 is not accepted, pushed or deployed.

> **Current authority notice (26 November 2026):** This document is historical context. Use `docs/CURRENT-SOURCE-OF-TRUTH-2026-11-26.md` and the current RUN424 candidate `GREENHAVEN-0.338.138-RUN424-IDENTITY-FINANCIAL-INTEGRITY-2026-11-26.zip` for current project decisions. The 0.338.137 Phase 1–6 archive is the parent baseline; older RUN/PHASE snapshots must not override the current candidate.


# GreenHaven project source of truth

## Active authority

- **Current working candidate (26 November 2026):** `gh-connect@0.338.162` / RUN450 Wallet, Withdrawal, Membership, Referral and Missions Repair, derived from RUN448 / 0.338.160 and ultimately the accepted 0.338.139 RUN426 archive. RUN449 restores the required credential-free root `.env.example`; no remote push/deployment is claimed. See `docs/CURRENT-SOURCE-OF-TRUTH-2026-11-26.md`.
- Current source derivative: RUN390 / `gh-connect@0.338.111`, based on `GREENHAVEN-0.338.106-RUN385-RESEARCH-FIELD-RESEARCH-UPGRADE-2026-11-24.zip` and the RUN384 audit baseline. RUN386 adds response keyset pagination and bounded complete CSV export; RUN387 adds privacy-suppressed descriptive analytics; RUN388 adds study scheduling and atomically enforced response quotas; RUN389 adds server-enforced team role capabilities and member lifecycle controls; RUN390 repairs missing service-role read grants for Membership, Feed privacy and Marketplace catalogs (migration held for review). See `docs/SOURCE_OF_TRUTH.md` and the RUN386–RUN389 worklogs.
- The RUN388 migration `20261124150000_run388_research_atomic_schedule_quota.sql` is REVIEW_REQUIRED and unapplied. Do not deploy the calling code until the migration is validated and applied to Testnet with postflight evidence.
- The application source code in this repository is authoritative for implemented behavior.
- `supabase/migrations/` is the ordered, immutable database change history. Never delete or rewrite applied migrations.
- `.env.example` is the canonical environment-variable name inventory. It contains safe defaults and blank placeholders, never credentials.
- Deployment target remains GitHub `testnet` and Vercel Preview only; no current RUN388 push/deployment is claimed.
- Pi network selection is `PI_NETWORK=testnet`; Pi SDK Sandbox is `NEXT_PUBLIC_PI_SANDBOX=true`. `PI_ENV` selects the Pi Platform API mode and does not alone identify blockchain network.

## RUN384 full project audit
- Live GitHub `testnet` and Vercel Preview are on commit `06122b28a5d96ef301e1eb10d344af51c3005702`; local RUN384 is not delivered yet.
- Connected Supabase Testnet project `jhlsjnmfpakvibuuoygx` is healthy with 234 applied migration records. Two missing call migration source files were reconstructed from the live catalog and clearly marked as non-byte-identical. RUN383 and RUN384 database migrations remain held and unapplied.
- Read `docs/RUN384-FULL-PROJECT-AUDIT-2026-11-24.md` for current audit findings and acceptance limits.

## Historical records
Superseded RUN, PHASE, PASS, release and worklog documents are retained under
`docs/archive/historical-implementation-records/` for audit/history only.
They are not implementation instructions and must not override source code,
current migrations, or this document.

## Testnet safety
- Testnet-only constraints, identity validation, user consent, authorization,
  idempotency, balance checks, provider receipt verification, reconciliation,
  rate limits and audit logs remain mandatory.
- Never route Testnet transactions to Mainnet.
- Paystack/live bank transfers remain disabled in Testnet because they can move
  real fiat funds.
- Do not populate secrets in `.env.example` or commit local `.env` files.
