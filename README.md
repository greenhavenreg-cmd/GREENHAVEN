# GreenHaven

**Package:** `gh-connect@0.338.156`  
**Current source version:** `0.338.156`  
**Candidate:** RUN444 — Testnet Payment and Withdrawal Rails  
**Accepted source archive:** `GREENHAVEN-0.338.139-RUN426-PHASE0-SOCIAL-EXPERIENCE-FOUNDATION-2026-11-26.zip`  
**Candidate archive:** `GREENHAVEN-0.338.156-RUN444-TESTNET-PAYMENT-WITHDRAWAL-RAILS-2026-11-26.zip`

## RUN444 — Testnet payment and withdrawal activation profile

RUN444 adds `config/testnet-payments.env.example` to enable Pi A2U, Pi earnings payout requests/execution, GHC purchases with Pi, GHC tips, referral settlement, Testnet rewards/curation, GHC→Pi withdrawals, marketplace GHC seller payouts and Paystack test transfers on the Testnet Preview deployment. Paystack Testnet rejects live keys and Vercel Production; GHC withdrawal and marketplace GHC settlement are fenced to non-Production Testnet. The generic `.env.example` stays fail-closed and all credentials remain blank. The focused contract passes 9/9. No provider transactions, remote environment changes, GitHub push, deployment or Mainnet operation occurred. These rails are configured for Testnet activation but are not operationally certified until credentials/funding are verified and controlled transactions reconcile. See `docs/RUN444-TESTNET-PAYMENT-WITHDRAWAL-RAILS-2026-11-26.md`.

## RUN443 — Testnet migration application closeout

RUN443 applied the four migrations previously held by RUN442: RUN388 Research quota RPC, RUN396 owner-scoped Pi payout history, RUN405 bounded registration account discovery, and RUN429 durable Community invitations with the RUN441 Community-before-Invitation lock-order correction. Combined with the three RUN442 applications, seven operations are now installed on Testnet. All six relevant RPCs are `postgres`-owned SECURITY DEFINER functions with pinned search paths and service_role-only execution; RUN429 table RLS/client denial and indexes were verified. Runtime smoke checks passed without creating response rows, invitations, memberships, notifications, or credits. The RUN405 backfill was not invoked. Testnet history now has 247 rows, 246 distinct names and the duplicate RUN406 history row; generated versions remain drifted from source timestamps. Do not run `supabase db push` or manually repair history until exact reconciliation. Disposable PostgreSQL concurrency rehearsal, Node 24.15.0 build verification and two-account Testnet acceptance remain outstanding. No Mainnet, GitHub push, Vercel deployment or financial operation occurred. Full evidence: `docs/RUN443-TESTNET-MIGRATION-APPLICATION-REPORT-2026-11-26.md`.

## RUN441 — Phase 4 identity and transaction-boundary hardening

RUN441 adds 34 runtime assertions for canonical account remapping, independent multi-device sessions, owner-only revocation, session-bound step-up scope/revocation and overlapping public-profile hydration. A 21-check source contract verifies these boundaries and the Community/Messenger SQL protections. Deeper SQL inspection identified a Community invitation lock-order inversion and a Messenger member-count race: RUN441 adds held proposal corrections that serialize Community → invitation locks and conversation-count recomputation. The transaction rehearsal matrix is documented at `docs/RUN441-PHASE4-COMMUNITY-MESSENGER-TRANSACTION-REHEARSAL.md`. No disposable PostgreSQL runtime was available, so transaction rehearsal is NOT EXECUTED. RUN429 was subsequently applied to Testnet with its lock-order correction in RUN443; the separate Messenger member-count correction remains a held proposal.

## Current release status

Production status: **NOT APPROVED**. RUN443 has applied seven individually scoped migrations across RUN442/RUN443 to Testnet, but history reconciliation, disposable PostgreSQL concurrency rehearsal, Node 24.15.0 build verification and end-to-end acceptance remain open. The candidate has not been pushed to GitHub or deployed to Vercel; Mainnet was not accessed.

## RUN440 — Phase 4 session rotation hardening

RUN440 closes a concurrency weakness in durable session rotation. Token replacement now uses a database compare-and-swap against the exact previous token hash and active row state, requests the changed-row representation, and accepts success only when exactly the expected session row changed. Same-process fallback also rechecks the token index after asynchronous validation. Concurrent stale rotations and rotations racing with revocation fail closed instead of returning a token that may already have lost the race. The RUN440 source contract passes 12/12 and the concurrent in-memory rotation plus durable-read outage runtime regression passes 7 assertions. This remains source-level/runtime-unit evidence; live PostgreSQL concurrency rehearsal remains required. See `docs/UPGRADE-WORKLOG-0.338.152.md`.

