# Upgrade worklog — 0.338.106 / RUN385

**Date:** 24 November 2026  
**Parent:** RUN384 full project audit (`gh-connect@0.338.105`)  
**Scope:** Research Studio and Field Research workspace quality, access messaging, inbox export and release checks.

RUN385 adds a more operational Research Studio dashboard: lifecycle totals, study search, status filtering, reset controls and explicit no-results handling. The owner inbox adds answer/response-ID search, review-status filters, loaded-record counters and a distinct no-match state. The owner inbox can export the latest 200 responses already returned by its owner-scoped API to CSV; cells are quoted and spreadsheet formula-leading values are prefixed. The UI discloses that the export is limited to the loaded response window and warns that the file may contain sensitive data.

Research share-link messaging now accurately explains that a link is not an access credential: participation requires Pi Browser, official Pi SDK sign-in and server-side Pioneer verification. Field Research shows a session-verification loading state before presenting the authentication-required experience. Research Studio metadata is no-index/no-follow. RUN385 adds 19 static source contracts and registers the gate in `verify:static` and `prebuild:checks`.

**Source-only verification scope:** full `npm run verify:static` completed successfully, including the inherited project checks, RUN384 gates, and RUN385 19/19. Focused Field Research 22/22, Research Integrity 12/12, Field Intake 7/7, Research Intelligence 20/20, Media Evidence 22/22 and Scoped Evidence 26/26 pass.

**Limitations:** workspace runtime remains Node 22.16.0 while the project requires Node.js 24.15.0 (`^24.15.0`); dependencies are absent. Dependency-backed typecheck, lint, Next.js build, real Pi Browser/device acceptance, migration rehearsal, live scanner-provider acceptance, formal accessibility certification and load/chaos testing are not certified. Advanced analytics, paginated all-time export, collaboration UI, localization, offline-first field capture, geographic reference-data ingestion, retention automation and notification delivery remain future work. Existing REVIEW_REQUIRED migrations remain unapplied.

**Delivery:** source-only local derivative. No GitHub push, Vercel deployment, Supabase mutation, database migration, Production/Mainnet change, financial mutation, Pi payout or GHC credit occurred. Production remains NOT APPROVED.


## Coordinated implementation steps

1. Confirm RUN384 archive as the parent source and extract into an isolated working tree.
2. Trace Research Studio, Field Desk, public response, project and inbox APIs before editing.
3. Preserve owner authentication, durable Pioneer session checks, service-role boundaries and existing RLS.
4. Add project lifecycle metrics based only on loaded owner-scoped projects.
5. Add local study search and lifecycle filters with reset and empty-result states.
6. Add CSV export only for responses already returned by the owner-scoped API, disclosing the 200-row limit.
7. Quote CSV values and neutralize spreadsheet formula-leading cells.
8. Correct response-link instructions to require Pi Browser and verified Pioneer sign-in.
9. Add Field Desk session-verification loading UX and no-index metadata for the private Studio page.
10. Register the RUN385 regression gate in static and prebuild checks; synchronize release identity and source-of-truth documentation.
