# RUN384 — Full GreenHaven project, GitHub, Vercel and Supabase audit

**Date:** 2026-11-24  
**Source package:** `gh-connect@0.338.105`  
**Scope:** latest supplied RUN383 archive, GitHub `testnet`, Vercel Preview, connected Supabase Testnet project.  
**Safety boundary:** no Production/Mainnet changes, no payment or reward issuance, no database migration application, and no destructive operation.

## Executive result

The audit found and prepared targeted fixes for four classes of defects:

1. Testnet unlock helpers could treat a stale sandbox/preview flag as sufficient even when `PI_NETWORK` was Mainnet or unknown. The helper now requires an explicit Testnet network and denies the Testnet exercise unlock in Vercel Production.
2. `.env.example` enabled multiple optional/financial feature flags by default. Those example defaults are now fail-closed; actual feature activation remains an explicit operator action.
3. The direct media upload intent route ignored a failed private-bucket provisioning result and proceeded to signed-URL creation. It now returns a bounded 503 response before signing when bucket provisioning fails.
4. The daily-claim FAB depended exclusively on `profile.id`, even though the same UI can already have a server-verified canonical identity. Live Preview logs showed profile upsert 403s; the FAB now falls back to `IdentityService.getCurrentUserId()` while rejecting placeholder identities. Daily claim amounts and eligibility remain server-authoritative.

The Supabase audit also found missing `service_role` privileges on 17 server-accessed tables and 17 unindexed foreign keys. RUN383 and RUN384 migrations are included as held candidates; they have not been applied. Two previously applied call-related migrations were missing from the archive and have been restored from the live catalog as clearly labelled reconstructions, not as byte-identical originals.

## Source archive and migration history

- The supplied RUN383 archive was extracted and audited; its RUN382 Supabase REST JSON content-type correction is present.
- The working RUN384 source now contains 237 canonical migration files.
- The connected Supabase Testnet migration history contains 234 records. Exact version-set comparison now shows **all 234 applied database versions have a matching source file**. The RUN384 archive now contains 237 migration files: those 234 applied versions plus three unapplied candidates.
- The two missing applied source versions were `20261111064320` and `20261122133100`. Both files are restored from live catalog evidence and explicitly marked as reconstructed, not byte-identical originals. Do not replay either on the current Testnet project.
- Three new source candidates are not yet in the live migration history: `20261124095500_run383_identity_privacy_service_role_grants.sql`, `20261124110000_run384_research_foreign_key_indexes.sql`, and `20261124120000_run384_server_rest_table_grants.sql`. The source archive therefore contains 237 files: 234 already-applied versions plus these three pending candidates.
- The reconstructed direct-call foundation is not byte-identical original SQL. It reproduces the current catalog's tables, constraints, indexes, RLS deny policies, trigger function and effective server-role grants. It must be validated on a disposable clean database before any new-project use.
- The recovered `20261122133100` file reproduces the current conversation-leading call-session index. It is also catalog-derived and must not be replayed on the connected target.

## GitHub

- Repository: `greenhavenreg-cmd/GREENHAVEN`.
- Branch: `testnet`.
- Latest observed branch/deployment commit: `06122b28a5d96ef301e1eb10d344af51c3005702`.
- The branch contains the RUN382 REST transport correction but not the RUN383/RUN384 changes in this package.
- The remote branch contains CI and dependency-security workflows. Actions are pinned by commit SHA; CI uses Node 24.15.0, read-only `contents` permission and `persist-credentials: false`; the dependency audit runs weekly and on pushes/PRs.
- The GitHub connector returned no workflow-run record for the current deployment commit, so no CI pass is claimed. Branch protection/rulesets are not exposed by the connected GitHub actions; `CODEOWNERS` is absent and branch protection must be verified by a repository admin. RUN384 adds a root `SECURITY.md` with private vulnerability reporting guidance.
- Prior GitHub content/object write attempts returned HTTP 403 `Resource not accessible by integration`. No remote branch file was changed during this audit.

## Vercel

