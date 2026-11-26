# GreenHaven upgrade worklog — 0.338.138 (RUN424)

**Date:** 26 November 2026  
**Parent source:** 0.338.137 Phase 1–6 integrated R2  
**Network:** Pi Testnet only

## Implementation steps
1. Reopened the exact user-designated R2 archive and confirmed ZIP integrity and package baseline.
2. Traced the withdrawal quote from the API route through the wallet snapshot RPC and withdrawal quote helper.
3. Verified from the source migration that snapshot `balance` is spendable and already excludes active withdrawal reservations.
4. Corrected the withdrawal GET route to pass posted `ledgerBalance` into the quote helper, which subtracts reservations once.
5. Added a fail-closed response when withdrawal reservations exceed posted ledger balance.
6. Removed the silent `ledgerBalance <- balance` fallback so incomplete RPC snapshots cannot conceal schema drift.
7. Matched the production logout/revoke clearing cookie with the issued `Secure; Partitioned` session-cookie attributes.
8. Added the RUN424 source-contract regression gate and registered it in prebuild and static verification.
9. Advanced package, lockfile and in-app release identity together to `0.338.138`; regenerated the migration inventory and synchronized current-source documentation.
10. Ran the full static verification suite, corrected the stale release metadata it exposed, and re-ran the suite to confirm its final result.

## Validation

- Focused identity, session, wallet, withdrawal, rewards, cashback, and Marketplace checks passed. RUN425 also covers the observed Pi profile-sync 409 failure.
- Runtime-only tests passed using Node's experimental TypeScript stripping support.
- Full `npm run verify:static` completed with exit code 0 after RUN424/RUN425 integration. Project-truth and documentation hygiene gates passed. RUN424 profile/session contract passes 8/8 and RUN425 profile-upsert/permission contract passes 13/13.
- Prebuild dry-run discovered 447 checks; the actual prebuild was not executed because the available Node runtime is 22.16.0 and the project requires Node 24.15.0.
- **Source-only verification scope:** the code and repository checks are validated locally; this does not prove a Node 24.15.0 dependency-backed typecheck, lint, build, live Pi Browser authentication, or end-to-end financial acceptance.
- Full dependency-backed build, lint and typecheck remain pending because this local runtime is Node 22.16.0 and the project requires Node 24.15.0.

## Operational boundary
No GitHub push, Vercel deployment, Supabase DDL, migration replay, financial transaction, or Mainnet action occurred. The connected Testnet Preview flags were inspected read-only.
