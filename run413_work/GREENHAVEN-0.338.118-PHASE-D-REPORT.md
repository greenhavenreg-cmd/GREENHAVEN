# GreenHaven 0.338.118 — Phase D Communities + Supabase Storage report

## Result

Both requested Phase D workstreams have been implemented in the existing source tree as an in-place upgrade from 0.338.117.

## Delivered

### Communities
- Added authenticated, rate-limited, private/no-store server role lookup for the current caller.
- Moderator-only UI now requires server-verified owner/admin/moderator status and fails closed when role lookup is unavailable.
- Preserved independent server-side authorization on every moderation write.
- Added explicit normalized privacy chips to community directory cards.
- Replaced raw applicant IDs in join queue display with neutral ordinal labels.
- Added focused community source and runtime policy gates.

### Supabase Storage
- Preserved the canonical private `gh-media` bucket and existing owner-scoped media lifecycle.
- Added a dedicated source acceptance gate covering bucket provisioning safety, signed URL trust, upload-session ownership, stored-object verification, idempotent finalization, private delivery and read-only SQL validation.
- No bucket splitting, policy broadening, storage metadata mutation or migration was introduced.

## Verification

- Phase D Communities: **11/11**.
- Community privacy runtime policy: **10/10**.
- Phase D Supabase Storage: **17/17**.
- Phase 6 Communities & Discovery: **15/15**.
- Priority 7 Community discovery: **13/13**.
- Run 394 profile + Storage: **24/24**.
- Run 384 Testnet/Storage audit: **13/13**.
- Media API hardening: **27/27**.
- Phase 7/8 harmonization: **8/8**.
- Full `npm run verify:static`: **PASS 63/63**.
- Changed TypeScript/TSX syntax transpilation: **5/5**.
- Migration inventory: **239 files**, synchronized.
- Migration SHA-256 comparison to parent: **239/239 identical**, zero missing, extra or changed SQL files.

**Not run:** full prebuild, dependency-backed TypeScript typecheck, lint and Next production build. The workspace has Node `22.16.0` only and no `node_modules`; the project requires Node.js `24.15.0` / `^24.15.0`. The 5-file syntax transpilation is not a substitute for typechecking.

## Release metadata

- Package: `gh-connect@0.338.118`
- Lockfile root: `0.338.118`
- In-app release: `0.338.118`
- Parent: `GREENHAVEN-0.338.117-PHASE7-8-HARMONIZED-2026-11-24.zip`

## Not performed

- No SQL migration added, edited, replayed or applied.
- No live Supabase bucket/policy/object mutation.
- No payment, payout, refund, reward, entitlement, wallet balance or Pi authorization action.
- No Mainnet change, Git push or Vercel deployment.

## Outstanding acceptance

Node 24.15.x dependency-backed install/typecheck/lint/build, browser/mobile/two-account testing, and live Testnet/Mainnet Storage policy and media lifecycle verification remain outstanding. This candidate is **NOT production approved**.
