# GreenHaven — current source of truth

**Accepted source archive:** `GREENHAVEN-0.338.139-RUN426-PHASE0-SOCIAL-EXPERIENCE-FOUNDATION-2026-11-26.zip`  
**Working package candidate:** `gh-connect@0.338.159` (RUN447 Community Role Type Repair)  
**Package identity:** `gh-connect@0.338.159`  
**Working candidate archive:** `GREENHAVEN-0.338.159-RUN447-COMMUNITY-ROLE-TYPE-REPAIR-2026-11-26.zip`  
**Parent baseline:** `gh-connect@0.338.139` (RUN426 Phase 0)  
**Date:** 26 November 2026
**RUN447 update:** The community directory now normalizes stored membership roles to the canonical `CommunityRoleLabel` union before rendering `GroupCard`; legacy `mod` maps to `moderator`, unknown roles use safe member/guest fallbacks, and creator ownership remains authoritative. The unused Discover memo dependency was removed, and the Discovery preference callback now captures exact function dependencies to clear the reported exhaustive-deps warning. A focused RUN447 regression check is registered in static and prebuild gates. The supplied Vercel log confirms RUN446 bundle compilation but reports the new role type error; RUN447 still needs a fresh supported-runtime build. See `docs/RUN447-COMMUNITY-ROLE-TYPE-REPAIR-2026-11-26.md`.
**RUN446 update:** Fixes the TypeScript error reported after the RUN445 production bundle compiled: the in-memory marketplace fallback now calls `executeAuthoritativeSpend` with its declared two-argument contract. The `transportError` option remains on the durable RPC path only, where that option is supported. A focused RUN446 regression gate is registered in static and prebuild checks. The supplied Vercel log confirms 466 prebuild checks and successful bundle compilation before TypeScript validation exposed this mismatch. A fresh production build is still required; no remote deployment, database mutation or provider transaction occurred. See `docs/RUN446-MARKETPLACE-SPEND-SIGNATURE-REPAIR-2026-11-26.md`.
**RUN445 update:** Fixes the Vercel production-build blocker in `components/ghc/unified-earnings-dashboard.tsx`: the server snapshot state is now named `serverSnap`, while `snap` remains a render-only alias for the live-or-last-known display snapshot. The fee-quote callback now explicitly depends on `serverSnap`. A focused RUN445 regression gate is registered in static and prebuild checks. Vercel had already reported all 465 prebuild checks passing before Next.js compilation exposed the duplicate declaration. The current local environment is Node 22.16.0, below the required Node 24.15.0; a fresh production build is therefore not certified in this workspace. No remote deployment or provider transaction occurred. See `docs/RUN445-EARNINGS-DASHBOARD-BUILD-REPAIR-2026-11-26.md`.
**RUN444 update:** Adds a dedicated Testnet payment/withdrawal activation profile for Pi A2U, Pi earnings withdrawals, GHC→Pi withdrawals, marketplace GHC seller payouts and Paystack test transfers. Paystack Testnet is restricted to `sk_test_` outside Vercel Production; GHC withdrawal and seller settlement are fenced to non-Production Testnet. Generic `.env.example` remains fail-closed and credentials remain blank. Focused RUN444 contract passes 9/9; full static verification passed 63/63 gates with 5,378 PASS lines and zero failures. Prebuild dry-run discovered 465 checks; actual prebuild requires Node 24.15.0. No provider transactions, remote environment changes, deployment, GitHub push or Mainnet activity occurred. See `docs/RUN444-TESTNET-PAYMENT-WITHDRAWAL-RAILS-2026-11-26.md`.
**RUN443 update:** Applied the four migrations previously held by RUN442: RUN388 research quota RPC (`20261126161545`), RUN396 owner-scoped payout history (`20261126161553`), RUN405 bounded registration account-discovery replacement (`20261126161603`), and RUN429 durable Community invitations with RUN441 lock-order correction (`20261126161651`). Combined with three RUN442 applications, seven migration operations are installed on Testnet. Six RPCs have postgres ownership, SECURITY DEFINER, pinned search paths and service_role-only execute ACLs; RUN429 RLS/client-deny posture and indexes were verified. No backfill or financial operation was executed. Testnet history now has 247 rows, 246 distinct names and duplicate RUN406 history; generated source-version drift remains. Disposable PostgreSQL concurrency rehearsal, Node 24.15.0 build and two-account Testnet acceptance remain open.
**RUN437 update:** Adds read-only SQL diagnostics for migration effects, service-role/client ACLs, expected RPCs, invitation-table posture and migration-history anomalies. RUN437 source contract passes 8/8. The SQL was not run against Testnet in this increment; operational database tests remain blocked.  
**Acceptance status:** 0.338.159 is not yet accepted, pushed or deployed.  
**Release status:** **NOT APPROVED** for Mainnet or production financial release.

