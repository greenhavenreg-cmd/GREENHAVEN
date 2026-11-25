# Upgrade worklog — 0.338.102 RUN373

## Objective
Correct a Pi authentication routing defect in the Developer Sandbox frame classifier identified by the user's 2026-11-23 diagnostics.

## Root-cause finding
The RUN372 runtime accepted `app-cdn.minepi.com` as evidence that the application was framed by the Pi Developer Sandbox. The supplied diagnostics showed that exact referrer host, yet RUN353's own documented trust boundary specifies `sandbox.minepi.com`. Because `contexts/pi-auth-context.tsx` skips the App Studio parent-credentials handshake whenever `isPiSandboxFrame()` returns true, the broadened allowlist routed the app into `Pi.authenticate()` instead of the parent bridge. This explains why the failure occurred before `POST /api/auth/pi` and is a code-path defect consistent with the observed log.

## Implementation
1. Added `isTrustedPiSandboxReferrerHost()` as a pure exact-host predicate.
2. Restricted `isPiSandboxFrame()` to Testnet + iframe + exact `sandbox.minepi.com` referrer.
3. Removed `app-cdn.minepi.com` from Sandbox recognition.
4. Documented that the app-cdn origin is not proof of Developer Sandbox framing.
5. Preserved the App Studio parent-credentials path for non-Sandbox frames.
6. Kept the official SDK authentication path for the confirmed Developer Sandbox.
7. Preserved mandatory server-side `/api/auth/pi` token verification.
8. Updated RUN353 regression checks to enforce the exact-host trust boundary.
9. Added RUN373 checks for host matching, iframe/Testnet requirements, parent-handshake routing, server verification and no local-auth fallback.
10. Updated the superseded RUN341 check and historical audit note so the old app-cdn allowlist cannot be reintroduced by stale tests.
11. Synchronized package, lockfile, README, release notice, project-truth and verified-manifest version metadata to `0.338.102`.
12. Registered the RUN373 gate in prebuild, pretypecheck and static verification; no dependency versions changed.

## Validation
- RUN353 Pi auth root-cause checks: 17/17 passed.
- RUN373 Pi Sandbox frame-classification source checks: 9/9 passed.
- RUN373 executable host-policy tests: 10/10 passed, including rejection of app-cdn, subdomains and lookalike hosts.
- RUN370 rejection metadata: 7/7; RUN343 timeout: 8/8; RUN344 diagnostics: 10/10; RUN372 identity principal: 9/9; RUN341 identity audit: 11/11.
- `npm run verify:static`: passed with exit 0 after correcting stale RUN341/RUN300/RUN301 release assertions and synchronizing current release pointers.
- Node 22.16.0 is available, while Node.js 24.15.0 is required by the project. Dependency-backed typecheck, lint and production build are not claimed; this is a source-only verification scope.

## Safety boundary
No environment variables or Pi Developer Portal settings changed. No Supabase schema/data, migrations, sessions, wallets, ledger, payouts, payments, GitHub push, Vercel deployment or Mainnet actions occurred. Live Testnet acceptance is still required to confirm the fix in Pi Browser.

## RUN374 addendum — field-evidence build (same version, 0.338.102)
RUN373 was deployed (`sandboxFrame=false`) and Pi still rejected `Pi.authenticate()` with a generic "Authentication failed." in about 0.4s, with and without a user tap. The `app-cdn.minepi.com` misclassification was therefore not the root cause.

Changes:
1. `app-cdn.minepi.com` is a separate `app_cdn` frame kind via the exact-host `isPiAppCdnReferrerHost()`. It is never treated as the Developer Sandbox.
2. Sandbox and app-cdn frames skip the 4s parent-credentials probe, which never answered in field logs. They pre-initialize the SDK and wait for a tap. Server verification at `/api/auth/pi` is unchanged.
3. New `PI_AUTH_FRAME_CONTEXT` diagnostic before each authenticate call: init sandbox flag, frame kind, referrer host, ancestor hosts and Pi SDK method names.
4. Rejections now record `rejectionShape` (own property names and value types only, never values).
5. The copyable report adds `appCdnFrame` and `ancestorHosts`.

Not changed: `Pi.init({ sandbox })` is still resolved by `getPiSandbox()`. Setting it to false would point Testnet at Mainnet. No env vars, Supabase, payments or Mainnet were touched.

Validation: RUN373 9/9, RUN374 source 9/9, RUN374 host tests 9/9, `npm run verify:static` exit 0. Node 22 only; typecheck, lint and build were not run. Live Pi Browser Testnet test required.

## RUN375 addendum — SDK early-load regression repair (same version, 0.338.102)
Archive comparison against two older builds where Pi sign-in worked (RUN249 0.338.20, RUN302 0.338.86) found that both load the Pi SDK in the root layout before hydration. The field-research public-access work removed that script so public respondents never load Pi, leaving the SDK to load only after hydration. RUN374 field logs showed exactly that (`PI_SDK_INIT_START hasPi:false` at runtime) and a generic SDK rejection.

Change: `lib/pi-sdk-early-loader.ts` builds a tiny inline head script that injects the official SDK before hydration on every route except those in `lib/routing/public-route-policy.ts` (now exports `PUBLIC_PREFIX_ROUTES`). Public routes still load no Pi SDK. The loader skips if `window.Pi` or the script tag already exists.

Unchanged: `Pi.init` sandbox flag, server verification, CSP, env, Supabase, payments, Mainnet. Unconfirmed: this is a timing regression match, not yet proven live. The full CSP in `vercel.json` (absent in both older archives) is the second suspect if sign-in still fails.

Validation: RUN375 source 8/8, executable loader test 21/21 (every authenticated path injects, every public path does not), `npm run verify:static` below.