## Phase 3 delivery

Phase 3 source architecture and identity hardening continues. RUN434 retains the canonical domain implementations and adds:

- One canonical GHC spend RPC transport shared by Wallet and Marketplace.
- Dedicated operational key isolation so A2U worker credentials cannot authorize unrelated financial operator workflows.
- Server-owned operator audit attribution instead of caller-supplied actor/approver labels.
- A 17-check architecture boundary contract and a deterministic 284-route writer inventory.

The latest complete static suite passes **63/63 gates with 5,369 PASS lines and zero FAIL lines**; prebuild dry-run discovers **464 checks**. Actual prebuild/typecheck/lint/production build remain blocked by Node 22.16.0 versus the required Node 24.15.0 and absent dependencies. RUN434 architecture checks pass **17/17**, operator-key runtime checks **6/6**, and RUN435 identity-input classification **16/16**. Release hygiene passes **17/17**, project truth **11/11**, and the migration manifest is synchronized at **246/246**. Actual prebuild is blocked by this workspace running Node 22.16.0 instead of required Node 24.15.0; dependencies are not installed, so typecheck, lint and production build remain unverified. Disposable-PostgreSQL, Testnet migration reconciliation, two-account/multidevice and concurrency acceptance remain outstanding.

RUN435 adds a 16-assertion identity-input classification gate across the eight routes flagged by the route inventory. RUN437 adds a SELECT-only Testnet catalog reconciliation pack for the 17 RUN384 indexes, RUN384/RUN390 grants, RUN388/RUN396/RUN405/RUN429 RPCs, session-cap proposal, and migration-history anomalies. It does not repair history or mutate a database. See [RUN435 identity input classification](docs/RUN435-PHASE3-IDENTITY-INPUT-CLASSIFICATION-2026-11-26.md), [current source of truth](docs/CURRENT-SOURCE-OF-TRUTH-2026-11-26.md), [Phase 3 authority audit](docs/RUN434-PHASE3-AUTHORITY-AUDIT-2026-11-26.md), [RUN435 identity classification](docs/RUN435-PHASE3-IDENTITY-INPUT-CLASSIFICATION-2026-11-26.md), and [current upgrade worklog](docs/UPGRADE-WORKLOG-0.338.152.md).

---

## Historical implementation records

The records below preserve earlier release history. They are not current deployment or database instructions; the current source-of-truth document above takes precedence.

## RUN424 — identity and financial integrity hardening

RUN424 corrects the GHC withdrawal quote so reservations are subtracted exactly once, requires the full authoritative wallet snapshot contract, and ensures production Pi Browser session cookies are cleared with matching `Secure` and `Partitioned` attributes. The changes are covered by a dedicated regression gate registered in prebuild and static verification. No Supabase migration or financial record was changed. Pi remains Testnet-only; automated payouts and GHC withdrawals remain disabled in the inspected Preview configuration. RUN425 additionally repairs idempotent profile synchronization on Pi sign-in after live Vercel logs showed HTTP 409 conflicts; this does not bypass Pi token verification or make profile sync a login prerequisite.

## RUN397 — Testnet registration rewards, referral integrity and release cleanup

Run 397 upgrades the registration reward to a **100 PI cumulative Testnet target**: previously valid registration credits count toward the target, so existing 3 PI recipients are eligible for a 97 PI top-up and new accounts for up to 100 PI. The correct Testnet database now has the campaign migration installed and the backfill run once. It processed one account and issued one 100 PI available-ledger credit, confirmed by the status and withdrawable-balance RPCs. The campaign feature flag remains fail-closed until the matching source and new account-discovery migration are applied and deployed; no provider transfer was executed. The other historical accounts are not present as verified identities in this project and must be reconciled by stable identity and transaction provenance before import.

Referral rewards now use complete server-side summary aggregates, account-scoped status refresh, a 5% qualifying membership reward capped at 25 GHC, and a 50-reward rolling 30-day cap per inviter. Referral settlement remains operator-gated. The registration-bonus migration `20261125130000_run397_testnet_registration_bonus_100_pi.sql` is applied to the correct Testnet database. The separate referral migration `20261125140000_run397_referral_quality_caps_and_summary.sql` still requires its own review and must not be assumed applied. Focused Run 397 checks pass 16/16; full Node 24.15.x build/typecheck and live Testnet acceptance remain outstanding.

## Pi authentication frame-routing correction — 2026-11-23 / Run 373

Pi auth diagnostics showed `app-cdn.minepi.com` being incorrectly treated as the Pi Developer Sandbox wrapper. RUN376 corrects the readiness policy so Preview production-runtime hardening is measured by the effective server auth policy, and separates Pi payment credential configuration from platform readiness. RUN373 now requires the exact `sandbox.minepi.com` referrer, Testnet mode and iframe framing before skipping the App Studio parent-credentials handshake. The app-cdn bridge host follows the parent-credentials path instead. Server-side Pi token verification remains mandatory. See `docs/UPGRADE-WORKLOG-0.338.102.md`.