## Authority and preservation

1. The user's 26 November 2026 Phase 1–6 integrated archive is the authoritative baseline.
2. The former Run 423 / Run 411 archive is historical evidence only.
3. The RUN426 Phase 0 candidate (incorporating RUN424/RUN425) is a controlled derivative of the authoritative baseline. It preserves the application architecture, records recovered repository infrastructure and historical evidence, and includes the targeted fixes listed in `docs/ENGINEERING-AUDIT-2026-11-26.md`.
4. Do not bulk-merge the former project's nested `run413_work/` tree. Historical documents are marked with `.historical-notice.md` sidecars or stored under `docs/archive/`.
5. RUN429 remains classified REVIEW_REQUIRED for other targets; it is applied to this Testnet under generated history version `20261126161651` with the RUN441 Community-before-Invitation lock-order correction incorporated. Disposable PostgreSQL transaction rehearsal is still pending.

## Product experience standard

GreenHaven is a finished consumer product, not a developer demo. Prefer concise labels and familiar interaction patterns. Remove long feature explanations, redundant onboarding copy, implementation notes and internal diagnostics from customer-facing screens. Keep short, contextual explanations only where needed for payments, security, consent, eligibility, privacy, financial settlement or error recovery. Engineering detail belongs in repository documentation.

## Connected operational environment

- **GitHub:** `greenhavenreg-cmd/GREENHAVEN`, branch `testnet`.
- **Vercel:** project `greenhaven`, team `greenhavenreg-5659`, Preview environment.
- **Supabase:** project `jhlsjnmfpakvibuuoygx`, Testnet.
- **Pi:** Testnet/Sandbox only. Mainnet activation is outside scope.

## Current operational reconciliation — 26 November 2026

### GitHub and Vercel

The connected `testnet` branch is at `bc42129e7ebf5d5259f9846a79118a0c855ed9a6`, package `0.338.137`. The latest inspected Vercel Preview deployment is `READY`, but it was built from that same older commit; its Vercel status check is successful and no GitHub Actions workflow runs were returned for that commit. Seven integrated application components do not match the current GitHub branch: `pi-cashback-summary.tsx`, `premium-membership-screen.tsx`, `rewards-centre-screen.tsx`, `skeleton-loaders.tsx`, `unified-earnings-dashboard.tsx`, `wallet-screen.tsx`, and `withdraw-ghc-panel.tsx`. The RUN426 Phase 0 candidate (incorporating RUN424/RUN425) has not been pushed and no new Vercel deployment has been made.

The following repository-level files were restored from the former archive and verified byte-for-byte against the connected GitHub branch using their Git blob SHAs: `.gitignore`, `.github/dependabot.yml`, `.github/workflows/ci.yml`, `.github/workflows/dependency-security.yml`, and `scripts/check-dependency-lock-integrity.mjs`.

### Supabase migration reconciliation

The active source inventory contains **246 SQL migration files**. After RUN443, Supabase Testnet reports **247 migration-history rows and 246 distinct migration names**. `run406_server_read_privilege_reconciliation` remains duplicated at versions `20261125075911` and `20261125075936`.

Seven migration operations from RUN442/RUN443 have been applied through the Supabase migration tool. The generated history versions differ from their canonical source timestamps:

| Migration | Source version | Generated Testnet version |
|---|---:|---:|
| RUN384 research FK indexes | `20261124110000` | `20261126153605` |
| RUN384 REST table grants | `20261124120000` | `20261126153609` |
| RUN390 Membership/Feed/Marketplace read grants | `20261124143000` | `20261126153614` |
| RUN388 Research quota RPC | `20261124150000` | `20261126161545` |
| RUN396 Pi payout history RPC | `20261125120000` | `20261126161553` |
| RUN405 registration account discovery | `20261125150000` | `20261126161603` |
| RUN429 Community invitations with RUN441 lock-order correction | `20261126090001` | `20261126161651` |

These generated records prove the operations were submitted through the migration tool, but they do not restore exact source-version identity. The pre-existing RUN383/RUN397/RUN406/RUN407 source/history drift and duplicate RUN406 row remain. The row count and distinct-name count are not proof of a one-to-one source/history match.

