# Run 406 — Server-read permissions, wallet reward visibility, and Testnet readiness

**Source:** `gh-connect@0.338.132` — based on Run 405.

## Confirmed root cause

The connected Supabase Testnet project `jhlsjnmfpakvibuuoygx` had no `service_role` SELECT privilege on the canonical social visibility tables (`gh_posts`, `gh_follows`, `ghc_user_blocks`, `gh_community_members`), marketplace catalog tables (`gh_marketplace_listings`, `gh_marketplace_variants`), and membership entitlements. Server code uses service-role PostgREST reads for these paths. Those reads therefore fail closed, which explains the observed post-visibility, catalog, and membership-unavailable states.

## Database action and verification

An additive, idempotent least-privilege migration named `run406_server_read_privilege_reconciliation` was applied to the intended Testnet project. It enables RLS, revokes direct table privileges from `PUBLIC`, `anon`, and `authenticated`, and grants only the server-side read operations required by current adapters (plus the existing server-only post maintenance UPDATE). A read-only ACL query verified for all 11 tables that `service_role` has SELECT, both client roles lack SELECT, and RLS remains enabled. No rows, balances, rewards, or migration history were edited by the SQL body. The Run 397 referral quality-cap/summary migration was also applied; postflight verified its SECURITY DEFINER functions use a fixed search_path, allow service_role execution, and deny anon/authenticated execution.

The database migration tool recorded the same idempotent migration name twice in adjacent migration-history versions during the repair session. Both executions succeeded; the SQL is additive/idempotent and ACL verification passed. The history entries were not deleted or rewritten.

## Source changes

- Profile timeline maps `POST_VISIBILITY_UNAVAILABLE` to a useful recovery message and retains fail-closed privacy behavior.
- Marketplace catalog error copy no longer suggests local/demo listings are an equivalent source of truth.
- The PI registration reward card is shown directly in Wallet regardless of whether GHC or PI is selected.
- Registration rewards require an explicit user click; opening Wallet/Rewards no longer triggers a background financial claim.
- Wallet hero styling is refined to a deep GreenHaven forest palette while keeping PI and GHC balances and ledgers separate.
- Added a Run 406 regression check and synchronized migration inventory and version metadata.

## Testnet payment/reward controls

Vercel Preview variables scoped specifically to the `testnet` branch have been staged for the next deployment: `GHC_REGISTRATION_BONUS_ENABLED=1`, `GHC_ACTIVITY_REWARDS_ENABLED=true`, `GHC_REFERRAL_SETTLEMENT_ENABLED=true`, `NEXT_PUBLIC_GHC_REFERRAL_SETTLEMENT_ENABLED=true`, `GHC_CURATION_REDISTRIBUTE_ENABLED=true`, `GHC_CURATION_REDISTRIBUTE_V2_ENABLED=true`, `NEXT_PUBLIC_GHC_CURATION_REDISTRIBUTE_ENABLED=true`, and `GHC_BUY_WITH_PI_ENABLED=true`. These variable edits do not redeploy the current build; they take effect only in a subsequent Preview deployment. Production targets were not changed.

`PI_EARNINGS_PAYOUT_REQUESTS_ENABLED`, `PI_EARNINGS_PAYOUT_EXECUTION_ENABLED`, and `PI_A2U_ENABLED` remain false. The server correctly refuses withdrawal requests unless both request and executor gates are enabled, preventing users' PI from being reserved with no way to settle or release it. Do not enable actual Pi A2U payout execution until the current source is deployed, the Testnet payout executor is confirmed funded/configured, and end-to-end authorization, idempotency, receipt reconciliation, cancellation/recovery, and duplicate-payment checks pass. UI visibility and request creation are not proof of a completed on-chain transfer.

The current Preview source has not yet been updated to `0.338.132`; push this source via GitHub Desktop and confirm a successful Preview deployment. After deployment, verify registration claim, activity reward, referral, curation, and Pi payment flows. Production/Mainnet flags must remain unchanged.

## Verification boundary

Database ACL repair is live and verified. Local source changes and static checks must be verified from the exported archive. Browser/device acceptance, actual Testnet Pi A2U execution, membership purchase, and post-deploy UI/API behavior are not yet certified by this report.
