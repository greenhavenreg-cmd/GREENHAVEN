# GreenHaven project source of truth

## Active authority
- Current source derivative: RUN385 / `gh-connect@0.338.106`, based on the RUN384 full project audit archive. RUN385 upgrades the Research Studio dashboard, owner-inbox CSV export, Pi Browser-only participation messaging, Field Desk session verification UX and private-page indexing metadata. See `docs/RUN385-RESEARCH-FIELD-RESEARCH-UPGRADE-2026-11-24.md`. RUN384 adds the Testnet network fence, fail-closed environment template defaults, media bucket failure handling, two catalog-recovered historical migration sources, a held 17-FK-index migration, and held method-scoped grants for 13 additional server REST tables. It is not yet pushed to GitHub or deployed to Vercel.
- The application source code in this repository is authoritative for implemented behavior.
- `supabase/migrations/` is the ordered, immutable database change history. Never delete or rewrite applied migrations.
- `.env.example` is the single canonical environment-variable name inventory. It contains safe defaults and blank placeholders, never credentials.
- Current deployment configuration is Vercel Preview scoped to Git branch `testnet`.
- Pi network selection is `PI_NETWORK=testnet`; Pi SDK Sandbox is `NEXT_PUBLIC_PI_SANDBOX=true`.
- `PI_ENV` selects the Pi Platform API mode and remains `production` where the app uses the production Platform API with Testnet network selection. Do not infer Mainnet from this variable alone.

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
