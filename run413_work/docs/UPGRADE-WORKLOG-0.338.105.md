# Upgrade worklog — 0.338.105 / RUN380

**Date:** 2026-11-24  
**Parent:** `GREENHAVEN-0.338.104-RUN379-ACCESS-AUDIT-RECONCILED-2026-11-24.zip`  
**Scope:** Pi-only Research and Field access control.

## Coordinated release implementation steps

1. Reconciled the RUN379 audit archive as the only parent source.
2. Updated the shared public-route policy to allowlist only legal/help and Pi domain-validation resources.
3. Applied an early service-page perimeter for missing GreenHaven session cookies.
4. Preserved the Field reporting interface inside the authenticated app shell.
5. Removed shared-code unlock and retired its API endpoint.
6. Required the durable account-security context on Field reporting, survey and evidence APIs.
7. Bound Field evidence/report scope to the canonical Pioneer and verified GH session.
8. Required durable Pioneer authentication on Research share and submission APIs.
9. Bound Research response and exam identities to server-verified Pioneer identity.
10. Added durable-session checks to Marketplace/Community fee quotes, economy/business service metadata, Pi platform capabilities, push configuration, social quality/reward status, and portal setup/compliance metadata APIs.
11. Reconciled release metadata, documentation, safe environment template and migration inventory.

## Changes

- Removed `/r/:slug`, `/field`, and `/portal-setup` from the public page allowlist. Only legal/help documents and the Pi Developer Portal domain-validation resource remain public.
- Added an early middleware page perimeter requiring the `gh_session` cookie before service-page rendering. Sensitive APIs still validate the durable server session; cookie presence is not treated as authentication.
- Preserved the `/field` reporting workspace inside the Pi-authenticated application shell and removed the shared-code unlock UI.
- Retired `/api/field/unlock` with HTTP 410. Removed the legacy field-token and shared-code implementation/configuration.
- Required `requireAccountSecurityContext` for Field reporting, surveys, evidence intent/completion, session status and admin evidence/report/content endpoints.
- Derived field evidence scope IDs from the canonical Pioneer ID and verified GreenHaven session ID.
- Removed legacy unscoped field-report persistence fallback. If the scoped report RPC is unavailable, durable field reporting fails closed.
- Required durable account-security context for research share-page metadata, survey submissions, evidence intent/completion and timed examination APIs.
- Derived research submission keys per Pioneer on the server and HMAC-hashed timed-exam respondent identity from the authenticated Pioneer ID.
- Set new Research projects to `allow_anonymous=false`; existing settings cannot bypass API authentication.
- Synchronized current route policy, documentation, environment template, release metadata and migration inventory.

## Verification

Focused checks pass: route policy 12/12; RUN380 boundary 17/17; Field Research foundation 22/22; Field intake 7/7; scoped evidence 26/26; Research integrity 12/12; timed examination/election workflow 22/22; RUN342 auth scope 6/6; RUN375 SDK loader 21/21; RUN373 Sandbox classification 9/9; RUN374 app-CDN classification 9/9; RUN379 CSP/auth diagnostics 8/8; RUN377 identity/session ACL 24 assertions; project truth 11/11; release hygiene 17/17; Run #300 release integrity 22/22.

Full `npm run verify:static` completed successfully with exit code 0; the consolidated network/database-independent static suite passed 63/63. This is a source-only verification scope. The available Node runtime is 22.16.0 rather than the required Node.js 24.15.0, and dependencies are not installed. Dependency-backed typecheck, lint, Next.js build and live Pi Browser/Testnet acceptance are not claimed.

No GitHub push, Vercel deployment, Supabase mutation, migration application, Mainnet action, payment operation or financial-state change occurred. Production remains **NOT APPROVED**.
