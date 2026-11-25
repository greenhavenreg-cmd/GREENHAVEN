# RUN380 — Pi-only Research and Field access control

**Package:** `gh-connect@0.338.105`  
**Parent:** `GREENHAVEN-0.338.104-RUN379-ACCESS-AUDIT-RECONCILED-2026-11-24.zip`  
**Status:** source-only; not pushed or deployed.

## Required access sequence

1. Open GreenHaven inside Pi Browser.
2. Complete official Pi SDK authentication.
3. Submit the Pi access token through the existing GreenHaven authentication bootstrap.
4. Verify the token server-side with Pi Platform and resolve the canonical GreenHaven identity.
5. Establish a durable GreenHaven server session.
6. Authorize every protected service API against that session and the relevant owner/role rules.

A research URL, access code, client-supplied Pioneer name, browser flag or local-storage value is not an authentication credential.

## Page boundary

- Removed `/r/:slug`, `/field`, and `/portal-setup` from the public route allowlist.
- Only `/privacy`, `/terms`, `/support`, and `/validation-key.txt` remain public.
- Every service route mounts the Pi-authenticated app shell and receives the early official Pi SDK loader.
- Middleware redirects anonymous service-page requests without a `gh_session` cookie to the root sign-in entry. Cookie presence is an early perimeter check only; it is not considered proof of authentication.
- `/field` retains its reporting UI, but it is available only inside the authenticated app shell. The public code-entry UI has been removed.

## Ecosystem service API perimeter

Read-only endpoints used by service modules now also require the durable account-security context rather than remaining anonymously callable: Marketplace listing-fee quotes, Community creation-fee quotes, business monetization policy, economy catalog/supply/policy/acquisition policy, Pi platform capabilities, push configuration, content-reward status, GHPV quality status, and the portal-links/compliance-posture configuration endpoints. These responses are private/no-store where applicable.

The 280 route files were mechanically screened for account-authentication or protocol/operations guards. The remaining 23 routes without a direct account-auth helper are classified as: health/liveness (`/api/health`, `/api/health/live`, `/api/health/media`, `/api/health/withdrawals`, `/api/payments/health`, `/api/economy/health`); Pi domain validation (`/api/validation-key`); retired field unlock (`/api/field/unlock`, HTTP 410); internal GHPV settlement (`/api/social/posts/:id/ghpv/settle`, internal key); operator-only reports and operations (`/api/operator/pi-listing-readiness`, `/api/operator/claim-readiness-report`, `/api/operator/operational/*`, `/api/admin/revenue-summary`); release-readiness metadata (`/api/release/readiness`, `/api/release/beta-readiness`, `/api/release/final-audit`, with diagnostic detail restricted); anonymous-safe non-persisted telemetry (`/api/analytics/events`, `/api/analytics/vitals`); and withdrawal processing (`/api/economy/earnings/withdrawals/process`, which delegates to the worker that performs session/ownership checks). These are not anonymous ecosystem service access paths. The 280-handler authorization matrix still requires per-handler review and deployed Preview bypass testing; static source checks do not substitute for runtime authorization testing.

## Research participation

- `/r/:slug` is a share identifier, not a public access grant.
- Research form metadata, submissions, evidence upload intent/completion and timed examination APIs require `requireAccountSecurityContext`.
- The account-security context requires a GreenHaven server session and enforces durable session-store availability in production.
- Research submission keys are derived server-side from the canonical Pioneer ID plus the client-generated per-submission nonce. The client cannot choose another Pioneer identity.
- Timed examination attempt hashes are derived server-side from the authenticated Pioneer ID, not from a client-supplied respondent key.
- New research projects set `allow_anonymous=false`. Existing project settings cannot bypass the API session requirement.

## Field reporting

- `/api/field/unlock` is retired and returns HTTP 410 with `PI_AUTHENTICATION_REQUIRED`.
- Field session status, survey retrieval, report submission, evidence intent/completion, and admin evidence/report/content routes require the durable account-security context.
- Field evidence scope identifiers are derived server-side from the canonical Pioneer ID and verified GreenHaven session ID.
- Durable report persistence now requires the scoped `gh_field_report_append_scoped` RPC. It does not fall back to the legacy unscoped RPC; if the scoped-evidence migration is not installed, durable field reporting fails closed rather than losing the Pioneer/session binding.
- The field reporter signs out through the existing GreenHaven session logout and Pi-auth state reset.

## Browser enforcement limitation

The authoritative identity boundary is official Pi SDK authentication followed by server-side Pi Platform token verification and a durable GreenHaven session. User-agent, referrer, iframe and browser strings are spoofable and are not claimed as cryptographic proof that a browser binary is Pi Browser. The application requires the Pi SDK authentication flow for service access and does not treat browser-identification strings alone as authorization.

## Focused verification

| Check | Result |
|---|---:|
| Pi-only route policy | 12/12 |
| RUN380 page/API boundary | 16/16 |
| RUN342 Pi auth scope isolation | 6/6 |
| RUN375 early Pi SDK loader | 21/21 |
| Field intake hardening | 7/7 |
| Scoped evidence engine | 26/26 |
| Research integrity | 12/12 |
| Field Research foundation | 23/23 |
| RUN373 Pi Sandbox classification | 9/9 |
| RUN374 Pi app-CDN classification | 9/9 |
| RUN379 Pi CSP/auth diagnostics | 8/8 |
| RUN377 identity/session ACL | 24 assertions |

## Outstanding acceptance

- Node 24.15.x dependency installation and full typecheck, lint and production build.
- Live Pi Browser Testnet sign-in and account/session renewal tests.
- Direct API calls without a session, expired/revoked session, cross-account and IDOR tests against the deployed Preview environment.
- Review and target-history reconciliation for the held scoped-evidence migration, followed by Testnet persistence and evidence-chain postflight.
- Browser/device acceptance of Field reporting and Research share flows inside Pi Browser.

The available workspace is Node 22.16.0 and has no installed dependencies. No GitHub push, Vercel deployment, database mutation, migration application, Mainnet operation, payment operation or financial-state change was performed. Production remains **NOT APPROVED**.