Do not run `supabase db push`, replay, repair, squash, re-version or manually edit migration history until each source migration is matched to its exact remote effect. Do not replay the seven applied operations by assumption. The four migrations formerly held in RUN442 are now applied to this Testnet only; their classifications remain relevant to other targets. Mainnet was not accessed.
### Supabase security and performance observations

Read-only catalog checks found 37 public tables with RLS enabled and no policies; these are intentional server-only deny-client tables, so do not add generic policies. The RUN442/RUN443 security postflight retained client-deny ACLs. The Performance Advisor now reports 202 INFO unused-index candidates; do not remove indexes without workload evidence. The 17 RUN384 foreign-key indexes have been applied and all 17 were verified valid. Supabase Health Advisor returned no findings.

## Verification and release boundary

- Full static verification: **63/63 gates passed, 5,369 PASS lines, zero FAIL lines**. RUN441 identity/session/profile and Community/Messenger contracts remain passing. This is source/static evidence, not a deployed build or live transaction rehearsal.
- Release hygiene: **PASS, 17/17**.
- Project truth: **PASS, 11/11**.
- Dependency-lock integrity and repository consistency checks: **PASS**.
- Prebuild dry-run: **464 checks discovered**; actual prebuild is blocked by the Node 22.16.0 runtime guard (project requires Node 24.15.0).
- RUN434 authority contract: **17/17 PASS**; operator-key runtime: **6/6 PASS**; RUN435 identity input classification: **16/16 PASS**.
- Supported Node runtime: **BLOCKED locally**. This workspace has Node `v22.16.0`; the project pins Node `24.15.0`.
- Typecheck, lint, dependency audit refresh and production build: **NOT RUN** in this environment because the supported Node runtime/dependency installation was unavailable.
- Live Pi Browser authentication and complete Testnet buyer/seller, Wallet, Rewards, Membership and withdrawal acceptance: **NOT YET VERIFIED**.

A previous dependency scan reported 22 known findings; a fresh audit under Node 24.15.0 is still required before release. A passing source-only suite does not certify a build, live service behavior or production readiness.

## Release policy

Keep the project Testnet-only. Production and Mainnet remain **NOT APPROVED** until the R2 source is synchronized to a reviewable GitHub Testnet branch, the supported-runtime CI/build and current dependency-security gates pass, migration history is reconciled without replay, and identity, Marketplace, Wallet, Rewards, Membership and Pi Testnet user journeys pass functional acceptance.


## RUN424 — wallet and session integrity

The current 0.338.139 candidate retains the RUN424 wallet quote correction, strict wallet snapshot field validation, matching partitioned-cookie clearing attributes, and the corresponding regression gate. See `docs/RUN424-IDENTITY-FINANCIAL-INTEGRITY-2026-11-26.md`.


## RUN425 — Pi profile synchronization repair

Live Vercel runtime errors exposed repeated HTTP 409 profile-store writes on `/api/auth/pi`. The source used a PostgREST `on_conflict` target without `Prefer: resolution=merge-duplicates`. RUN425 adds the required upsert preference, preserves `created_at`, and fails closed if the production profile read is unavailable. This is a profile presentation sync repair, not a fix or proof of Pi Platform token authorization. The Pi auth route continues to treat profile presentation sync as recoverable.

The Preview environment metadata also flags `GHC_OPERATOR_RECONCILE_KEY` as `readable-secret`; its value was not decrypted or changed. Rotate it and store it with Sensitive visibility before operator reconciliation use. Testnet flags remain fenced and no Mainnet action occurred.


## RUN426 — Phase 0 social experience foundation

The current 0.338.139 source candidate adds the external research record, source architecture inventory, cross-domain Community/Messages/Discovery design decisions, accessibility and performance targets, teen-safe discovery constraint, release acceptance matrix, and a static regression gate. It is a source-only foundation; no user-facing feature redesign, Supabase migration, live data mutation, GitHub push or Vercel deployment has occurred. See `docs/RUN426-PHASE0-SOCIAL-EXPERIENCE-FOUNDATION-2026-11-26.md`.


## RUN427–RUN429 — Phase 1 Social & Connections implementation candidate

