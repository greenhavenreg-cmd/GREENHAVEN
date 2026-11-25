# GreenHaven project-wide audit — RUN379 / 0.338.104

**Audit baseline:** `GREENHAVEN-0.338.104-RUN379-PI-CSP-AUTH-DIAGNOSTICS-2026-11-23.zip`  
**Package:** `gh-connect@0.338.104`  
**Audit date:** 2026-11-24  
**Scope:** source inventory, release metadata, Pi authentication, route-shell policy, API boundary inventory, documentation authority, and executable source regression checks.

## Executive result

This is the first comprehensive source-audit pass and upgrade-readiness assessment. It is not a claim that every runtime path has passed end-to-end acceptance. The archive contains 2,783 files: 933 TypeScript, 259 TSX, 614 MJS, 261 SQL, 657 Markdown, 14 CSV, 13 JSON, and other assets/configuration files. It contains 280 API route handlers. The supplied archive has no `.git` metadata, no `node_modules`, and this workspace runs Node 22.16.0 while the package requires Node `^24.15.0`.

**Release posture: NOT APPROVED for production-wide access-policy changes until the route-by-route authorization matrix, supported-runtime build, Pi Browser acceptance, and two-account isolation tests are complete.**

## Verified source findings and immediate corrections

### 1. Current authority documents pointed to an older archive

`docs/SOURCE_OF_TRUTH.md` and `docs/PROJECT_TRUTH.md` still identified RUN375/RUN377 as the current user-provided baseline even though the supplied archive is RUN379. Their current authority headers and source pointers have been updated to identify RUN379. The package version remains 0.338.104.

### 2. Authentication comment contradicted executable scopes

`contexts/pi-auth-context.tsx` stated that ordinary sign-in omitted the `payments` scope, while the immediately following executable call requested `username` and `payments`. The comment was corrected to describe the actual scopes and distinguish wallet-address consent, which remains a separate explicit flow.

### 3. Acceptance register was stale and could be mistaken for current status

`docs/ACCEPTANCE-COMPLETION-REGISTER.md` identified baseline 0.330.48 and last update 2026-11-08. It was moved to `docs/archive/historical-implementation-records/docs__ACCEPTANCE-COMPLETION-REGISTER.md`; the historical record is retained for traceability, while the current docs index directs engineers to the RUN379 source authority and audit.

## Inventory

| Area | Files |
|---|---:|
| TypeScript | 933 |
| TSX | 259 |
| JavaScript modules (`.mjs`) | 614 |
| SQL migrations/tests/proposals | 261 |
| Markdown/MDX | 657 |
| API route handlers | 280 |
| Total files | 2,783 |

Largest code/documentation concentrations: `docs/` (673 files), `scripts/` (614), `lib/` (613), `app/` (301), `components/` (216), `features/` (38), and `supabase/` (253). Counts are inventory, not a quality score.

## Executed source checks

| Check | Result |
|---|---:|
| RUN379 Pi CSP/auth diagnostics | 8/8 PASS |
| RUN342 Pi auth scope isolation | 6/6 PASS |
| RUN353 Pi auth root-cause regression | 17/17 PASS |
| RUN377 identity/session ACL source contract | 24 assertions PASS |
| Public-route boundary contract | 12/12 PASS |
| RUN338 Pi auth diagnostics | 25/25 PASS |
| RUN372 canonical identity principal | 9/9 PASS |
| RUN373 Pi Sandbox frame classification | 9/9 PASS |
| RUN374 Pi App CDN frame evidence | 9/9 PASS |
| RUN375 early Pi SDK loader | 8/8 PASS |
| Dependency security policy | 11/11 PASS |

RUN376 readiness regression was rerun through the package-defined Node TypeScript-strip command and passed all 14 assertions. The initial direct invocation without type-stripping flags was an environment/command mismatch, not a verified source defect.

## High-priority security and architecture findings

### A. Public route shell is intentionally still available

`lib/routing/public-route-policy.ts` explicitly allowlists `/privacy`, `/terms`, `/support`, `/portal-setup`, `/validation-key.txt`, opaque `/r/:slug` respondent links, and exact `/field` intake. `components/app-wrapper.tsx` renders those routes in `PublicRouteShell`, which deliberately does not mount `PiAuthProvider`, `IdentityProvider`, or the session-lock provider. `scripts/check-public-route-boundary.mjs` enforces this behavior.

This conflicts with the newly stated product requirement that all human-facing GreenHaven product surfaces require a verified Pi account. It is not safe to remove the allowlist blindly: privacy/terms and portal validation have platform/legal roles, while research/field respondent links have dedicated workflows and APIs. The next implementation must classify each path as (1) Pi-authenticated product surface, (2) unauthenticated Pi sign-in/bootstrap surface, or (3) machine/platform protocol endpoint. Human-facing respondent and field flows should be retired or converted to Pi-authenticated flows only after their owners, data contracts, and external links are migrated.

### B. Page access is not enforced by the current middleware

