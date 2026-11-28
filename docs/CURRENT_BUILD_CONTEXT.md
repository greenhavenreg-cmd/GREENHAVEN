# CURRENT BUILD CONTEXT — GreenHaven RUN505

## Latest implementation — 0.338.177 Conversation inbox outage integrity (28 November 2026)

**Current source version:** `0.338.177`
**Current migration closeout:** RUN447 / RUN443 retained; no new migration introduced.

RUN504 corrects notification API outage semantics: unified and social notification count/list reads now return HTTP 503 when their durable stores fail instead of returning a successful empty/zero-shaped response. Social notification responses are explicitly private and non-cacheable. Existing clients retain their last known navigation attention count on transient server failures; authentication denial still clears attention for the signed-out/unauthorized state.

Messaging presence now reports `durable: true` only when the database write actually succeeds. Development-only process-memory fallback can still support local preview behavior, but it is explicitly marked non-durable. Production continues to fail closed when the durable presence store is unavailable.

No database migration, Pi authentication/payment, GHC ledger, withdrawal, membership, referral, rewards, or curation economics changed. No vote-to-mint or client-side financial authority was introduced.

**Current source version:** `0.338.175` (source candidate; parent RUN503 / `0.338.174`).
**Verification:** RUN504 focused contract 15/15; full `npm run verify:static` passes 63/63 suites. Release hygiene passes 17/17; project truth 11/11; migration inventory contains 246 synchronized SQL source files. Supported-runtime prebuild, dependency-backed typecheck, lint, production build and browser/device/Testnet acceptance remain outstanding because this workspace has Node.js 22.16.0 while the project requires `^24.15.0`, and dependencies are not installed. No migration was applied, no database was mutated, no Git push or Vercel deployment occurred, and no provider transaction was made. Production remains **NOT APPROVED**.

See `docs/RUN504-NOTIFICATION-OUTAGE-PRESENCE-DURABILITY-2026-11-28.md`, `docs/UPGRADE-WORKLOG-0.338.175.md` and `docs/CURRENT-SOURCE-OF-TRUTH-2026-11-28.md`.


---

---

# CURRENT BUILD CONTEXT — GreenHaven RUN458

## Latest implementation — 0.338.170 Marketplace Cart Account Isolation (27 November 2026)

**Current source version:** `0.338.170` (unaccepted working candidate; parent RUN457 / `0.338.169`).

RUN458 isolates browser-local Marketplace cart lines by verified canonical GreenHaven account identity. Anonymous/local-studio browsing retains its separate legacy cart; guest cart contents are not silently assigned to a signed-in account. Marketplace screen state and the global cart badge refresh on identity changes. Server-side order creation continues to own seller, price, stock and reservation authority. Checkout, payment, saved-address, payout and database semantics are unchanged. RUN457 Creator Studio, RUN456 Impact History, RUN455 Events/Services and RUN454 Seller Centre remain preserved.

RUN458 static contract passed 8/8 and the Marketplace cart runtime suite passed its normalization, SKU, quantity, checkout snapshot/race and account-isolation assertions. The full `npm run verify:static` passed 5,452 checks with zero failures. Release integrity and documentation hygiene checks passed. This is source-only verification scope. The prebuild check chain was attempted but stopped because the JSX check could not import the absent `typescript` package. The available Node.js runtime is 24.11.1, below the required Node.js 24.15.0 (`^24.15.0`); dependencies are absent. Supported-runtime typecheck, lint, production build and browser/device/Testnet acceptance remain outstanding. No migration, live database, provider transaction, Git push or Vercel deployment action occurred. Production is **NOT APPROVED**.

See `docs/RUN458-MARKETPLACE-CART-ACCOUNT-ISOLATION-2026-11-27.md`, `docs/UPGRADE-WORKLOG-0.338.170.md` and `docs/CURRENT-SOURCE-OF-TRUTH-2026-11-27.md`.

---

## Previous build context — RUN456 (historical)