RUN427 adds the role-derived Managed community directory. RUN428 adds the Resources workspace and cross-domain Social & Connections source checks. RUN429 adds a durable community invitation table/RPC migration, authenticated create/list/respond APIs, inbox integration in Communities and Home, and notification projection. Invitation acceptance updates canonical community membership but does not implicitly grant realtime Chat membership. RUN429's migration is classified REVIEW_REQUIRED and has not been applied because disposable-PostgreSQL validation and exact target-history reconciliation remain outstanding. Targeted checks pass RUN426 15/15, RUN427 11/11, RUN428 21/21 and RUN429 16/16. Full `npm run verify:static` passes 63/63; prebuild dry-run discovers 451 checks, but execution requires Node.js 24.15.0. These remain source-level checks, not live acceptance. Node 24.15.0 dependency-backed typecheck/lint/build and two-account/multidevice E2E acceptance remain outstanding. The 0.338.147 RUN434 archive is a review candidate only; retain 0.338.139 as the accepted source archive until explicit user acceptance.


## RUN430 — Phase 2 Social Engagement hardening

RUN430 improves saved-collection persistence feedback. Device-local collection writes now return an explicit persistence result; the collection picker does not claim success or close when browser storage rejects the write, and it announces the failure accessibly. The durable account bookmark remains a separate server-authoritative operation. A new 16-check cross-feature contract covers comments, reactions, saves, shares, stories and notification targets. Existing focused Phase 2 suites were rerun and passed. This increment introduces no SQL migration and changes no live data. See `docs/RUN430-PHASE2-SOCIAL-ENGAGEMENT-2026-11-26.md` and `docs/archive/upgrade-worklogs/UPGRADE-WORKLOG-0.338.143.md`.


## RUN431 — Phase 2 Discovery preferences integration

RUN431 closes a cross-device persistence gap in Discover connection intentions. The Discovery context now exposes the canonical profile update action and shared toast action; changing intent preferences writes through the authenticated profile service, whose server store already supports `connection_intents`. The local intent store is retained only as a compatibility/convenience mirror and now has an explicit persistence result. Discover does not report a server-confirmed save unless `updateProfile` confirms it. This increment adds a 9-check source contract and no SQL migration. See `docs/RUN431-PHASE2-DISCOVERY-PREFERENCES-2026-11-26.md`.


## RUN432 — Phase 2 Community creation draft recovery

RUN432 makes the four-step Community creation flow resumable across modal close/reopen and page reload. Drafts are account-scoped, bounded, expire after 30 days, preserve the stable create idempotency identity, and exclude transient `blob:`/`data:` cover previews. Payment confirmation is never restored from local storage; the server must confirm it again. Failed creation retains the draft, while successful durable creation clears it. Added 10 source-contract checks and 15 runtime helper assertions. No migration or live data change.


## RUN433 — Phase 2 Integrated Social Transformation

RUN433 consolidates the five-stage Community, Messaging, Discovery and integration audit. The existing architecture already contains the canonical Community directory/workspace, durable invitations, Board pagination, events/resources/governance, authenticated messaging inbox/requests/details/search/media/voice/group flows, server-filtered Discovery, relationship lifecycle and typed notification navigation. RUN431 and RUN432 closed the identified cross-device preference persistence and resumable Community creation gaps. Live calling remains deliberately disabled until production policy, TURN and signaling are configured. A 22-check cross-stage contract now guards these boundaries. This is source-level acceptance only; two-account/multidevice browser acceptance, RUN429 SQL validation and Node 24.15.x build gates remain open.


## RUN434 — Phase 3 Architecture, Identity & Durable Operation Boundaries

RUN434 rebuilds the route/writer inventory against 284 current API handlers, consolidates the duplicated GHC spend transport, isolates the operational reconciliation key from the A2U worker key, and removes caller-controlled actor/approver labels from three operator financial workflows. Focused source checks pass 17/17; operator-key runtime checks pass 6/6. The generic transactional outbox remains proposal-only pending same-transaction owner-RPC integration and retry/dead-letter/consumer-deduplication rehearsal. Testnet read-only catalog checks confirm 322 public SECURITY DEFINER functions with no anon/authenticated EXECUTE privileges, and 37 server-only RLS/no-policy tables with no anon/authenticated DML grants. No SQL migration or live data mutation was made. The 0.338.139 archive remains the last user-designated accepted baseline; 0.338.147, 0.338.151 and 0.338.152 are unaccepted source candidates. Node 24.15.x build gates, disposable PostgreSQL, Testnet migration reconciliation, multi-account/concurrency tests and Mainnet evidence remain outstanding. Production remains NOT APPROVED.


