# Current project truth — 0.338.177 RUN505 (2026-11-28)

**Current package candidate:** `gh-connect@0.338.177`.
**Current source version:** `0.338.177`.
**Parent baseline:** user-designated complete GreenHaven v0.338.174 / RUN503 archive.
**Current status:** **NOT APPROVED** (source candidate only).

## RUN504 — Notification outage and messaging presence durability

- Unified notification count and list reads return HTTP 503 when their durable store reports failure. They no longer present store failure as a successful empty list or zero unread count.
- Social notification count and list reads likewise return HTTP 503 on failed, missing or malformed store results.
- Social notification responses use `Cache-Control: no-store, private`.
- The notification bell retains last-confirmed durable rows for failed stores, includes retained unread rows in its count, and clears retained data on account switch.
- The app shell retains the last confirmed social/economy attention counts during transient server failures; authentication denial still clears attention.
- Messaging presence reports `durable: true` only when the Supabase write succeeds. Non-production memory fallback may still return a usable local response, but it is explicitly `durable: false`. Production continues to fail closed if durable presence storage is unavailable.

## Preserved RUN503 integration

Discover → Events opens the authenticated Events directory backed by `/api/ecosystem/events`. Discover → Services opens the durable Marketplace-backed directory. Selecting a service hands off its exact listing ID to Marketplace. RSVP offers Going, Maybe and Can't go through the existing authenticated community platform route and `gh_community_event_rsvp` RPC. The UI changes state only after explicit successful durable confirmation.

## Preserved authority boundaries

- No database migration or schema change was introduced.
- No GHC ledger, Pi payment, withdrawal, membership, referral, rewards or curation economics were changed.
- RSVP actor identity and messaging identity remain server-session-derived.
- Pi Mainnet/Testnet separation and server-only provider credentials remain unchanged.
- Votes do not mint GHC; no client-side minting or settlement authority was introduced.
- Marketplace seller, stock, order and checkout authority remains server-side.

## Verification status

RUN504 focused source contract: **15/15**. The full network/database-independent static suite passes **63/63 suites**. Release hygiene passes **17/17**, project truth **11/11**, documentation hygiene passes, and the migration inventory contains **246/246** synchronized source files.

The repository requires Node.js `^24.15.0`; the available runtime is Node.js 22.16.0. Dependencies are not installed. A supported-runtime clean install, TypeScript, lint, and Next.js production build, browser/mobile acceptance and live Testnet verification have not been certified here. The source migration inventory is not evidence of applied migrations and does not establish that any migration is applied to Testnet or Mainnet.

## Operator gates still required

- Node 24.15.x clean install and full prebuild/typecheck/lint/production build.
- Browser and mobile acceptance, including two-account messaging, privacy, notifications and RSVP tests.
- Testnet payment, wallet, withdrawal, rewards, membership and provider reconciliation.
- Independent Testnet and Mainnet migration-history reconciliation.
- Live Pi provider verification and deployment-environment review.

No Git push, Vercel deployment, Supabase mutation, migration application, provider transaction or Mainnet action was performed. Production remains **NOT APPROVED**.


RUN505: authenticated conversation inbox reads now fail explicitly when required durable membership, conversation, preference or unread-count reads fail; production without durable messaging storage fails closed. No financial authority or migration behavior changed.

## RUN505 — Conversation inbox outage integrity

Required durable reads for inbox membership, conversations, member preferences and unread counts now fail explicitly on error. Production without the durable messaging store fails closed. See `docs/RUN505-CONVERSATION-INBOX-OUTAGE-INTEGRITY-2026-11-28.md`.


## RUN506 — Direct-call control state and accessibility

Direct-call microphone/camera state is reset when a new call ID becomes active. Toggle state is exposed via `aria-pressed`, and call-phase changes use a polite live region. No signaling, authorization, financial authority or migration behavior changed. This is a client-side UX/accessibility improvement only; live call transport and production acceptance remain operator gates.
