# RUN383 — Identity and feed-privacy service-role grants (2026-11-24)

## Live evidence

Vercel Preview project `greenhaven`, branch `testnet`, deployment `dpl_C9qu9xQiaGhuBAfJCKUBJykorHpE` was READY at commit `06122b28a5d96ef301e1eb10d344af51c3005702`. Runtime error logs from that Preview deployment showed three failed `PATCH /api/profile/me` requests. Each emitted `[profile-store] upsert failed 403`, followed by `[profile-store] durable write failed in production`. This is a confirmed durable profile-write failure, not a static-code inference.

A read-only Supabase catalog query confirmed that `service_role` had **no SELECT/INSERT/UPDATE table privileges** on `gh_user_profiles`, `gh_user_achievements`, `gh_user_progress`, or `gh_user_mutes`; RLS was enabled and anon/authenticated SELECT remained denied. This directly explains the observed profile upsert 403 and is a strong matching cause for `FEED_PRIVACY_FILTER_UNAVAILABLE`, whose code path reads `gh_user_mutes` through the same service-role REST client. The feed-specific 503 was not present in the recent Vercel error clusters, so that live symptom still needs post-migration confirmation.

## Additional live checks

- Supabase migration history confirms the daily-claim 48-hour lock (`20261022010076`), daily-only issuance guard (`20261022010077`), 48-hour metadata backfill (`20261025090001`), and registration-bonus reconciliation (`20261030010001`) are already recorded as applied in the connected Testnet project.
- Supabase catalog checks confirm `ghc_get_claim_streak` and `ghc_execute_daily_claim_v12` are SECURITY DEFINER and executable by `service_role`, with execution denied to `anon` and `authenticated`. Registration-bonus status/claim RPCs have the same server-only ACL.
- Vercel Testnet Preview variables show `NEXT_PUBLIC_PI_SANDBOX=true` and `PI_NETWORK=testnet`, but `GHC_REGISTRATION_BONUS_ENABLED=false`. This is the direct reason the 3 PI welcome bonus is currently disabled. It was not changed because enabling a 3 PI credit is a financial feature decision.
- Recent Vercel runtime errors show three profile upsert 403s and no logged errors for the feed/daily/registration-bonus routes in the last hour. Absence of logs is not proof those routes are healthy.
- The Testnet Preview `GHC_OPERATOR_RECONCILE_KEY` is reported with a `readable-secret` security issue. A request to reclassify it as `sensitive` was rejected by Vercel with 404; no environment variable was changed. Rotate/reclassify this key through the Vercel project dashboard or an authorized integration before relying on it.
- The stored RUN337 dependency audit reports 29 findings (2 critical, 21 high, 5 moderate, 1 low). The current lock still contains affected versions including Next 15.5.26, DOMPurify 3.4.15, Playwright 1.55.0, `@simplewebauthn/server` 13.2.2 and Sharp 0.35.4. A fresh npm registry metadata request failed with `EAI_AGAIN`; dependency versions and lock integrity were not edited without a working registry and Node 24.15.x clean install.

## Source correction

Added `supabase/migrations/20261124095500_run383_identity_privacy_service_role_grants.sql`:

- Keeps RLS enabled on `gh_user_profiles`, `gh_user_achievements`, `gh_user_progress`, and `gh_user_mutes`.
- Explicitly revokes table privileges from `PUBLIC`, `anon`, and `authenticated`.
- Grants `service_role` only the operations used by server code: profile SELECT/INSERT/UPDATE; achievement SELECT/INSERT; progress SELECT; mute-list SELECT.
- Does not change table data, wallet balances, rewards, payment state, or financial ledgers.
- Classified `REVIEW_REQUIRED`; it is not automatically applied and must not be bulk-pushed.

Added `scripts/check-run383-identity-privacy-grants.mjs` and registered it in both `prebuild:checks` and `verify:static`. The check validates RLS, least-privilege grants, client-role revocation, additive SQL shape, migration classification and gate registration.

## Verification

- RUN383 focused regression: 9/9.
- Full static verification with RUN383: PASS (inherited suite summary 63/63 plus the RUN383 9/9 regression and the creator-reward operator-key 7/7 regression).
- Migration inventory consistency: 233/233; documentation hygiene: PASS.
- Node 24.15.x typecheck/lint/build are not run in this workspace (Node 22.16.0; dependencies are not installed). npm registry access failed with `EAI_AGAIN`, so dependency remediation remains blocked.
- Live database privilege catalog inspection and Testnet migration application are not performed.

## Delivery and safety

This is a source-only candidate. No Supabase migration was applied, no Vercel environment variable was changed (the sensitive-type edit returned 404), no GitHub write or deployment was attempted, and no reward/payment/financial operation was executed. The existing Preview deployment does not contain RUN383. Reconcile the exact Testnet migration history and verify grants on a disposable PostgreSQL database before an operator-approved Testnet application. Production remains NOT APPROVED.
