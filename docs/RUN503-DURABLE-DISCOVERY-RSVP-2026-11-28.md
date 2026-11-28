# RUN503 — Durable Discover Events and Services + complete RSVP states

**Package:** `gh-connect@0.338.174`  
**Baseline:** user-designated GreenHaven 0.338.173 / RUN502 Phase 27 archive.  
**Status:** source candidate; **NOT APPROVED** for production.

## Changes implemented

1. Discover → Events now mounts the existing `EventsDiscoveryScreen`, which reads the authenticated `/api/ecosystem/events` endpoint instead of relying on the client-side session community registry for this category.
2. Discover → Services now mounts the existing `ServicesDirectoryScreen`, which requires durable active Marketplace service listings from `/api/marketplace/listings`.
3. Both directory screens return to Discover → People through their back action.
4. Selecting a service listing hands off its exact listing ID through the canonical `navigateTo("marketplace", { listingId })` route.
5. Event RSVP exposes Going, Maybe and Can't go. All three use the existing `event_rsvp` community platform action and `gh_community_event_rsvp` RPC. The UI changes the displayed state only after the server returns both `ok: true` and `durable: true`.
6. RSVP failures use a separate alert state and do not claim that the response was saved. The controls expose their selected state and prevent overlapping submissions.
7. The RUN503 source contract is registered exactly once in both `verify:static` and `prebuild:checks`.

## Safety boundaries preserved

- No database migration or schema change. All **246 SQL migration files are byte-identical** to the uploaded baseline.
- No GHC ledger, Pi payment, withdrawal, membership, referral, rewards or curation economics change.
- No client-supplied actor identity was added; RSVP remains session-derived by the existing server route.
- Events API release gating, rate limits, private-community visibility checks and no-store behaviour remain authoritative.
- Marketplace service discovery remains read-only; checkout and payment still happen only in the Marketplace workflow.
- No vote-to-mint or client-side GHC minting path was introduced.

## Focused verification

- RUN503 durable Discover/RSVP contract: **12/12 passed**.
- Events release-boundary contract: **14/14 passed**.
- Services release-boundary contract: **10/10 passed**.
- RUN455 Events/Services integration contract: **13/13 passed**.
- Release hygiene: **17/17 passed**.
- Project truth: **11/11 passed**.
- Documentation hygiene: **PASS**.
- Complete network/database-independent static suite: **63/63 suites passed**.
- Migration inventory: **246 files**, classifications and generated manifests synchronized.

## Wider audit findings and remaining gates

- Messaging already contains durable conversation APIs, membership checks, idempotent sends, delivery receipts, voice-note upload/send and unread-attention logic. Live calling remains policy/TURN-gated; do not represent it as production-enabled until provider and two-user tests pass.
- Profiles have authenticated profile persistence, account-scoped timelines, identity and professional showcase components. Full two-account privacy and account-switch acceptance remains a Testnet gate.
- Wallet, Pi payments, withdrawals, membership, rewards and referral flows have dedicated server APIs and financial safety gates. Their existence and static contracts do not prove live provider settlement or ledger reconciliation. No financial code was changed in RUN503.
- Curation has dedicated post/curation audit gates and preserves the no-vote-minting boundary. Do not enable reward settlement from UI signals.
- Pi staking remains unavailable until official Pi Platform API access/whitelisting and response contracts are confirmed. Pi rewarded-ad verification remains fail-closed and returns no reward authorization until provider-side verification is implemented.
- Community and activity discovery still need a separate source-of-truth audit to determine which projections are backed by durable APIs versus session caches.
- The Supabase migration manifest is a source inventory, not evidence that migrations are applied. Reconcile Testnet and Mainnet histories independently; do not bulk-push migrations.

## Build and operator limitations

The repository requires Node.js `^24.15.0`; the available runtime is Node.js 22.16.0. The dependency tree in this workspace is incomplete: TypeScript, ESLint and Next.js executable files are missing. The prebuild attempt stopped at the JSX check when it could not import TypeScript. Therefore a supported-runtime dependency-backed typecheck, ESLint run and Next.js production build have **not** passed and are not claimed.

No Git push, Vercel deployment, Supabase mutation, migration application, Pi provider transaction, payout, withdrawal or Mainnet action was performed.

## Release decision

RUN503 is a source-level integration improvement, not a production certification. Do not promote to Mainnet until Node 24.15+ clean-install/prebuild/typecheck/lint/build checks, browser/device acceptance, two-account messaging/privacy tests, Testnet financial reconciliation, live Pi provider checks and independent migration-history reconciliation have passed. Production remains **NOT APPROVED**.
