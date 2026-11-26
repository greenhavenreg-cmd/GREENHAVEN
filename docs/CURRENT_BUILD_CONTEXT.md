# CURRENT BUILD CONTEXT — GreenHaven RUN448

This document supersedes historical prompts and worklogs for the current working candidate; historical records remain evidence, not active instructions.

## Latest implementation — 0.338.160 Discovery toast and operational hash repair / RUN448 (26 November 2026)

RUN448 fixes the two TypeScript failures reported by the user's RUN447 Vercel build log. `components/ghc/discovery-grid-screen.tsx` now has exactly one `addToast` declaration, retaining the success/error/info severity union used by call sites. `lib/server/marketplace/operational-rpc.ts` imports `createHash` from `node:crypto`, preserving the SHA-256 evidence fingerprint. A focused regression contract is registered in `verify:static` and `prebuild:checks`.

**Current source version:** `0.338.160` (unaccepted working candidate; parent `0.338.159` / RUN447).

The user-reported RUN447 Vercel log confirms all 468 prebuild checks passed and the optimized production bundle compiled, but TypeScript then failed on the duplicate toast declaration and missing crypto import. RUN448 has not yet been run through a supported-runtime `tsc --noEmit` or Next.js production build. The local environment has Node.js 22.16.0; the project requires Node.js 24.15.0.

The coordinated RUN385 upgrade program remains documented in `docs/PHASE-7-8-HARMONIZED-PROGRAM-2026-11-24.md`. RUN447 community role normalization and RUN446 marketplace spend signature repair remain included. RUN443 Testnet migration closeout remains historical operational evidence and does not establish new migration application, current schema parity or live financial acceptance for RUN448.

**Acceptance status:** not accepted, pushed or deployed. **Mainnet/production financial release:** NOT APPROVED. No remote Git, Vercel, database or payment-provider action was performed. See `docs/RUN448-DISCOVERY-TOAST-AND-OPERATIONAL-HASH-REPAIR-2026-11-26.md`.
