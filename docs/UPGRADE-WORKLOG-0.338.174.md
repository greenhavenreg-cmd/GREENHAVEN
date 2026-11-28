# Upgrade worklog — 0.338.174 / RUN503

**Baseline:** user-designated GreenHaven 0.338.173 / RUN502 Phase 27 archive.  
**Candidate:** `gh-connect@0.338.174`.  
**Release status:** source candidate only; **NOT APPROVED** for production.

## Implemented

- Discover → Events now mounts the existing authenticated, durable Events discovery screen.
- Discover → Services now mounts the existing Marketplace-backed Services Directory.
- Back actions return to Discover → People.
- Selecting a service listing opens the exact selected listing in the canonical Marketplace workflow.
- Event RSVP supports Going, Maybe and Can't go using the existing authenticated community platform action and database RPC.
- RSVP UI state changes only after `ok: true` and `durable: true`; failures use a distinct error state and do not claim success.
- Added RUN503 regression coverage and registered it exactly once in `verify:static` and `prebuild:checks`.
- Synchronized package, lockfile, in-app release marker, project truth, README, migration inventory and current source documents to 0.338.174.

## Preserved

No SQL migration, ledger, Pi payment, withdrawal, membership, referral, rewards, curation settlement, identity authority or Pi authentication changes. No client-side financial authority or vote-to-mint behavior was introduced. Existing Events visibility and Marketplace checkout authorization remain authoritative.

## Verification

- Focused RUN503 contract: **12/12 passed**.
- Existing Events release-boundary contract: **14/14 passed**.
- Existing Services release-boundary contract: **10/10 passed**.
- Existing RUN455 Events/Services integration contract: **13/13 passed**.
- Full network/database-independent static verification: **63/63 suites passed**.
- Available runtime: Node.js 22.16.0; project engine: `^24.15.0`. Node 24 dependency-backed typecheck, lint and Next.js production build remain unverified.

## Not performed

No Git push, Vercel deployment, Supabase mutation, migration application, Pi provider transaction, payout, withdrawal or Mainnet action was performed.

## Remaining acceptance gates

Run clean `npm ci --legacy-peer-deps` on Node 24.15.x, full prebuild, TypeScript, ESLint and Next.js production build; then complete browser/mobile and two-account acceptance, Testnet financial/provider reconciliation, and independent Testnet/Mainnet migration-history checks. Production remains **NOT APPROVED**.

## Coordinated release implementation steps

1. Opened and integrity-checked the user-supplied RUN502 ZIP archive.
2. Compared package, lockfile, release marker, migration manifest and current-source documents.
3. Found and corrected stale RUN503 documentation that claimed work not yet present in the Discover screen.
4. Audited the existing authenticated Events and Marketplace-backed Services screens and their server routes.
5. Connected Discover → Events to the durable Events screen with a return path to Discover.
6. Connected Discover → Services to the durable Services directory with a return path to Discover.
7. Preserved exact listing identity when handing a selected service listing to Marketplace.
8. Expanded RSVP controls to Going, Maybe and Can't go using the existing authenticated platform RPC.
9. Kept RSVP state server-confirmed and separated RSVP errors from event-directory load errors.
10. Added and registered a focused RUN503 contract in both static and prebuild verification pipelines.
11. Synchronized package, lockfile, in-app release marker, manifest, README and current operating documents to 0.338.174.
12. Re-ran focused source checks and recorded unsupported Node 24 runtime and live operator gates without claiming deployment.

This is source-level verification scope; it does not establish production readiness. The project requires Node.js 24.15.0 or later within the declared Node `^24.15.0` engine.
