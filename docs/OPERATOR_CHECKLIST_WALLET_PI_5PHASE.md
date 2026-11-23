> **LEGACY VERIFICATION FIXTURE — NOT CURRENT PRODUCT AUTHORITY.**

# Legacy wallet release checklist — superseded

> **Do not use this historical checklist to configure a live deployment.** Its original environment block enabled registration rewards and payout execution too broadly. It has been retired and retained only as a compatibility reference for historical source checks.

Use the current Testnet-only operational guide instead:

- `docs/OPERATOR_CHECKLIST_WALLET_A2U_TESTNET.md`
- `docs/PI_A2U_OFFICIAL_COMPLIANCE_CHECKLIST.md`
- `docs/PROJECT_TRUTH.md`

## Mandatory safe defaults

The checked-in `.env.example` is authoritative for safe defaults:

- `GHC_REGISTRATION_BONUS_ENABLED=0`
- `PI_EARNINGS_PAYOUT_REQUESTS_ENABLED=0`
- `PI_EARNINGS_PAYOUT_EXECUTION_ENABLED=0`
- `PI_A2U_ENABLED=0`
- `PI_EARNINGS_AUTO_EXECUTE=false`
- `PI_NETWORK=testnet`

Do not enable payout requests or execution merely to make a UI appear functional. Requests, worker execution, A2U, funding, identity consent, required migrations, and two-account Testnet acceptance are separate gates. Mainnet is outside this checklist.

## Historical verification scope

The original five-phase release sequence and SQL references are preserved in the archived implementation records under `docs/archive/historical-implementation-records/`. This file is intentionally not an activation procedure.