- Project: `greenhaven`.
- Current Preview deployment: READY, branch `testnet`, commit `06122b28a5d96ef301e1eb10d344af51c3005702`.
- Deployment URL: `https://greenhaven-koyxxiwah-greenhavenreg-5659.vercel.app`.
- Stable Testnet branch alias: `https://greenhaven-git-testnet-greenhavenreg-5659.vercel.app`.
- The configured `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_API_URL`, and `NEXT_PUBLIC_HOSTED_URL` values point at the stable Testnet branch alias. This matches the deployment alias.
- All 57 environment variables in this Vercel project are scoped to Preview / branch `testnet`; no Production-scoped variables were returned by the project environment inventory.
- Pi configuration is internally consistent for Testnet: `PI_NETWORK=testnet`, `GHC_ENV=testnet`, `NEXT_PUBLIC_PI_SANDBOX=true`. `PI_ENV=production` is the Pi Platform API mode and is not the blockchain network selector.
- Financial gates observed in Preview are off, including registration bonus, activity rewards, GHC purchase, withdrawals, Pi A2U execution, Paystack transfers and marketplace GHC payouts.
- Vercel flags `GHC_OPERATOR_RECONCILE_KEY` with `readable-secret`. It is currently encrypted rather than sensitive. The connected Vercel action cannot set the required `visibility=secret` field, so this needs manual reclassification and rotation in Vercel. No secret value was read or changed.
- `GHC_CREATOR_REWARD_OPERATOR_KEY` is not configured in Preview. The creator-reward operator routes therefore remain fail-closed; no key was invented or provisioned.
- Runtime error aggregation shows three `/api/profile/me` upsert HTTP 403 failures on the current deployment `dpl_C9qu9xQiaGhuBAfJCKUBJykorHpE` between 09:44 and 09:52 UTC. The earlier Pi identity 400/403 groups belong to older deployments (including commit `897a5f62...`), before the current `06122b2` deployment; no runtime error group was returned for the last-hour query. The live catalog confirms Pi identity/session service-role grants are now present, while the profile/privacy and other direct-REST grants remain missing until the held migrations are applied.

## Supabase

- Connected project: `jhlsjnmfpakvibuuoygx`.
- Status: `ACTIVE_HEALTHY`; PostgreSQL 17.12; region `eu-west-1`.
- Vercel Preview `SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_URL` point to this exact project.
- No Supabase development branches and no Edge Functions are currently listed.
- The current project has **zero Storage buckets and zero Storage objects**. The source provisions the private `gh-media` bucket lazily through the authenticated upload flow; the media health GET remains read-only. The direct-upload intent now stops clearly if provisioning fails. A live upload/Storage API acceptance test remains outstanding.
- Read-only row counts show one Pi identity and three GreenHaven sessions, but zero rows in the sampled profile, achievement, progress, mute, media asset, research project, field report, GHC transaction, earnings ledger, marketplace order, community, post and message tables. This is a sparse/new Testnet database, not the historical populated project described by older archived reconciliation notes. No records were modified.

### Database security findings

- No public table was found with RLS disabled.
- The live schema has 172 public tables: all 172 have RLS enabled; none has direct anon/authenticated table privileges. Thirty-seven RLS-enabled tables have no policies; they are server-only deny-client tables, not a reason to add generic policies.
- No public table had direct SELECT/INSERT/UPDATE/DELETE privileges for `anon` or `authenticated` in the catalog audit.
- Seventeen tables directly accessed by server-side PostgREST code had no `service_role` table privileges: `gh_user_profiles`, `gh_user_achievements`, `gh_user_progress`, `gh_user_mutes`, `gh_conversation_members`, `gh_marketplace_variants`, `gh_media_assets`, `gh_pi_a2u_executions`, `gh_pi_wallet_authorizations`, `gh_post_comments`, `gh_posts`, `gh_saves`, `gh_seller_payout_requests`, `gh_step_ups`, `gh_webauthn_challenges`, `gh_webauthn_credentials`, and `ghc_community_reports`. This explains the live `/api/profile/me` upsert HTTP 403 failures and is consistent with the feed mute-list failure path; source call-site inspection also shows affected messaging membership, media metadata, social visibility/post maintenance, seller payout lookup, step-up/WebAuthn and moderation intake paths. RUN383 grants the four identity/privacy tables; RUN384 grants the remaining 13 with method-scoped privileges only. Both migrations preserve RLS and explicitly deny `PUBLIC`, `anon`, and `authenticated`. They remain unapplied pending source synchronization and review.
- 320 public SECURITY DEFINER functions were found. None were executable by `PUBLIC`, `anon`, or `authenticated`; all inspected SECURITY DEFINER functions had a pinned search path.
- Daily-claim RPCs and registration-bonus RPCs exist and are restricted to `service_role`. The daily claim endpoint remains server-authoritative, rate-limited and idempotent; its GET status is separate from generic activity-reward emission. The daily-claim FAB previously required `profile.id`, which the live 403 profile-store error could prevent from hydrating; RUN384 adds the canonical-identity fallback. No live claim was submitted and no GHC was credited. The registration bonus is disabled by `GHC_REGISTRATION_BONUS_ENABLED=false`; no PI credit was issued.

