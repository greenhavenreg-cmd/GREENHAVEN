# GreenHaven — current source of truth

**Accepted source archive:** `GREENHAVEN-0.338.139-RUN426-PHASE0-SOCIAL-EXPERIENCE-FOUNDATION-2026-11-26.zip`  
**Working package candidate:** `gh-connect@0.338.162` (RUN450 Wallet, Withdrawal, Membership, Referral and Missions Repair)  
**Package identity:** `gh-connect@0.338.162`  
**Working candidate archive:** `GREENHAVEN-0.338.162-RUN450-WALLET-WITHDRAWAL-MEMBERSHIP-REFERRAL-MISSIONS-2026-11-26.zip`  
**Parent candidate:** `gh-connect@0.338.161` (RUN449)  
**Date:** 26 November 2026

## RUN450 update

RUN450 passes 63/63 static gates (5,405 PASS lines, zero failures) and discovers 471 prebuild checks in dry-run. It fixes the squeezed PI wallet actions, rebuilds Pi withdrawal as amount → PIN → PIN confirmation → final review, and adds a secret-safe readiness check plus a server preflight that prevents reservations unless the Testnet payout executor and provider credentials are present. It fixes membership entitlement reads that used a bare relative fetch URL, fixes public GreenHaven ID ensure/resolve RPC calls, adds the missing `/join` referral landing redirect and routes first-post missions into the real composer. Referral settlement now respects the guarded Testnet unlock helper. Mission GHC issuance remains intentionally locked by the existing Daily-Claim-only database guard; an approved mission reward schedule and reviewed migration are required before adding GHC claim buttons. See `docs/RUN450-WALLET-WITHDRAWAL-MEMBERSHIP-REFERRAL-MISSIONS-2026-11-26.md`.

## RUN449 update

RUN449 restores the canonical credential-free root `.env.example` omitted from the RUN448 release archive. Its absence caused RUN444 prebuild check 5/469 to fail with `ENOENT`. Privileged credentials remain blank and generic Pi A2U/earnings payout defaults remain disabled; the separate Testnet Preview activation profile is unchanged. A focused restoration contract is registered in static and prebuild checks. The supplied RUN448 Vercel log shows the first four checks passing and then fails at check 5; it does not prove the remaining checks or Next.js build. See `docs/RUN449-ENV-TEMPLATE-RESTORATION-2026-11-26.md`.

## RUN448 update

Removed the duplicate `addToast` property declaration in `components/ghc/discovery-grid-screen.tsx`, preserving the success/error/info signature used by the existing call sites. Added the missing `createHash` import from `node:crypto` in `lib/server/marketplace/operational-rpc.ts`; SHA-256 evidence fingerprint behavior is unchanged. Added a focused regression contract to static and prebuild checks. The supplied Vercel log reports these two errors on RUN447. A fresh RUN448 TypeScript check and production build on Node.js 24.15.0 are still required. See `docs/RUN448-DISCOVERY-TOAST-AND-OPERATIONAL-HASH-REPAIR-2026-11-26.md`.

## Preserved previous repairs

- **RUN447:** canonical community role normalization, creator ownership precedence, and the two React Hook dependency-warning corrections.
- **RUN446:** corrected the in-memory marketplace spend call to match the two-argument `executeAuthoritativeSpend` signature.
- **RUN445:** separated the earnings dashboard server snapshot state from the render alias.
- **RUN444:** Testnet-only payment and withdrawal activation profile, with Production/Mainnet safety fences retained.
- **RUN443:** Testnet migration closeout is historical evidence only; it does not prove fresh migration parity or financial acceptance for this candidate.

**Acceptance status:** `0.338.162` is not yet accepted, pushed or deployed.  
**Release status:** **NOT APPROVED** for Mainnet or production financial release. Pi payout credentials and PIN proof secret remain operator-supplied; mission GHC rewards remain policy-locked. The supplied dependency audit reports 22 findings (1 critical, 13 high, 6 moderate, 2 low); the audit artifact is required for safe advisory-specific upgrades. The zero-vulnerability gate remains enabled.

No remote Git push, Vercel deployment, database mutation or payment-provider transaction was performed.
