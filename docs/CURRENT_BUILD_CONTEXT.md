# CURRENT BUILD CONTEXT — GreenHaven RUN449

This document supersedes historical prompts and worklogs for the current working candidate; historical records remain evidence, not active instructions.

## Latest implementation — 0.338.161 Environment template restoration / RUN449 (26 November 2026)

RUN449 restores the canonical credential-free root `.env.example` omitted from the RUN448 archive. Its absence caused the supplied Vercel Preview prebuild to fail at RUN444 check 5/469 with `ENOENT`. The template retains blank privileged credentials and disabled generic Pi A2U/earnings payout defaults; the separate Testnet Preview activation profile remains unchanged. A focused RUN449 regression contract is registered in `verify:static` and `prebuild:checks`.

**Current source version:** `0.338.161` (unaccepted working candidate; parent `0.338.160` / RUN448).

The supplied RUN448 Vercel log confirms checks 1–4 passed and check 5 failed due to the missing root template. It does not prove completion of the remaining prebuild checks, TypeScript validation or the Next.js production build. The project requires Node.js 24.15.0. The supplied dependency-security output reports 22 npm audit findings (1 critical, 13 high, 6 moderate, 2 low); the advisory JSON is required before safe dependency-specific remediation. The zero-vulnerability security gate remains enabled.

RUN447 community role normalization and RUN446 marketplace spend signature repair remain included. RUN443 Testnet migration closeout remains historical operational evidence and does not establish new migration application, current schema parity or live financial acceptance for RUN449.

**Acceptance status:** not accepted, pushed or deployed. **Mainnet/production financial release:** NOT APPROVED. No remote Git, Vercel, database or payment-provider action was performed. See `docs/RUN449-ENV-TEMPLATE-RESTORATION-2026-11-26.md`.

The coordinated RUN385 upgrade program remains documented in `docs/PHASE-7-8-HARMONIZED-PROGRAM-2026-11-24.md`. RUN447 community role normalization and RUN446 marketplace spend signature repair remain included. RUN443 Testnet migration closeout remains historical operational evidence and does not establish new migration application, current schema parity or live financial acceptance for RUN448.

**Acceptance status:** not accepted, pushed or deployed. **Mainnet/production financial release:** NOT APPROVED. No remote Git, Vercel, database or payment-provider action was performed. See `docs/RUN448-DISCOVERY-TOAST-AND-OPERATIONAL-HASH-REPAIR-2026-11-26.md`.
