# Upgrade worklog — 0.338.162 / RUN450

## Scope
Coordinated repair for wallet action layout, staged Pi withdrawal, authoritative membership status, referral landing/identity resolution and mission action routing.

## Source changes
- `app/globals.css`: PI actions use two columns and larger touch targets; GHC remains four columns.
- `components/ghc/pi-withdraw-sheet.tsx`: amount → PIN → PIN confirmation → review flow; fixed-height sheet, internal scroll and persistent action footer; secret-safe readiness preflight; raw PIN cleared after server verification.
- `app/api/economy/earnings/withdrawals/readiness/route.ts`: authenticated readiness check; exposes reason codes only, never secrets.
- `app/api/economy/earnings/withdrawals/route.ts`: refuses payout request creation until Testnet auto-executor and provider credentials are present, avoiding new stranded reservations.
- `lib/server/membership/entitlement-store.ts`: membership reads use shared Supabase REST helper rather than an invalid relative Node fetch URL.
- `lib/server/economy/public-id.ts`: ensure/resolve RPCs use the shared Supabase RPC helper.
- `app/join/route.ts` and public route policy: validated same-origin referral landing redirect.
- `lib/server/referral/referral-service.ts`: settlement uses the existing explicit-flag/Testnet-unlock helper.
- `components/ghc/rewards-centre-screen.tsx`: first-post mission opens composer; first-post and community guidance are direct. Create-community mission verification remains outside the current SQL verifier allowlist.
- Added `scripts/check-run450-wallet-withdrawal-membership-referral-missions.mjs`, registered in `verify:static` and `prebuild:checks`.

## Implementation steps
1. Reproduce the PI action squeeze from the shared wallet action group and isolate the CSS grid rule to the inner action grid.
2. Replace the long, page-scrolling withdrawal sheet with a viewport-bounded dialog, independent content scrolling and a persistent action footer.
3. Implement the amount → PIN → confirm PIN → final review flow and keep only the short-lived amount-bound server proof after PIN verification.
4. Add an authenticated payout readiness endpoint that reports safe reason codes without disclosing credential values.
5. Guard the payout-request writer so no reservation is created when Testnet auto-execution, executor key, Pi API key or Testnet wallet seed is missing.
6. Replace the invalid relative membership REST fetch with the shared configured Supabase REST client.
7. Replace relative public-ID RPC fetches with the shared Supabase RPC client so GreenHaven IDs can be durably ensured and resolved.
8. Add a validated `/join` redirect and make that redirect the only new public referral route; keep referral mutation endpoints authenticated.
9. Align referral settlement with the existing explicit-flag/Testnet unlock helper and link first-post/community tasks to their relevant surfaces.
10. Add RUN450 regression coverage, register it in static/prebuild gates, synchronize release metadata and document the remaining live acceptance requirements.

**Source-only verification scope:** these checks validate source contracts and release metadata; they do not substitute for a dependency-backed typecheck, Vercel build, live database RPC test or provider transfer.

## Financial and deployment safeguards
- No credentials were invented or committed. Pi A2U still requires operator-supplied Testnet executor key, Pi API key, Testnet wallet seed and PIN proof secret.
- No funds are reserved unless the execution path is configured. Existing request idempotency and provider reconciliation fences remain unchanged.
- Referral settlement respects explicit `GHC_REFERRAL_SETTLEMENT_ENABLED=0`; Preview must have `1` or a valid Testnet unlock with the flag unset.
- Mission GHC issuance remains blocked by the existing Daily-Claim-only database guard. Mission payout amounts and issuance policy require explicit product approval and a reviewed migration.
- No migration files changed or applied; no remote Supabase, GitHub, Vercel or Pi provider action was performed.

## Verification results
- RUN450 focused regression: 17/17.
- `npm run verify:static`: 63/63 gates; 5,405 PASS lines; zero FAIL lines.
- Documentation hygiene and repository consistency: PASS.
- Prebuild manifest dry-run: 471 checks discovered.
- The prebuild manifest dry-run discovered 471 checks. The actual `npm run prebuild` stopped at the runtime gate because the workspace has Node 22.16.0 and the repository requires Node 24.15.0 or later in the Node 24 line. A temporary global TypeScript link used for a separate direct-check attempt was removed; no `node_modules` directory is included in the release archive.

## Acceptance still required
Node.js 24.15.0 dependency-backed typecheck/lint/Next build; fresh Vercel Preview; Supabase membership and referral RPC smoke tests; Pi Testnet payout readiness with real Testnet credentials; two-account referral attribution/settlement; VIP/VVIP upgrade by Pi and GHC; and full mission validation/claim design after reward schedule approval.
