# RUN513 — Testnet A2U gate and referral defaults (2026-11-28)

## Problem
The Pi withdrawal sheet showed "Testnet payout execution is not fully enabled" even though wallet authorization was active. The payout request route (and six sibling routes) each re-implemented the gate with a different mix of `process.env.X !== "true"` tests, so one unset flag silently blocked the whole rail and the user could not tell which one.

## Change
* `lib/server/economy/testnet-unlock.ts` now owns the gate:
  * `testnetOperatorFlag(name)` — an explicit value always wins (`1/true/yes/on` enables, any other non-empty value, e.g. `false`, is an operator kill switch). When unset, the flag is **on only in a Testnet runtime** (`PI_NETWORK=testnet` and not Vercel Production).
  * `a2uTestnetGate(sandbox, flags?)` — returns `{ open, missing[] }`. `missing` lists variable names only, never values.
* Routes moved onto the shared gate: withdrawals (request), withdrawals readiness / execute / process, a2u create / complete, pi-cashback statement and claim, a2u-qualification, reward adapters, a2u orchestration.
* The withdrawal request error message now names what is missing (for example `Operator: set PI_ENV (unset or production)`), so the operator can finish the Vercel configuration quickly.
* `lib/economy/program-status.ts`: referral and curation program tiles follow the public Testnet unlock when their flags are unset (an explicit `false` still wins).

## Not changed (deliberately)
* Mainnet and Vercel Production stay closed: `PI_NETWORK` must be `testnet`, `VERCEL_ENV` must not be `production`, sandbox must resolve true.
* Secrets are never defaulted: `PI_EARNINGS_EXECUTOR_KEY` (32+ bytes), `PI_API_KEY`/`PI_SERVER_API_KEY`, `PI_WALLET_PRIVATE_SEED`, `GH_PIN_PROOF_SECRET`. Wallet authorization, PIN proof, rate limits, ledger reservation, fee and idempotency logic are untouched.
* `GHC_WITHDRAWALS_ENABLED` (GHC-to-Pi) still requires exactly `true`.
* No migration was applied and no payment was initiated.

## Operator still has to set on Vercel (Preview, Testnet)
`PI_NETWORK=testnet`, the four secrets above, and the Supabase service credentials. Flags in `config/testnet-payments.env.example` may stay set explicitly; they now also default on in Testnet.