## Identity principal consolidation — 2026-11-23 / Run 372

The app now uses one canonical GreenHaven account principal resolved from the durable server-side Pi mapping. Pi UID remains provider authentication metadata only and cannot become an app account ID before mapping verification. Account-switch state is isolated; existing database/financial keys are preserved. No migration or deployment was performed. See `docs/RUN372-IDENTITY-PRINCIPAL-CONSOLIDATION-2026-11-23.md`.

## Payments audit and maintenance — 2026-11-23 / Run 340

Audited Pi payment intents and recovery, GHC ledger and wallet, membership purchases/renewals, marketplace checkout and payouts, and Pi withdrawal/A2U controls. Repaired legacy regression checks so they validate the current dedicated withdrawal-sheet flow and archived implementation records; superseded stale operator enablement instructions. No financial execution, ledger/route/RPC change, migration, deployment or Mainnet action was performed. Targeted gates pass; live Testnet/provider and Node 24.15.x build acceptance remain outstanding. See `docs/RUN340-PAYMENTS-AUDIT-AND-MAINTENANCE-2026-11-23.md`.

## Previous maintenance — 0.338.101 / RUN372 canonical identity principal consolidation

Optional providers are now required to pass the canonical ecosystem release gate before dynamic import or initialization. Coming Soon/unknown providers are not invoked; provider errors are contained. Startup prefetch warms released core surfaces only, and realtime startup is best-effort. See `docs/RUN339-OPTIONAL-ECOSYSTEM-PROVIDER-ISOLATION-2026-11-19.md`.

## Previous maintenance — 0.338.99 / Run 318 Pi authentication reliability repair

Run 318 separates rejected Pi credentials from Pi Platform outages, prevents overlapping client authentication attempts, respects server retry guidance and restores the dedicated 503 recovery path. See `RUN318-PI-AUTHENTICATION-RELIABILITY-DELIVERY.md`.

## Previous maintenance — 0.338.99 / Run 317 browser-safe crypto build repair

Run 317 repairs the confirmed `node:crypto` Webpack client-bundle failure. Shared ID helpers now use Web Crypto without Node-only imports; shared modules statically import the browser-safe helper; SHA-256 push endpoint hashing is isolated to a server-only module. GitHub Actions on 0.338.98 confirmed TypeScript and ESLint pass, while the Next.js production build failed at `node:crypto`. Run 317 adds a regression gate. This is a source-only remediation candidate; a fresh Node 24.15.0 dependency-backed typecheck/lint/build and browser/device acceptance remain required. No GitHub push, Vercel deployment, database or migration operation, financial mutation, provider execution or Mainnet action was performed. Production remains NOT APPROVED.

## Latest implementation — 0.338.98 / Run 315 CI lint and build remediation

Run 314 applies 30 targeted UI and interaction refinements across Wallet, Pi payment and withdrawal journeys, Messages, Communities, Marketplace and Orders, Feed, Profile, Rewards, Membership and Settings. The pass adds responsive content rails, improved desktop card grids, safe-area-aware sheets and composers, clearer transaction and conversation presentation, stable profile/feed widths, and accessible focus/scroll behavior. It is presentation and interaction hardening only: wallet, payment, order, reward and membership authority remain server-side. No service registry status changes, database migrations, financial mutations, push or deployment are included. Full Node 24.15.0 build and browser/device acceptance remain outstanding; Production remains NOT APPROVED.


Applies one coordinated visual system to Feed, Wallet, Rewards, Membership, Profile, Settings, Communities, Messages, Marketplace, Filters and Notifications. The Ecosystem catalogue now presents each Coming Soon service as an in-development brief with its thirty tailored preparation tracks and launch gates. The 12 Active / 30 Coming Soon registry statuses are unchanged; all Coming Soon destinations remain disabled. This source-only increment has not been run through the full Node 24.15.0 install/typecheck/lint/build or browser/device acceptance. GitHub write authorization is still blocked, so no push or Vercel deployment is claimed. Production remains NOT APPROVED.

## Previous implementation — 0.338.87 / CI Node assertion hygiene

Run #302 hardens Pi A2U wallet-scope consent and binds provider destination adoption to the exact Testnet payment and payout request. The prior CI Node 24.15.0 assertions and product improvements remain included. The current audit workspace is Node 22.16.0 without dependencies, so dependency-backed typecheck/lint/build are not claimed. Browser/device, authenticated cross-account, live Pi provider transfer, Mainnet migration reconciliation and Preview acceptance remain outstanding. Run #302 migration 20261116045934 was applied to Testnet only; no payout/ledger records were changed. No GitHub push or Vercel deployment was performed. Production remains NOT APPROVED.


