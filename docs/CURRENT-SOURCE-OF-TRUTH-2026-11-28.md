# Current source of truth — 0.338.177 / RUN505 (2026-11-28)

**Current working candidate:** `gh-connect@0.338.177` / RUN506 direct-call control state and accessibility.
**Parent baseline:** user-designated complete GreenHaven v0.338.174 / RUN503 archive.
**Status:** source candidate only; not pushed, deployed or approved for production.

RUN504 makes unified and social notification count/list endpoints report durable-store failures as HTTP 503 rather than returning empty or zero-shaped success responses. Social responses are explicitly private and non-cacheable. The app shell retains last-known notification attention counts during transient server failures and clears them only for authentication denial. Messaging presence now reports `durable: true` only after the durable database write succeeds; development-only in-memory fallback is explicitly non-durable, and production remains fail-closed.

RUN503 Discover Events/Services and RSVP integration remains intact: Events and Services use their authenticated durable directories, selected services open their exact Marketplace listing, and RSVP state changes only after server-confirmed durable success.

No migration, GHC ledger, Pi payment, withdrawal, membership, referral, reward formula, curation settlement, identity authority or Pi authentication change was introduced in RUN504. No vote-to-mint or client-minting path was added.

**RUN504 verification:** focused source contract 15/15; `npm run verify:static` passes 63/63 suites; release hygiene 17/17; project truth 11/11; documentation hygiene PASS; migration inventory 246/246. This environment has Node.js 22.16.0 while the project requires Node.js `^24.15.0`; dependencies are not installed. Supported-runtime typecheck, ESLint, production build and browser/device/Testnet acceptance remain outstanding.

No Git push, Vercel deployment, Supabase mutation, migration application, Pi provider transaction or Mainnet action occurred. The migration manifest is source inventory only, not proof of applied database state. Production remains **NOT APPROVED**.

See `docs/RUN504-NOTIFICATION-OUTAGE-PRESENCE-DURABILITY-2026-11-28.md`, `docs/PROJECT_TRUTH.md` and `docs/MIGRATION_CHECKLIST.md`.


## RUN505

Conversation inbox reads now fail explicitly on durable membership, preference, conversation, unread-count, or store-configuration failures rather than representing partial failure as empty data. See `RUN505-CONVERSATION-INBOX-OUTAGE-INTEGRITY-2026-11-28.md`. No database migration or financial authority change.


RUN505: authenticated conversation inbox reads now fail explicitly when required durable membership, conversation, preference or unread-count reads fail; production without durable messaging storage fails closed. No financial authority or migration behavior changed.