## RUN435 — Phase 3 identity input classification (26 November 2026)

RUN435 manually classifies all eight routes flagged by the RUN434 body-identity inventory. Client-supplied actor/owner aliases are ignored or stripped; authenticated `auth.userId` is the authoritative actor/owner; legitimate target/counterparty IDs remain separately resolved or validated. A 16-assertion source regression gate is registered in `verify:static` and `prebuild:checks`. This is source-level evidence only and does not establish all-route AST proof or live cross-account authorization. The session-cap race remains an acceptance blocker until the held `gh_session_issue_with_cap` proposal passes disposable PostgreSQL rehearsal and migration-history reconciliation. Supported Node 24.15.x build gates, DB concurrency/retry tests, Testnet migration reconciliation, multi-account/multidevice acceptance and separate Mainnet evidence remain outstanding. No migration/live data mutation/push/deploy/payment/Mainnet operation occurred. Production remains NOT APPROVED. See `docs/RUN435-PHASE3-IDENTITY-INPUT-CLASSIFICATION-2026-11-26.md`.

RUN435 verification update: full `npm run verify:static` passes with 5,330 PASS lines and zero FAIL lines; prebuild dry-run discovers 460 checks. Release hygiene passes 17/17, project truth 11/11, and migration manifest synchronization passes 246/246. Actual prebuild remains blocked by Node.js 22.16.0 versus required 24.15.0. See `docs/UPGRADE-WORKLOG-0.338.152.md`.


RUN439 Phase 4 kickoff: added a runtime principal-boundary regression for a server-verified canonical GreenHaven account remapping under the same Pi provider subject. Existing Phase 4 identity/authentication (16/16), identity integration (17/17), coordinated identity/community/messaging (32/32), and profile identity snapshot (8/8) source gates pass. Phase 4 source implementation is now proceeding in parallel at the user’s explicit direction. Phase 3 operational acceptance remains blocked; this does not imply Phase 3 closure, Testnet migration approval, deployment or Mainnet authorization. See `docs/UPGRADE-WORKLOG-0.338.151.md`.


## RUN440 — Phase 4 session rotation concurrency hardening

Session-token rotation now updates the durable session row only when the stored token hash still equals the exact hash presented by the caller and the row remains unrevoked. The update requests a representation and succeeds only when exactly one matching row was changed. This compare-and-swap prevents two concurrent step-up requests from both reporting a successful rotation, and prevents stale rotation from overwriting a concurrent revocation. The in-memory fallback rechecks its token index after asynchronous validation. The RUN440 contract passes 12/12; runtime concurrency/outage regression passes 7 assertions. This remains source-level verification; a real PostgreSQL multi-request concurrency rehearsal is still required. No migration or live database mutation was made.


## RUN441 — Phase 4 Identity, Community & Messenger concurrency hardening

RUN441 adds 34 runtime assertions covering same-provider/different-canonical-account remapping, independent sessions across devices, cross-account revocation denial, session revocation, step-up account/session binding and revocation, and overlapping public-profile hydration requests with private-field exclusion and non-mutating results. The RUN441 source contract passes 21/21.

SQL review identified two transaction hazards and prepared held corrections without editing the historical RUN429 migration: (1) Community invitation creation locks Community then invitation, while the original response function inverted that order; `supabase/proposals/20261126_run441_community_invitation_lock_order_correction.sql` now follows Community → invitation order. (2) Messenger member-count recalculation now locks affected conversation rows in deterministic order before counting. The full disposable PostgreSQL 17 two-connection rehearsal matrix is in `docs/RUN441-PHASE4-COMMUNITY-MESSENGER-TRANSACTION-REHEARSAL.md`. No `psql`, PostgreSQL server binary or Docker runtime was available, so the database rehearsal was not executed. Both corrections remain held proposals; RUN429 remains REVIEW_REQUIRED and no migration was applied.

Historical RUN441 point-in-time status (before RUN442): source candidate `gh-connect@0.338.153`, not accepted, pushed or deployed. RUN442/RUN443 subsequently applied seven additive Testnet migration operations as recorded above. The user-designated accepted archive remains `0.338.139`. Phase 3 operational acceptance remains blocked. Node 24.15.x dependency-backed typecheck/lint/build and live two-account/multidevice acceptance remain outstanding. No financial/provider operation, GitHub push or Vercel deployment occurred. Production and Mainnet remain NOT APPROVED.