# CURRENT BUILD CONTEXT — GreenHaven RUN456

## Latest implementation — 0.338.168 Read-only Impact History Release (27 November 2026)

**Current source version:** `0.338.168` (unaccepted working candidate; parent RUN455 / `0.338.167`).

RUN456 derives from the user-designated RUN453 baseline through RUN455. It exposes the existing read-only charity contribution history as a separate active `Impact History` service. The donation-capable Charity service, causes, donations and community-project workflows remain Coming Soon. The summary API continues to require an authenticated user, checks the dedicated service release boundary before authentication and ledger access, uses durable rate limiting with deny-on-unavailable behavior, binds results to the authenticated user, and returns only the segregated non-withdrawable ledger projection. Existing RUN455 Events and Services releases and RUN454 Seller Centre release are retained.

The full static suite was executed under available Node.js 24.11.1; focused RUN456 and existing charity/events release contracts pass. The required Node.js 24.15.0 runtime and installed dependencies are unavailable in this workspace, so supported-runtime typecheck, lint, production build and browser/device/Testnet acceptance remain outstanding. No migration, live database, financial provider, Git push or Vercel deployment action occurred. RUN447 and RUN443 migration/reconciliation history remains preserved as prior evidence. Production is NOT APPROVED.

See `docs/RUN456-IMPACT-HISTORY-RELEASE-2026-11-27.md`, `docs/UPGRADE-WORKLOG-0.338.168.md` and `docs/CURRENT-SOURCE-OF-TRUTH-2026-11-27.md`.

---

# CURRENT BUILD CONTEXT — GreenHaven RUN455

## Latest implementation — 0.338.167 Events Discovery Service Unblock (27 November 2026)

**Historical candidate version:** `0.338.167` (superseded by RUN456 / `0.338.168`).

RUN455 derived from the user-uploaded RUN453 source baseline through RUN454. It released the already implemented Events discovery workflow by activating the Ecosystem service registry entry, wiring the canonical focus destination, and mounting `EventsDiscoveryScreen` with in-place back navigation. The existing server-side release gate, authenticated viewer requirement, durable rate limiting, private-community membership filtering, and authenticated RSVP write path are preserved.

RUN454's Seller Centre unblock remains intact. No migration, live database, financial provider, Git push or Vercel deployment action occurred. Production is NOT APPROVED.

---

---

# CURRENT BUILD CONTEXT — GreenHaven RUN454

## Latest implementation — 0.338.166 Seller Centre Visibility and Navigation (27 November 2026)

RUN454 is derived exclusively from the user-uploaded RUN453 archive. It audits the existing Seller Centre implementation and corrects a release-registry mismatch: the owner-scoped Seller Command Centre existed in Marketplace → `mine`, but Ecosystem labelled it Coming Soon and supplied no destination. The registry now marks Seller Centre active and canonical navigation opens Marketplace → `mine`, reusing the existing durable listing and order loaders. Focused source contract passes 6/6. This is a source-level visibility/navigation unblock, not full marketplace or product acceptance. RUN447 community role normalization and RUN443 migration closeout remain preserved historical evidence; the RUN385 programme remains documented in `docs/PHASE-7-8-HARMONIZED-PROGRAM-2026-11-24.md`.

**Current source version:** `0.338.166` (unaccepted working candidate; parent RUN453 / `0.338.165`).
**Accepted baseline:** `GREENHAVEN-0.338.139-RUN426-PHASE0-SOCIAL-EXPERIENCE-FOUNDATION-2026-11-26.zip`.
**No remote push, deployment, database mutation, migration or provider transaction occurred.** The project requires Node.js 24.15.0; this source-level verification scope does not replace the required Node 24.15.0 dependency-backed typecheck, lint or production build.

# CURRENT BUILD CONTEXT — GreenHaven RUN451

This document supersedes historical prompts and worklogs for the current working candidate; historical records remain evidence, not active instructions.

## Latest implementation — 0.338.164 Wallet, Withdrawal, Membership, Referral and Missions Repair / RUN451 (26 November 2026)