## Latest implementation — 0.338.92 / Scoped Evidence Intake & Chain of Custody

Extends the private evidence engine with public respondent uploads scoped to a published project and unguessable submission key, and field-agent uploads scoped to the exact report plus field-session JTI. Uploads use short-lived signed Storage URLs, server-side streamed SHA-256 hashing, MIME magic-byte checks, and quarantine-first evidence records. A central administrator Evidence Review Centre lists Research and Field Desk evidence; signed content delivery remains blocked until a trusted scanner reports a matching SHA-256 digest as clean. Scanner queue and HMAC-authenticated result callback endpoints define the integration contract. Append-only database triggers record SHA-256 chained evidence creation, scan and review events. Optional geographic-unit IDs are checked against active configured hierarchy records; election-observation uploads require a `polling_unit` level when a geographic unit is supplied. No Nigeria hierarchy dataset, GPS capture, EXIF authenticity verification, or malware-scanning provider is included. New migration `20261117010001_gh_evidence_scoped_upload_chain_of_custody.sql` depends on `20261116182000` and `20261116190000`; all three are REVIEW_REQUIRED and unapplied. Static and pure runtime checks are not a substitute for supported Node 24.15.0 dependency-backed typecheck/lint/build and end-to-end Testnet/browser acceptance. No GitHub push or Vercel deployment was performed. Production remains NOT APPROVED.

## Previous implementation — 0.338.89 / Research Studio & Research Intelligence Foundation

Extends the authenticated Research Studio with previous-question conditional branching across owner editor, preview and server-side public submission validation. Challenge-on-Post creation and joining now use durable challenge and participant records, with a row-locked service-role-only participation RPC; canonical challenge state is no longer stored in browser localStorage. Adds an additive REVIEW_REQUIRED SQL foundation for evidence metadata, team roles, configurable geographic hierarchies, election contests/candidates/agent assignments/tallies, examination attempts, challenge events, poll policies and audit history. The earlier Research Studio migration `20261116171144_gh_research_studio_public_forms` remains applied on Testnet. New migration `20261116182000_gh_research_intelligence_platform_foundation` is source-only and unapplied. Source checks at that increment: Research Intelligence 21/21, logic runtime 8/8, Field Research 23/23, project truth 11/11 and migration inventory 227/227. Full Node 24.15.0 dependency-backed typecheck/lint/build and browser/device acceptance remain outstanding; the current workspace runs Node 22.16.0 and has no project dependencies. The supplied archive omits `.github/workflows/ci.yml` and `.gitignore`; preserve those hidden files from the existing repository when syncing this bundle (see `docs/ARCHIVE-HIDDEN-METADATA-GAP.md`). At that increment, the evidence upload-to-response workflow was outstanding; it is now partially implemented in 0.338.90. Full geographic import, election management UI/APIs, exam runtime/scoring, granular role authorization, advanced analytics, and the full 30-point Challenge/Polls transformations remain later stages. No GitHub push or Vercel deployment was performed. Production remains NOT APPROVED.

## Candidate addition — Marketplace Phase 3 (saved delivery addresses, foundation)

Source-only, additive: a held SQL proposal for an owner-only saved-address table with four service-role-only RPCs (`supabase/proposals/20261116_marketplace_phase3_saved_addresses_proposal.sql`, not a migration, not applied, not rehearsed), a pure client contract, an authenticated `/api/marketplace/addresses` route that fails closed with 503 until the proposal is applied, and a collapsed "Delivery addresses" manager in the Orders section. Addresses are not attached to orders, and there is no order, payment, payout, provider or version change. See `docs/MARKETPLACE-TRANSFORMATION-PHASE3.md`. Production remains NOT APPROVED.

## Candidate addition — Marketplace Phase 2 (discovery & seller growth)

Source-only, additive: Best-match sort, disclosed and capped promoted placement, Seller Centre insights, buyer returns guide, more-from-seller, recently viewed and address validation helper. No migration, financial, provider or version change. See `docs/MARKETPLACE-TRANSFORMATION-PHASE2.md`. Production remains NOT APPROVED.

## Candidate addition — Marketplace Phase 1 (trust & speed)

Source-only, additive: verified-purchase rating summary and featured-review quality filter, landed-cost line at checkout, stock and seller-trust badges, a first-run seller checklist helper and a browse skeleton. No migration, financial, provider or version change. See `docs/MARKETPLACE-TRANSFORMATION-PHASE1.md`. Production remains NOT APPROVED.

