# Environment variable policy

`.env.example` is the canonical variable inventory. Each variable must appear
exactly once. `NEXT_PUBLIC_*` variables are browser-visible and must never
contain secrets. All other variables are server-only unless code review proves
otherwise. Blank values are placeholders for deployment-specific credentials.
Do not invent URLs, client IDs, fee amounts, keys, passwords or private seeds.

Vercel Testnet deployment scope: Preview, Git branch `testnet`. Keep Pi SDK Sandbox enabled and `PI_NETWORK=testnet`. `.env.example` remains fail-closed as the canonical safe default. For Testnet connectivity and Pi authentication exercise, use `docs/TESTNET-PREVIEW-ENVIRONMENT.template`. It preserves the Testnet identity unlock and E2E scaffolding while keeping purchases, rewards, referrals, tips, curation settlement, payouts, A2U, withdrawals, marketplace payouts and Paystack transfers disabled. Do not enable financial flags until their separate provider, database, authorization, settlement, reconciliation and authenticated E2E gates are approved.

## RUN376 economy safety gates (2026-11-19)

- `GHC_ATOMIC_GLOBAL_EMISSION_V13_ENABLED=false` must remain false until the RUN376 atomic allocator proposal is reconciled against the exact Testnet schema/history, rehearsed on an isolated Testnet branch, applied with approved service-role-only ACLs, and verified under concurrency, idempotency and rollback tests. When disabled, DB-backed daily claims and activity emission fail closed.
- `GH_GHPV_CALIBRATION_DAILY_CAP_V2_ENABLED=false` must remain false until a per-reviewer-serialized SQL implementation persists the daily JCS delta cap. The current deployed `gh_curator_calibration` table does not store `day_key` or `day_delta_abs`; settlement returns unavailable while the flag is false.
- `GHC_CURATION_REDISTRIBUTE_V2_ENABLED=false` must remain false until the RUN376 idempotency wrapper is reconciled, applied and replay-tested. This optional path transfers existing GHC only.
- `GHC_WITHDRAWALS_ENABLED=false`, `GHC_WITHDRAWALS_TESTNET_ONLY=false`, and an explicit `GHC_WITHDRAWAL_GHC_PER_PI` rate are required for any future Testnet request intake. PIN proof and platform-verified wallet authorization are mandatory. Withdrawal requests do not automatically send Pi.
- The canonical `.env.example` intentionally defaults all these financial features and the broad Testnet unlock to disabled. Do not copy enabled values into Production.


## Testnet profile reconciliation (0.338.112)

`docs/TESTNET-PREVIEW-ENVIRONMENT.template` is a connectivity/authentication-only, branch-scoped Preview overlay. It does not alter `.env.example` Production/local defaults. Financial and ledger-mutating flags remain disabled. Testnet network checks, authenticated user authorization, durable session persistence and provider verification remain required. `*_TESTNET_ONLY=true` values are network fences, not independent authorization. `DOMAIN_VALIDATION_KEY`, `PI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are server-only credentials and must never be committed. The Pi `/v2/me` bearer-token identity check uses the user's Pi access token; the app API key is for provider operations that require it.