RUN451 is derived from RUN449 / 0.338.161. It corrects the squeezed PI wallet action layout; rebuilds withdrawal as amount → PIN → PIN confirmation → final review; adds a secret-safe readiness endpoint and prevents payout reservation unless the Testnet auto-executor, Pi API credentials and Testnet wallet seed are present. It repairs membership entitlement reads that used a bare relative REST path, public GreenHaven ID ensure/resolve RPCs that used relative fetch URLs, the missing `/join` referral landing route, and first-post mission navigation to the global composer. Referral settlement uses the explicit flag/Testnet unlock helper.

**Current source version:** `0.338.164` (unaccepted working candidate; parent `0.338.161` / RUN449).

The project requires Node.js 24.15.0. The local workspace has Node 22.16.0 and no installed dependencies, so dependency-backed TypeScript validation, lint and the Next.js production build are not certified here. The RUN451 static verification is source-only verification scope. A fresh Vercel Preview build remains required. The example profile leaves secret placeholders blank because Vercel Preview supplies the actual runtime credentials; the application reads `PI_EARNINGS_EXECUTOR_KEY`, `PI_API_KEY` / `PI_SERVER_API_KEY`, `PI_WALLET_PRIVATE_SEED` and `GH_PIN_PROOF_SECRET` from the deployed environment. RUN451 explicitly enables the Testnet referral settlement flag in the profile. Mission GHC issuance remains blocked by the existing Daily-Claim-only database guard pending an approved reward schedule and reviewed migration.

RUN447 community role normalization, RUN446 marketplace spend signature repair, RUN445 dashboard build repair and RUN444 Testnet payment profile are preserved. RUN443 Testnet migration closeout remains historical operational evidence and does not establish new migration application, current schema parity or live financial acceptance for RUN451. RUN385 coordinated upgrade programme remains documented in `docs/PHASE-7-8-HARMONIZED-PROGRAM-2026-11-24.md`.

**Acceptance status:** not accepted, pushed or deployed. **Mainnet/production financial release:** NOT APPROVED. No remote Git, Vercel, database or payment-provider action was performed. See `docs/RUN451-TESTNET-ECONOMY-ACTIVATION-2026-11-26.md`.


RUN451 activates the dedicated Testnet Preview configuration flags for GHC activity rewards, registration bonus, curation, referral settlement, Pi-to-GHC purchases, tips, withdrawals, marketplace seller payouts, Pi A2U, Pi earnings payout execution and Paystack test transfers. Public client flags are aligned. Provider credentials remain external Vercel Preview secrets and are not embedded in the archive. Generic `.env.example` remains fail-closed. Registration bonus still depends on the corresponding campaign migration/RPC being present in the Preview database; mission GHC issuance remains blocked by the current Daily-Claim-only issuance policy. See `docs/RUN451-TESTNET-ECONOMY-ACTIVATION-2026-11-26.md`.

Historical continuity: RUN447 community role normalization and RUN443 Testnet migration closeout remain preserved as prior-run evidence only. The coordinated RUN385 upgrade programme remains documented in `docs/PHASE-7-8-HARMONIZED-PROGRAM-2026-11-24.md`; none of those historical records implies a new live database action in RUN455.


## RUN505 — Conversation inbox outage integrity

Conversation list reads no longer hide failures in durable member lists, conversation rows, preferences, active memberships, unread-count RPCs, or missing production storage behind empty or partially populated results. See `docs/RUN505-CONVERSATION-INBOX-OUTAGE-INTEGRITY-2026-11-28.md`. No financial or migration semantics changed.


## RUN506 — Direct-call control state and accessibility

Direct-call microphone/camera state is reset when a new call ID becomes active. Toggle state is exposed via `aria-pressed`, and call-phase changes use a polite live region. No signaling, authorization, financial authority or migration behavior changed. This is a client-side UX/accessibility improvement only; live call transport and production acceptance remain operator gates.