## Candidate addition — Run #302 (Pi wallet-scope consent / A2U withdrawal fix)

Fixes withdrawals blocked by "Pi did not return a wallet address" after the user had allowed the wallet-address permission. Consent now rests on Pi `/v2/me` `credentials.scopes` proving the `wallet_address` scope; the payout destination is adopted from, or checked against, Pi's A2U `PaymentDTO.to_address` before anything is submitted. Corrected Testnet migration `20261116045934` is applied and verified. See `RUN302-PI-WALLET-SCOPE-A2U-FIX-DELIVERY.md`. Production remains NOT APPROVED.

## Previous implementation — Run #310 / 0.338.73

Phase 6 performance/accessibility hardening overlaps independent canonical feed visibility, preference and mute reads, and overlaps bounded public-profile hydration for post and comment authors. Privacy checks remain fail-closed, the public profile field allowlist and hydration bounds are unchanged, and feed cursors still advance from raw canonical pages. Added a 23/23 Phase 6 source gate and Playwright acceptance coverage for reduced motion, responsive viewport overflow, keyboard focus traversal and offline/reconnect announcements. Existing Phase 5 durable account-owned feed preferences and Phase 4 community completion remain included. RUM CLS now uses a constant-memory session-window accumulator; bounded INP retention keeps later slow interactions instead of only the first 200 interactions. Phase 6 is not accepted until supported Node 24.15.0 install/typecheck/lint/build, Playwright and authenticated cross-account/device/network/database/Preview evidence pass. No new migration, Supabase change, financial state change, GitHub push or deployment was performed. Production remains NOT APPROVED.

## Previous implementation — Run #306 / 0.338.69

Phase 4 community source implementation: archived/sample/legacy posts use the shared read-only post renderer; pinned/New/Hot/Top ordering is deterministic; announcements use a restrained shared design; moderator report resolution is server-first and fail-closed; governance reads/writes use canonical `gh_community_*` tables and role-rechecking RPCs. Phase 4 completion gate 21/21; community pagination 12/12; full static verification 4,009 assertions with zero failures at that release. See `docs/UPGRADE-WORKLOG-0.338.69.md`.

## Candidate addition — Run #297 (stale-hold release)

Automatic 24-hour release of never-started Pi earnings reservations and unsettled GHC withdrawal locks, with provider-uncertain items reported rather than released. Review-required migration, `CRON_SECRET`-protected cron route, daily Vercel cron. See `RUN297-STALE-HOLD-RELEASE-DELIVERY.md`. Unapplied; production NOT APPROVED.

## Latest implementation candidate — 0.338.56 / Run #296

Run #296 fixes incomplete onboarding/profile registration by requiring explicit, valid details, confirming every step is durably saved, uploading profile photos to durable storage, and rejecting server-side completion while any required field is missing. See `RUN296-ONBOARDING-REGISTRATION-DELIVERY.md`.


## Previous baseline — Run #292 / 0.338.55

Run #292 adds a mobile-first content recovery pass across Marketplace, Communities, Discovery and Messages, reducing oversized header and summary regions without removing controls or changing domain logic. It also records the live Testnet wallet-schema drift: a required wallet-address confirmation RPC is absent, and its source migration is not in the inspected migration history. That migration is not safe to apply in isolation because source/live migration history is unreconciled. The three uncertain Pi payouts remain reserved pending authoritative provider reconciliation. No database migration, ledger mutation, provider transfer, GitHub push or Vercel deployment was performed. Production remains NOT APPROVED; full Node 24.15.0 typecheck/lint/build and visual device acceptance remain outstanding.

Run #283 adds 55 tested helper capabilities across all 11 Active modules, fills Matching, Connections, Orders, GHC and Pi Payments feature entry points, and registers focused tests in the static/prebuild gates. The 220-target register is explicit: five helper capabilities per module are implemented in this tranche; 165 deeper UI/API/database feature targets remain. Static verification passes; Node 24.15.0 runtime/build and browser/device acceptance remain outstanding. No SQL, Testnet financial mutation, GitHub push, Vercel deployment or Mainnet operation was performed.

Run #285 continues from the uploaded 0.338.47 baseline. It adds a response-level Discovery opt-out/privacy fallback, filters blocked peers and hidden/no-one/matches-only profiles from the match inbox, and removes a duplicate direct-message POST so the domain's idempotent server send remains the single write owner. Run #285 adds 30 focused regression assertions; the full static suite passes 3,619/3,619 with zero failures. The connected Testnet audit found 39 applied migration records; only 10 exact `(version, name)` sources are present and 29 are missing or version-mismatched in this archive; no further migration was applied. Vercel's dashboard build command was synchronized with the repository cache-cleanup command after the latest deployment was OOM-killed. GitHub's `testnet` branch remains at 0.338.31 and is not safe to overwrite from this archive without a deliberate source sync. Full Node 24.15.0 typecheck/build and browser/device acceptance remain outstanding.

