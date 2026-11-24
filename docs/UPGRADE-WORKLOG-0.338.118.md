# UPGRADE WORKLOG 0.338.118 — Phase D Communities + Supabase Storage

**Parent:** `GREENHAVEN-0.338.117-PHASE7-8-HARMONIZED-2026-11-24.zip`  
**Release candidate:** `0.338.118`  
**Mode:** in-place upgrade; source-only; no rewrite.

## Implementation

1. Re-inspected the Phase D community and Storage scope against the actual 0.338.117 source tree. The legacy Phase D note is retained as historical evidence only; the current product APIs, domain adapters and migrations remain authoritative.
2. Preserved the existing community directory, access filters, Board/Updates/Members/Mod surfaces, governance reports/log, join queue and durable join-decision RPC.
3. Added authenticated `GET /api/communities/[id]/roles`, which resolves only the current authenticated caller's role through the canonical server role RPC. It does not accept an arbitrary user ID.
4. Added durable read rate limiting and private/no-store response headers to the role lookup.
5. Changed the community hub so moderator-only controls require a fresh server-verified role. The check is keyed to the current canonical account identity so account switching clears the previous role snapshot. Missing identity, unavailable storage or lookup errors fail closed to guest UI. Existing mutation routes continue to authorize independently.
6. Added normalized privacy access chips to community directory cards.
7. Replaced raw opaque applicant IDs in both visible join-queue surfaces with neutral applicant ordinals. Raw IDs remain only in the action callback that submits the durable decision.
8. Added a focused runtime policy test for Open join, Approval, Invite only and Private normalization/filter behavior.
9. Added dedicated community and Storage completion gates and registered them in both `prebuild:checks` and `verify:static`.
10. Preserved the private `gh-media` architecture: one bucket, category prefixes, 50 MiB bucket limit, 40 MiB video limit, MIME allowlist, owner-scoped paths, server-issued signed upload, upload-session verification, object metadata verification, durable asset finalization and viewer-authorized delivery.
11. Added Storage acceptance assertions for safe create-only-if-missing provisioning, conflict re-read, no automatic changes to existing buckets, signed URL origin checks, private delivery and read-only catalog SQL.
12. Updated package, lockfile and app release metadata to `0.338.118`; no dependencies changed.

## Source-only verification scope

The dedicated Phase D and retained regression gates are source/runtime contract checks only; they do not prove live database or browser acceptance.

## Verification results

- Phase D Communities source gate: **11/11**.
- Phase D community privacy runtime test: **10/10**.
- Phase D Supabase Storage source gate: **17/17**.
- Existing Phase 6 Communities & Discovery: **15/15**.
- Existing Priority 7 Community discovery: **13/13**.
- Existing Run 394 profile + Storage: **24/24**.
- Existing Run 384 Testnet/Storage audit: **13/13**.
- Existing media API hardening: **27/27**.
- Existing Phase 7/8 harmonization: **8/8**.
- Full `npm run verify:static`: **PASS 63/63**.
- TypeScript syntax transpilation of all five changed TS/TSX files: **5/5**.
- Migration inventory check: **PASS**, 239 source files and class counts synchronized.
- SHA-256 comparison against the 0.338.117 parent: **239/239 migrations byte-identical**, no missing, extra or changed SQL files.
- Package, lockfile and in-app release identity: `0.338.118`.

Full `prebuild:checks`, dependency-backed typecheck/lint and Next production build were not run: the workspace has Node `22.16.0`, only that Node version is installed, and `node_modules` is absent; the project requires Node.js `24.15.0` / `^24.15.0`. Syntax transpilation is not a substitute for full TypeScript typechecking.

## Boundaries

No SQL migration was added, edited, replayed or applied. No live bucket, Storage object or policy was created/updated/deleted. No Testnet/Mainnet operation, Pi authorization, payment, payout, refund, reward, entitlement or wallet state change occurred. No Git push or Vercel deployment occurred.

## Outstanding acceptance

Node.js 24.15.0 dependency-backed install/typecheck/lint/production build, browser/device and multi-account community tests, live Testnet role/revocation and join-queue checks, live Testnet/Mainnet Storage catalog/policy checks, and authenticated upload/download/cross-account denial tests remain outstanding. Candidate is NOT production approved.
