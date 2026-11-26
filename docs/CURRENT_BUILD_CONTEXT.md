# CURRENT BUILD CONTEXT — GreenHaven RUN450

This document supersedes historical prompts and worklogs for the current working candidate; historical records remain evidence, not active instructions.

## Latest implementation — 0.338.162 Wallet, Withdrawal, Membership, Referral and Missions Repair / RUN450 (26 November 2026)

RUN450 is derived from RUN449 / 0.338.161. It corrects the squeezed PI wallet action layout; rebuilds withdrawal as amount → PIN → PIN confirmation → final review; adds a secret-safe readiness endpoint and prevents payout reservation unless the Testnet auto-executor, Pi API credentials and Testnet wallet seed are present. It repairs membership entitlement reads that used a bare relative REST path, public GreenHaven ID ensure/resolve RPCs that used relative fetch URLs, the missing `/join` referral landing route, and first-post mission navigation to the global composer. Referral settlement uses the explicit flag/Testnet unlock helper.

**Current source version:** `0.338.162` (unaccepted working candidate; parent `0.338.161` / RUN449).

The project requires Node.js 24.15.0. The local workspace has Node 22.16.0 and no installed dependencies, so dependency-backed TypeScript validation, lint and the Next.js production build are not certified here. The RUN450 static verification is source-only verification scope. A fresh Vercel Preview build remains required. The Testnet profile leaves executor key, Pi API key, Testnet wallet seed and PIN proof secret blank; withdrawals cannot execute until the operator supplies valid Testnet credentials. Referral settlement remains disabled if Preview explicitly sets `GHC_REFERRAL_SETTLEMENT_ENABLED=0`. Mission GHC issuance remains blocked by the existing Daily-Claim-only database guard pending an approved reward schedule and reviewed migration.

RUN447 community role normalization, RUN446 marketplace spend signature repair, RUN445 dashboard build repair and RUN444 Testnet payment profile are preserved. RUN443 Testnet migration closeout remains historical operational evidence and does not establish new migration application, current schema parity or live financial acceptance for RUN450. RUN385 coordinated upgrade programme remains documented in `docs/PHASE-7-8-HARMONIZED-PROGRAM-2026-11-24.md`.

**Acceptance status:** not accepted, pushed or deployed. **Mainnet/production financial release:** NOT APPROVED. No remote Git, Vercel, database or payment-provider action was performed. See `docs/RUN450-WALLET-WITHDRAWAL-MEMBERSHIP-REFERRAL-MISSIONS-2026-11-26.md`.