Derived from the 0.338.43 ecosystem candidate through Runs #279–281. Preserves all 41 ecosystem services (11 Active, 30 Coming Soon) and every release boundary. Wallet withdrawal snapshot isolation and least-privilege wallet_address consent are hardened; the obsolete non-signaling call-intent endpoint is retired. Prepared prelaunch screens now exist for Events, Charity & Impact, Services, and Creator Tools. Events discovery uses canonical community event/RSVP records with server-side public/private membership filtering; Charity displays only the authenticated user's recorded segregated contributions using exact atomic PI formatting; Services reads only durable active service listings from Marketplace; Creator Tools uses the existing creator API and shows data-source health without initiating tips or payouts. New Events and Charity APIs fail closed while their services remain Coming Soon; all four screens remain unwired into the ecosystem directory. Seller Centre functionality already exists inside Marketplace. The 41-service registry test confirms 11 Active / 30 Coming Soon across nine categories. Full static verification and the consolidated static runner pass; Node 24.15.0 dependency-backed typecheck/lint/build, browser/device acceptance and live service acceptance remain open because this workspace is on Node 22.16.0 with no dependencies installed. Live Testnet migration history is not fully reconciled to source; do not apply or replay migrations. Mainnet is untouched and production remains NOT APPROVED.

## Historical latest release — 0.338.33 / Run #272

Delivers 30 focused Feed, Profile, post-card and comment-thread improvements: account-scoped feed preferences and hidden-post state, identity-safe saved-post hydration, reduced-data-aware prefetch, online-only background refresh, duplicate-save protection, account-fenced profile timelines, abortable/locked pagination, safe user-facing timeline errors, awaited profile-media updates/removals, and blocked-comment descendant filtering with cycle-safe deterministic thread construction. Testnet migration `20261110193134_social_feed_profile_rpc_search_path_hardening` pins the search path of the feed-engagement and comment-reaction service-only RPCs without changing grants or rows. The Vercel build pipeline now removes stale multi-gigabyte Webpack cache packs before compilation and disables persistent production Webpack caching while retaining the single-worker memory settings. Exact-version install-script approvals are recorded for the two reviewed native dependencies. The live Vercel OOM root cause was identified from build events; Run #272 source is not yet deployed, so a successful new build is still required. Mainnet is untouched and production remains NOT APPROVED. See `docs/RUN272-FEED-PROFILE-30-POINT-AUDIT.md`.

## Previous release — 0.338.32 / Run #271

Repairs the social publishing hand-off across the composer, Feed, Stories and media authorization. First-party durable media-facade URLs are accepted by the post API and asset IDs—including video and PDF—are linked through the existing owner-checking attachment RPC. Post drafts are account-scoped and preserve media, audience, community target and a stable publish request ID. Story creation uses stable request IDs, server-derived profile identity, owner-verified media and strict audience/content validation. Three narrow Run #271 migrations were applied to Testnet only. Mainnet remains untouched. See `docs/RUN271-POST-COMPOSER-STORIES-30-POINT-AUDIT.md`.

## Previous release — 0.338.31 / Run #270

Upgrades the Community experience and its access-control boundary. Community cards now use semantic, keyboard-operable controls; the shared collapsing header and bottom navigation preserve accessible hide/reveal behavior; chat access requires explicit server-confirmed chat membership; community leave and moderator removal revoke the separate realtime chat membership atomically; stale Testnet chat grants were reconciled without deleting messages. Public community discovery now uses a server-side full-text/category search RPC with bounded pagination. Community chat, post and platform APIs validate IDs, action names, moderation payloads, dates, enums and safe HTTPS/relative resource links before privileged RPC calls. Both Run #270 Testnet-only migrations were applied and postflight-verified; Mainnet and Vercel production settings were not changed. The full Node 24.15.0 dependency-backed typecheck/lint/build, browser/device acceptance, complete migration-history reconciliation and provider release gates remain outstanding; production remains NOT APPROVED. See `docs/RUN270-COMMUNITY-30-POINT-AUDIT.md`.

## Previous release — 0.338.30 / Run #269

Hardens the active Testnet database by removing direct table-write and sequence privileges from `anon` and `authenticated`, while preserving RLS-governed reads and server-side service-role access. Adds fail-closed default privileges for future tables and sequences created by the migration owner. Repairs stale prebuild UI regression contracts, brings those checks into static verification, and adds a regression gate for client-role ACLs. The Testnet migration was applied and postflight-verified; Mainnet remains untouched. Three uncertain Pi earnings requests and two approved-but-unfulfilled membership intents remain held for provider reconciliation. Node 24.15.0 dependency-backed typecheck/lint/build and browser/device acceptance remain outstanding; production remains NOT APPROVED.