### Database performance findings

- Supabase reported 17 foreign keys without supporting indexes. The eight affected Research/Field evidence tables were empty at audit time. RUN384 adds 17 additive btree indexes in a held migration.
- Supabase also reported 204 unused-index candidates. They were not dropped: a low-traffic/new Testnet database is insufficient evidence that indexes are unnecessary.
- Rerun Supabase performance advisors after the held index migration is reviewed and applied.

## Source changes in RUN384

- Added a Testnet network fence to `isExplicitTestnetUnlock`, `isPiSandboxEnv`, and `isTestnetProductUnlocked`: only `PI_NETWORK=testnet` outside Vercel Production can use the Testnet exercise unlock.
- Changed `.env.example` optional and financial feature flags to fail-closed defaults. Explicit `false` settings for activity rewards, curation redistribution, referral settlement and Pi-to-GHC purchases now override the general Testnet sandbox fallback; this aligns the server behavior with the current Preview environment comments.
- Made the daily claim FAB use the canonical verified identity if profile hydration fails, so profile-store errors do not hide the entry point.
- Made `/api/media/direct-upload-intent` return 503 when private bucket provisioning fails, rather than proceeding to signed upload URL creation.
- Added regression checks for the Testnet network fence, explicit feature-off behavior, safe environment defaults, canonical-identity daily-claim fallback, upload provisioning failure, recovered migrations, 17 FK indexes and 13 method-scoped server table grants. Added `SECURITY.md` and a repository secret-pattern gate in static/prebuild verification.
- Restored the two applied-but-missing migration source files from live catalog evidence.

## Verification and limitations

- Full `npm run verify:static`: **PASS 63/63**.
- RUN383 focused privilege migration contract: **9/9**.
- RUN384 Testnet/storage/migration source contract: **13/13**; Testnet unlock runtime fence and explicit feature-off behavior: **9/9**.
- Repository secret-pattern scan: **2,788 text files scanned; zero potential secret values**. The two earlier matches were synthetic test fixtures and were rewritten to avoid realistic credential literals.
- `npm run test:safety`: **PASS 21/21** on RUN384.
- Dependency lock coverage/root version check passed; repository consistency contract: **6/6**.
- The full prebuild refuses the available Node 22.16.0 runtime because the project requires Node `^24.15.0`. Typecheck, lint and Next.js production build are therefore not certified in this workspace.
- A fresh `npm audit` could not reach `registry.npmjs.org` (`EAI_AGAIN`). No dependency upgrades or lockfile edits were fabricated. Historical dependency advisories need a fresh registry-connected audit and tested upgrades.
- Recent Vercel runtime error aggregation showed three `/api/profile/me` HTTP 403 failures. The older Pi identity HTTP 400 errors were associated with an earlier deployment; RUN382's source correction is present in the current branch. A fresh Pi Browser sign-in retest is still required after RUN384 is delivered.

## Delivery status

RUN384 is a local source package. It has not been pushed to GitHub, deployed to Vercel, or applied to Supabase. No Production/Mainnet configuration, database, financial record, payment, GHC credit or PI credit was changed. Production remains NOT APPROVED.
