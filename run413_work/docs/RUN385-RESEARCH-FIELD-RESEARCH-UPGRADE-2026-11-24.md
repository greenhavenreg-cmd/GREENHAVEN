# RUN385 — Research & Field Research workspace upgrade

**Baseline:** RUN384 full project audit, 24 November 2026  
**Scope:** Research Studio, Pioneer response portal, Field Research portal and owner response inbox.  
**Environment boundary:** source-only changes intended for `testnet` / Vercel Preview. No GitHub push, Vercel deployment, database migration, Production or Mainnet change was performed.

## Delivered in this source revision

- Reorganized the Research Studio home into an operational dashboard with lifecycle totals, study search (title, description and type), lifecycle status filtering, reset controls and clearer no-results handling. The owner inbox also has answer/response-ID search, review-status filters, loaded-record counters and a distinct no-match state.
- Improved the owner inbox with an explicit CSV export action for the most recent 200 responses returned by the existing owner-scoped API. Export is generated locally, quotes CSV cells and prefixes spreadsheet formula-leading values to reduce CSV injection risk. The UI states the export scope; this is not a claim of complete pagination or an all-time export.
- Updated share-link copy and messaging to accurately state that participation is restricted to Pi Browser after official Pi SDK sign-in and server-side Pioneer verification. A share identifier is not an authentication credential.
- Added an explicit server-session verification/loading state to the Field Research portal so the interface does not prematurely display an authentication failure while its first session check is in flight.
- Added no-index/no-follow metadata to the private Research Studio page.
- Added RUN385 static release checks to `verify:static` and `prebuild:checks`.

## Existing capabilities retained

- Owner-authenticated Research Studio project creation, listing, status transitions, preview, share links and private response inbox.
- Server-side respondent authentication, explicit consent, bounded payload validation, durable rate limiting, idempotent response submission and private owner scoping.
- Existing conditional question logic, examination attempts, evidence quarantine/review, scoped field evidence, election observation structures, agent assignment and independent tally comparison.
- Pi-authenticated durable GreenHaven session requirement for field reporting and survey submission.
- RLS and service-role-only server access patterns. No generic client policies were introduced.

## Not represented as completed

The current schema and application do not yet constitute a complete global research SaaS platform. The following remain separate engineering tracks and must not be represented as shipped: robust paginated inbox and exports; complete analytics and statistical inference; project collaboration UI and role administration; verified multilingual content/localization; configurable geographic reference-data ingestion; offline-first field capture and conflict resolution; full study lifecycle scheduling/expiry and respondent quotas; respondent rights/retention automation; notification preferences and delivery; formal accessibility audit; independent malware scanning operations; load/chaos testing; backup/restore rehearsal; and migration rehearsal on a disposable database.

Several Research Intelligence, evidence and Field Research schema migrations are still `REVIEW_REQUIRED` in RUN384. This work did not apply them. Existing UI panels may therefore remain unavailable until a reviewed, version-preserving Testnet migration sequence is applied after source synchronization.

## Security and operational boundaries

- Every Research/Field Research route, API and action must continue to require Pi SDK authentication, server-side Pi Platform identity verification and the durable GreenHaven session where applicable.
- Browser user-agent/referrer values are not cryptographic proof of Pi Browser. They must never be treated as an authentication substitute.
- Shared slugs and links do not grant access by themselves.
- Evidence remains private, quarantined until scan and review requirements pass, and delivered through short-lived owner-authorized access.
- Election observation remains evidence collection and comparison, not official voting or certification.
- No financial rewards, Pi payouts, GHC balances or Mainnet data are changed by this scope.

## Verification

Run:

```bash
node scripts/check-run385-research-field-upgrade.mjs
node scripts/check-field-research-foundation.mjs
node scripts/check-phase2-research-integrity-hardening.mjs
node scripts/check-phase2-field-intake-hardening.mjs
node scripts/check-research-intelligence-foundation.mjs
node scripts/check-media-evidence-engine.mjs
node scripts/check-scoped-evidence-engine.mjs
```

A passing static check is not a live deployment, Pi Browser acceptance test, database migration rehearsal or accessibility certification. Those remain release gates.