## Previous release — 0.338.28 / Run #266

Unifies the canonical post-card experience across Feed, Profile and Community, with semantic article structure, cleaner author metadata and media framing, and a stable mobile-first Comment / Save / Share action dock. Share feedback accurately reports that options opened rather than claiming content was sent. Run #266 source checks passed 14/14.

## Historical release — 0.338.27 / Run #261

Adds an operator-only Pi A2U ecosystem qualification register: full-KYC recipient attestations are bound to GreenHaven Pi UID mappings, and only independently provider-verified, developer-completed Testnet A2U settlements to five distinct recipients count. The register never creates or retries payments. The additive migration is REVIEW_REQUIRED and unapplied pending Testnet source deployment and migration-history review. Targets the live Pi earnings withdrawal failure with actionable provider-stage diagnostics, a read-only Pi incomplete-A2U health probe, a one-active-withdrawal-per-user guard, and safe Pi wallet-address binding/display. The wallet address is obtained from Pi's `wallet_address` permission and bound to the same server-verified app-specific Pi UID; the provider's actual `to_address` must match before any A2U payment is submitted or settled. A2U transfers still route by Pi UID, not a browser-supplied address. The new additive Testnet migration is REVIEW_REQUIRED and unapplied pending deployment/history review. Existing uncertain reservations are not force-released or blindly retried; users can explicitly reconcile an existing request against an exact Pi incomplete payment. See `docs/UPGRADE-WORKLOG-0.338.27.md` and `docs/PI-EARNINGS-WITHDRAWAL-INCIDENT-2026-11-10.md`.

The deployment and withdrawal observations in the following paragraphs are historical Run #261 context, not a statement that Run #266 is deployed. Run #266 is source-only and has not been pushed or deployed. Production remains NOT APPROVED.

The preceding Run #259 added the credential-free `.env.example` template and retained the Run #258 Testnet Marketplace order-list RPC repair. See `docs/UPGRADE-WORKLOG-0.338.25.md`.

## Last documented hardening notes — 0.330.49 (baseline for 0.338.9)

The 0.330.48 maintenance increment begins controlled Feed reliability work: client reconciliation now matches the canonical database keyset order (`created_at DESC, id DESC`) so equal-timestamp posts produce the correct next-page cursor. Runtime and source regression checks cover the ordering contract. The 15-section / 150-essential maintenance register remains the programme-wide target; its items are not represented as completed merely because they are registered. The latest notification baseline remains Phase 11.2.5, with remote Web Push disabled pending vetted sender integration, deployment secrets, approved database schema, scheduled worker and real device/provider acceptance. Production approval remains pending Node 24.15.x dependency-backed build, PostgreSQL/Testnet/Mainnet reconciliation and browser/mobile/two-account acceptance.
The 0.330.49 Phase 3 hardening increment closes wallet reservation transparency and recovery, makes GHC membership purchase preflight/debit serial per account, makes reward claim replay idempotent for reward-ID aliases, and verifies Pi payment identity/network/amount/transaction before binding or completing a recovered payment. The new SQL migration is REVIEW_REQUIRED and must be validated/applied by an operator after target database history reconciliation. Authenticated Testnet execution, PostgreSQL concurrency, Node 24.15.0 dependency-backed build and browser/device acceptance remain outstanding.



## 0.338.9 experience refinement

This release tightens the shared header, gives Marketplace and Community content more responsive breathing room, makes active-tab scroll reset deterministic, and prevents global keyboard shortcuts from interfering with editing or modal workflows. The 31-check UI/navigation audit is part of prebuild and static verification. Financial and database authority is unchanged; the project remains NOT APPROVED for production until Node 24.15.0, database, provider and browser/device acceptance gates pass.


## 0.338.10 — Messaging and Community transformation

This release adds a responsive multi-line message composer, bounded recent-message search inside conversations, keyboard-safe search/emoji dismissal, and safer offline/error handling for community join and invitation actions. No database migrations or financial-authority changes were introduced. See [`docs/PRIORITY_9_MESSAGING_COMMUNITY_TRANSFORMATION.md`](docs/PRIORITY_9_MESSAGING_COMMUNITY_TRANSFORMATION.md) for implementation scope and verification limits.


## 0.338.13 — Phase 1 messaging contracts

Adds durable conversation nicknames, quick-reaction/read-receipt preferences, read-receipt opt-out semantics, and GIN-indexed server-side full-history message search. Migration `20261109100001_gh_messaging_phase1_controls_search.sql` is REVIEW_REQUIRED and unapplied. See `docs/UPGRADE-WORKLOG-0.338.13.md`; Phase 1 cannot advance until remote history reconciliation, operator approval, Testnet PostgreSQL and two-account verification, plus contact-share/group-create acceptance.


