# GreenHaven — current source of truth

**Accepted source archive:** `GREENHAVEN-0.338.139-RUN426-PHASE0-SOCIAL-EXPERIENCE-FOUNDATION-2026-11-26.zip`  
**Working package candidate:** `gh-connect@0.338.160` (RUN448 Discovery Toast and Operational Hash Repair)  
**Package identity:** `gh-connect@0.338.160`  
**Working candidate archive:** `GREENHAVEN-0.338.160-RUN448-DISCOVERY-TOAST-AND-OPERATIONAL-HASH-REPAIR-2026-11-26.zip`  
**Parent candidate:** `gh-connect@0.338.159` (RUN447)  
**Date:** 26 November 2026

## RUN448 update

Removed the duplicate `addToast` property declaration in `components/ghc/discovery-grid-screen.tsx`, preserving the success/error/info signature used by the existing call sites. Added the missing `createHash` import from `node:crypto` in `lib/server/marketplace/operational-rpc.ts`; SHA-256 evidence fingerprint behavior is unchanged. Added a focused regression contract to static and prebuild checks. The supplied Vercel log reports these two errors on RUN447. A fresh RUN448 TypeScript check and production build on Node.js 24.15.0 are still required. See `docs/RUN448-DISCOVERY-TOAST-AND-OPERATIONAL-HASH-REPAIR-2026-11-26.md`.

## Preserved previous repairs

- **RUN447:** canonical community role normalization, creator ownership precedence, and the two React Hook dependency-warning corrections.
- **RUN446:** corrected the in-memory marketplace spend call to match the two-argument `executeAuthoritativeSpend` signature.
- **RUN445:** separated the earnings dashboard server snapshot state from the render alias.
- **RUN444:** Testnet-only payment and withdrawal activation profile, with Production/Mainnet safety fences retained.
- **RUN443:** Testnet migration closeout is historical evidence only; it does not prove fresh migration parity or financial acceptance for this candidate.

**Acceptance status:** `0.338.160` is not yet accepted, pushed or deployed.  
**Release status:** **NOT APPROVED** for Mainnet or production financial release.

No remote Git push, Vercel deployment, database mutation or payment-provider transaction was performed.
