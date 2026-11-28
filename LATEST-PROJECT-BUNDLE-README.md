# GreenHaven — Current Project Bundle

**Package:** `gh-connect@0.338.177`  
**Candidate:** RUN506 — Direct-call control state and accessibility  
**Baseline archive:** `GREENHAVEN-0.338.176-RUN505-CONVERSATION-INBOX-OUTAGE-INTEGRITY-2026-11-28.zip`  
**Working archive:** `GREENHAVEN-0_338_177-RUN512-TESTNET-PROFILE-PARITY-2026-11-28.zip`  
**Date:** 28 November 2026  
**Status:** Source candidate only; production NOT APPROVED.

RUN506 resets microphone and camera UI state when a new call session replaces the previous one, exposes toggle state through `aria-pressed`, and announces call phase changes through a polite live region. It preserves server-authorized call signaling, media acquisition, call policy, and hangup behavior. See `docs/RUN506-DIRECT-CALL-CONTROL-STATE-2026-11-28.md`.

RUN512 adds `PI_EARNINGS_ADAPTERS_ENABLED=true` and `GH_WITHDRAWAL_OPERATOR_IDS` to the Testnet activation profile (`config/testnet-payments.env.example`; without the first, referral and other adapter credits are denied) and adds a parity guard between that profile and the flags the code gates on. Configuration and static check only; Production unchanged. See `docs/RUN512-TESTNET-PROFILE-PARITY-2026-11-28.md`.

RUN511 requires a price greater than zero to publish a product (seller form and listings API; an empty price was previously treated as 0). See `docs/RUN511-MARKETPLACE-POSITIVE-PRICE-2026-11-28.md`.

RUN510 adds an RPC source-drift guard: 20 RPCs called by live routes (incoming calls, discovery, marketplace addresses, group invites, push subscriptions and others) have no migration source in this repository; they are inventoried in `docs/RUN510-RPC-SOURCE-DRIFT-2026-11-28.md` with an operator query to confirm the live catalog. No SQL was applied.

RUN509 replaces every remaining Math.random() ID/token generator with the fail-closed secure-id helpers (CSRF, session salt, Pi OAuth state, call IDs, transfer references, order keys, ledger/payment IDs, content IDs), fixes two notification-bell runtime crashes (a use-before-declaration and an out-of-scope variable) and removes a fabricated random match. See `docs/RUN509-SECURE-RANDOM-SWEEP-AND-NOTIFICATION-BELL-CRASHES-2026-11-28.md`.

RUN507 reconciled this README and registered its record in documentation hygiene (the delivered RUN507 bundle failed `verify:static` on that one check). RUN508 removes `Math.random()` idempotency-key fallbacks from nine money/publish client paths (they now use the fail-closed `secureUUID`) and replaces the comment reaction control that picked a random emoji with a real accessible picker. It also makes the Pi amount parser follow the same comma-decimal rule as the GHC parser (it previously stripped commas, so `1,5` became 15 Pi at the final parse gate). See `docs/RUN508-SECURE-IDEMPOTENCY-AND-COMMENT-REACTIONS-2026-11-28.md`. No server, SQL, ledger, fee or withdrawal logic changed.

RUN505 makes the authenticated conversation inbox fail visibly when required durable membership, conversation, preference, or unread-count reads fail, rather than presenting an outage as an empty or partially populated inbox. RUN504 preserves last-known notification attention during transient store outages and prevents non-durable presence writes from claiming durable success. Earlier RUN470–RUN503 changes remain included; see the individual `docs/RUN*.md` records.

**Verification observed in this workspace:** `npm run verify:static` completed successfully (exit code 0), including the RUN505 inbox outage contract and RUN506 direct-call accessibility contract. This is a source/static verification result only.

**Outstanding release gates:** supported Node.js 24.15.0+, clean dependency installation, TypeScript typecheck, ESLint, Next.js production build, browser/device acceptance, multi-account Testnet verification, and live Supabase outage/recovery checks. The available runtime for this audit was Node.js 22.16.0, below the declared engine requirement; dependencies were not installed. These gates are not represented as passed.

No database migration was applied, no live Supabase data was changed, no Pi/GHC/payment/withdrawal/reward/membership/referral/curation transaction was initiated, and no Git push or Vercel deployment was performed. Production remains NOT APPROVED.
