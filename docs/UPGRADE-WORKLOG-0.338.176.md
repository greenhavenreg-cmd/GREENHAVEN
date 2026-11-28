# GreenHaven upgrade worklog — 0.338.176 / RUN505

**Date:** 28 November 2026  
**Parent:** v0.338.175 / RUN504  
**Scope:** messaging conversation inbox outage integrity.  
**Disposition:** source-only verification scope; production remains **NOT APPROVED**.

## Implementation

1. Audited `listConversationsForUser`, its sole API route caller, and the required durable read sequence.
2. Changed failed membership and conversation queries from empty-array success to explicit errors.
3. Made caller preference and active membership reads mandatory; partial membership data is no longer returned as a successful inbox.
4. Made unread-count RPC failure explicit rather than omitting unread counts.
5. Changed production without a configured durable messaging store to fail closed.
6. Added a seven-assertion regression contract and registered it in static and prebuild verification.
7. Synchronized package/lockfile/release identity and current source documentation to 0.338.176.
8. Added the RUN505 regression contract to `verify:static` and `prebuild:checks`.
9. Re-ran the focused RUN505 contract and preserved the existing release and migration safeguards.
10. Recorded outstanding runtime, build, browser, Testnet and production operator gates.

## Source files changed

- `lib/server/messaging/message-store.ts`
- `scripts/check-run505-conversation-inbox-outage-integrity.mjs`
- `package.json`, `package-lock.json`, `lib/app-release.ts`
- Current release and source-of-truth documentation.

## Boundaries preserved

No SQL migration, database mutation, Pi payment, GHC ledger, withdrawal, membership entitlement, reward formula, referral settlement, curation settlement or vote-to-mint behavior changed.

## Verification and limitations

RUN505 focused source contract: 7/7. Existing RUN504 focused contract: 15/15. Release hygiene and project-truth checks must pass. Full static suite and supported-runtime build are pending final verification in this workspace. No live database, browser, Pi Testnet or Mainnet acceptance is inferred.

The project requires Node.js 24.15.0 or later. The available workspace runtime is Node.js 22.16.0 and dependencies are not installed. TypeScript, ESLint and Next.js production build are not certified.