## Latest implementation — 0.338.87 / Field Research foundation

Adds the Field Research Ecosystem destination, a redesigned public field-agent portal, dedicated field-session secret enforcement, 4+ character access-code compatibility, durable-storage fail-closed behavior, the reviewed Testnet field-report migration, and the 30-track Field Research / Challenge / Polls transformation plan. See `docs/FIELD-RESEARCH-PLATFORM-UPGRADE-PLAN.md`. Full public form authoring, anonymous public submissions, evidence media, analytics and in-app central notifications remain future implementation stages; this release does not claim those are shipped.

## Current source-only work — RUN328 Phase 4

RUN328 coordinates the user-selected Identity & Authentication, Community discussion/participation, and Messenger community communications tracks. It adds session step-up ordering hardening, a held atomic session-cap proposal, a privacy-aware community member directory, recipient-accepted group invitations and consent-based sharing of the user's own public GreenHaven profile. See `docs/RUN328-PHASE4-IDENTITY-COMMUNITY-MESSAGING-2026-11-18.md`. The SQL proposal is not applied; full Node 24.15.x dependency-backed build and PostgreSQL/Testnet/device acceptance remain required. This is not a deployment or production approval.

RUN377 repairs and verifies the Testnet service-role ACLs for Pi identity/session storage, reconciles the source migration filename to the exact remote version `20261123145603`, and upgrades `/api/health` to perform bounded live PostgREST read probes of both table contracts. The updated source remains pending Node 24.15.x build and deployed Preview / real Pi Browser acceptance. Mainnet remains untouched. See `docs/UPGRADE-WORKLOG-0.338.104.md`.


## RUN381 — Pi authentication CSP correction

The 2026-11-24 Testnet Pi Browser diagnostics showed enforced `connect-src` blocks for the exact host `socialchain.app` immediately before `Pi.authenticate()` rejected. RUN381 adds only `https://socialchain.app` to the enforced `connect-src` directive; it does not add a wildcard or weaken other CSP directives. Live Pi Browser acceptance on the Testnet Preview remains required. See `docs/RUN381-PI-AUTH-CSP-CONNECT-SOURCE-FIX-2026-11-24.md`.

## RUN380 — Pi-only Research and Field access

Research share URLs, survey submissions, examination attempts, evidence uploads and Field reporting are restricted to Pioneers who complete official Pi SDK authentication and server-side Pi Platform verification before a durable GreenHaven session is issued. The old shared-code Field Desk unlock is retired. `/field` remains available as an authenticated Pioneer reporting workspace; `/r/:slug` is a share identifier only and no longer grants anonymous participation. Only legal/help pages and the Pi domain-validation resource remain public. See `docs/RUN380-PI-ONLY-RESEARCH-ACCESS-CONTROL.md` for implementation details and verification limits.


**Latest upgrade:** RUN426 Phase 0 establishes the research-backed Community, Messages and Discovery architecture, UX, accessibility, performance and release-acceptance foundation. See `docs/RUN426-PHASE0-SOCIAL-EXPERIENCE-FOUNDATION-2026-11-26.md`.


### RUN438 — Phase 3 provenance hardening (retained)

RUN438 extends the read-only Testnet reconciliation pack with full stored-function definitions/security metadata and exact RUN384 index definitions. This improves evidence quality without repairing migration history or executing business operations. Operational acceptance remains blocked pending PostgreSQL 17 rehearsal, Node 24.15.x build verification and two-account tests. See `docs/UPGRADE-WORKLOG-0.338.150.md`.


### RUN439 — Phase 4 Identity & Authentication kickoff

RUN439 starts Phase 4 source work in parallel with outstanding Phase 3 operational acceptance. It adds runtime regression coverage for a changed server-verified canonical GreenHaven mapping under the same Pi subject, ensuring old account tokens and display identity are not inherited. Existing group invitation, contact sharing and community directory contracts remain session-bound and privacy-limited. See `docs/UPGRADE-WORKLOG-0.338.152.md`.

Phase 3 is not declared complete: PostgreSQL rehearsal, Testnet migration-effect reconciliation, Node 24.15.x build verification, financial retry/concurrency testing and two-account device acceptance remain required.

RUN439 begins Phase 4 Identity & Authentication source work in parallel at the user’s direction. It adds a regression for canonical GH principal remapping under a stable Pi provider subject and preserves strict account-state reset. Phase 3 operational acceptance remains blocked; no Testnet migration, deployment or Mainnet action is implied. See `docs/UPGRADE-WORKLOG-0.338.151.md`.
