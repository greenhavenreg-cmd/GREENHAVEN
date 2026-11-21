# Environment variable policy

`.env.example` is the canonical variable inventory. Each variable must appear
exactly once. `NEXT_PUBLIC_*` variables are browser-visible and must never
contain secrets. All other variables are server-only unless code review proves
otherwise. Blank values are placeholders for deployment-specific credentials.
Do not invent URLs, client IDs, fee amounts, keys, passwords or private seeds.

Vercel Testnet deployment scope: Preview, Git branch `testnet`. Keep Pi SDK Sandbox enabled and `PI_NETWORK=testnet`. The Testnet overlay is connectivity-only by default: keep money-moving and ledger-mutating features fail-closed until their provider credentials, Testnet database authority, user authorization, settlement/reconciliation and authenticated E2E prerequisites are independently verified. Keep Paystack transfers disabled.

## RUN376 economy safety gates (2026-11-19)

- `GHC_ATOMIC_GLOBAL_EMISSION_V13_ENABLED=false` must remain false until the RUN376 atomic allocator proposal is reconciled against the exact Testnet schema/history, rehearsed on an isolated Testnet branch, applied with approved service-role-only ACLs, and verified under concurrency, idempotency and rollback tests. When disabled, DB-backed daily claims and activity emission fail closed.
- `GH_GHPV_CALIBRATION_DAILY_CAP_V2_ENABLED=false` must remain false until a per-reviewer-serialized SQL implementation persists the daily JCS delta cap. The current deployed `gh_curator_calibration` table does not store `day_key` or `day_delta_abs`; settlement returns unavailable while the flag is false.
- `GHC_CURATION_REDISTRIBUTE_V2_ENABLED=false` must remain false until the RUN376 idempotency wrapper is reconciled, applied and replay-tested. This optional path transfers existing GHC only.
- `GHC_WITHDRAWALS_ENABLED=false`, `GHC_WITHDRAWALS_TESTNET_ONLY=false`, and an explicit `GHC_WITHDRAWAL_GHC_PER_PI` rate are required for any future Testnet request intake. PIN proof and platform-verified wallet authorization are mandatory. Withdrawal requests do not automatically send Pi.
- The canonical `.env.example` intentionally defaults all these financial features and the broad Testnet unlock to disabled. Do not copy enabled values into Production.


## Testnet profile reconciliation (0.338.111)

`docs/TESTNET-PREVIEW-ENVIRONMENT.template` is the single source for the branch-scoped Preview overlay. It must not override the canonical fail-closed defaults for Pi purchases, Pi payouts/A2U, GHC withdrawals, marketplace payouts, Paystack transfers, rewards, referral settlement, tips or curation redistribution. `*_TESTNET_ONLY=true` values are network fences only; they do not authorize execution. `DOMAIN_VALIDATION_KEY` and `PI_API_KEY` are server-only credentials provisioned from the Pi Developer Portal and must never be committed.
