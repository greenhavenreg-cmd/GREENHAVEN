# Upgrade worklog — 0.338.168 / RUN456

**Date:** 27 November 2026  
**Parent:** `gh-connect@0.338.167` / RUN455  
**Scope:** Release the existing read-only Impact History feature independently of the donation-capable Charity service.

1. Inspected the existing charity impact summary route, normalization contract, UI, ledger adapter and release gate before changing release status.
2. Confirmed the existing screen is read-only and displays only durable server-confirmed contribution history.
3. Added a distinct `impact-history` Ecosystem service with ACTIVE status and a dedicated focus destination.
4. Mounted `CharityImpactScreen` in the Ecosystem directory and preserved its back-navigation behavior.
5. Changed the summary API release boundary to `impact-history`; the release check remains before authentication and ledger access.
6. Changed the durable rate-limit namespace to `ecosystem-impact-history` to match the newly separated surface.
7. Kept the broader donation-capable `charity` service and its causes, donation and community-project subfeatures Coming Soon.
8. Preserved authentication, user-ID binding, deny-on-rate-limit-unavailable behavior, no-store responses, exact atomic PI formatting, and segregated non-withdrawable accounting.
9. Added the RUN456 source contract and registered it in both `verify:static` and `prebuild:checks`.
10. Updated package and lockfile versions, in-app release identity, README, current source-of-truth, project truth and verified migration manifest.
11. Ran focused Impact History, charity ledger, charity release-boundary and RUN455 Events/Services regression checks.
12. Ran the full static verification suite under the available Node 24.11.1 runtime; the project's required Node.js 24.15.0 runtime is not available in this environment.

## Source-only verification scope

No dependency installation, supported-runtime typecheck, lint, Next production build, browser/device E2E, Git push, Vercel deployment, Supabase mutation, migration application, Pi provider operation, payment or Mainnet action was performed. Production remains NOT APPROVED pending the existing release gates.