`middleware.ts` has matcher `['/api/:path*']`; it does not run on page requests. The app shell performs a client-side authentication gate for non-public routes, but that is not equivalent to server-side page authorization. The route and API layers must be reviewed independently. This does not prove that protected data is currently exposed: API handlers may enforce their own identity checks. It does prove that a centralized server-side Pi Browser/page boundary is not currently provided by this middleware.

### C. Browser-only access cannot be established by a user-agent check

A user-agent, referrer, iframe flag, or client-supplied header can be forged. The primary security boundary must remain a backend-verified Pi access token, canonical Pi-to-GreenHaven identity mapping, durable server session, and per-resource authorization. Pi Browser/frame signals can be additional risk controls, not the sole proof of identity or browser provenance. Any implementation must preserve the unauthenticated Pi sign-in bootstrap and server-to-server protocol endpoints while denying human product access to non-Pi authenticated sessions.

### D. API authorization inventory needs a route-by-route proof

There are 280 route handlers. A simple grep for generic auth helper names is not a valid authorization audit because this codebase uses multiple helper names and service abstractions. No route should be labelled unauthenticated or safe based only on a text search. Each handler needs classification by method, data sensitivity, authentication helper, canonical principal, ownership check, role/step-up requirement, webhook/internal signature, and intentional public capability. This is a required next audit deliverable before access-policy enforcement is changed.

## Full static suite

`npm run verify:static` completed with exit code 0: 4,738 PASS lines, zero FAIL lines. This is the complete package static verification chain, but it does not replace dependency-backed compilation, a production build, or live runtime acceptance.

## Runtime and deployment limits

- `node scripts/check-node-runtime.mjs` fails because the workspace is Node 22.16.0 and the project requires `^24.15.0`.
- `node_modules` is absent; dependency-backed typecheck, lint, and Next.js production build were not run.
- The full static suite was certified as completed in this audit pass: `npm run verify:static` exited 0 with 4,738 PASS lines and zero FAIL lines. Dependency-backed typecheck, lint, production build, and live runtime acceptance remain unverified.
- No GitHub push, Vercel deployment, Supabase write, migration application, Pi payment, or Mainnet operation was performed.
- `/api/health` readiness and storage probes are not proof of successful Pi Browser authentication.

## Upgrade preparation: mandatory access model

1. **Pi identity:** accept only a Pi access token verified server-side with the official Pi Platform identity endpoint; map the verified Pi UID to one canonical GreenHaven `userId`.
2. **Durable session:** issue an opaque, revocable, HttpOnly, Secure, appropriately SameSite session cookie; enforce expiry, revocation, account-switch invalidation, and session rotation.
3. **Every API:** enforce authenticated canonical principal and resource ownership server-side. Add explicit role/step-up and anti-replay/idempotency controls to privileged and financial operations.
4. **Every human page:** enforce access before protected server-rendered data is returned. Client shell gates remain UX only.
5. **Pi Browser policy:** use SDK/frame/origin signals as supplemental controls, with a carefully tested bootstrap exception for sign-in. Do not trust user-agent or referrer as cryptographic proof.
6. **Protocol exceptions:** keep only narrowly scoped machine endpoints such as liveness, Pi auth exchange, Pi payment callbacks, signed webhooks, and domain validation. These must expose no private user data and must have their own authentication/signature controls.
7. **Public links:** disable or redesign public respondent/field pages and their APIs if the product decision is that no human-facing project surface is public. Migrate existing links and data contracts before removing old paths.
8. **Acceptance:** test external browser denial, unauthenticated Pi Browser bootstrap, successful verified Pi sign-in, revoked/expired session denial, account switching, direct API access, IDOR across two accounts, webhook authenticity, and payment callback replay.

## Immediate next audit tranche

- Build a route-by-route API authorization matrix for all 280 handlers and inspect the actual imported helper implementations.
- Inventory all App Router pages/layouts/server actions and determine which render private data before client authentication.
- Trace every public route to its backing API, data store, and external entry points; decide whether to retire or authenticate it.
- Audit all SQL migration objects, RLS policies, grants, SECURITY DEFINER functions, and RPC callers without changing remote databases.
- Run the full prebuild/static suite, TypeScript, ESLint, and production build under Node 24.15.x after deterministic dependency installation.
- Perform Pi Browser Testnet sign-in and two-account authorization tests against a dedicated Preview deployment.

## 2026-11-24 documentation consistency correction

The first packaged audit report contained two contradictory statements about `npm run verify:static`: the verification section recorded exit code 0 with 4,738 PASS lines and zero FAIL lines, while the runtime-limit section said the suite was not certified. The latter statement has been corrected to agree with the recorded command result. `docs/PROJECT_TRUTH.md` was also updated because it retained an older RUN377 timeout statement. This correction does not upgrade the release posture: dependency-backed typecheck/lint/build, live Pi Browser acceptance, route-by-route authorization proof, and two-account isolation tests remain outstanding.

**No destructive cleanup, database mutation, production deployment, or Mainnet change is authorized by this audit report.**
