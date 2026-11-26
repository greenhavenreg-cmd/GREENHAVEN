# GreenHaven upgrade worklog — 0.338.151 / RUN439

**Date:** 26 November 2026  
**Parent candidate:** `0.338.150` / RUN438  
**Scope:** Phase 4 Identity & Authentication programme kickoff and principal-boundary regression hardening.

## Phase 4 scope

Phase 4 proceeds as a source implementation programme across identity/authentication, Community participation and Messenger group/contact flows. It builds on the existing canonical GreenHaven identity mapping and durable session model. This kickoff does not waive Phase 3 operational acceptance gates.

## Changes

1. Added a runtime regression to `scripts/test-run341-identity-lifecycle.mjs` for the security-sensitive case where a Pi provider subject remains the same but the server-verified canonical GreenHaven account mapping changes.
2. The regression asserts that the principal boundary resets prior bearer token, username, display name and account-bound onboarding state before accepting the new canonical mapping.
3. Retained session-derived actor identity, service-role-only RPC boundaries, pending group invitations, invitee-only acceptance, reciprocal block checks, privacy-limited own-profile sharing and no-store member directory behavior.
4. Re-ran the existing Phase 4 identity, community and messaging source gates and profile identity snapshot gate.
5. Revalidated the existing session-store fail-closed behavior and retained the atomic session-cap feature flag as opt-in only.
6. Revalidated that group invitees do not become conversation members until their own authenticated acceptance.
7. Revalidated that group invitation inbox/response routes are session-bound, rate-limited and private no-store.
8. Revalidated that contact sharing can only expose the authenticated actor's public profile, not phone/email or arbitrary target profiles.
9. Revalidated that the community member directory respects private-community membership and profile visibility.
10. Bumped package, lockfile, app release and manifest to `0.338.151` and synchronized current-candidate documentation.

## Verification

- Phase 4 identity/authentication source contract: 16/16 PASS.
- Phase 4 identity integration: 17/17 PASS.
- Coordinated Phase 4 identity/community/messaging contract: 32/32 PASS.
- Profile identity snapshot: 8/8 PASS.
- RUN341 identity lifecycle runtime regression: executed under Node 22 experimental TypeScript stripping; result recorded in the run output.

These checks are source-only verification scope and do not establish PostgreSQL migration execution, cross-account device acceptance or production build readiness. Node.js 24.15.0 is required for dependency-backed typecheck, lint and production build; the current workspace has Node.js 22.16.0.

## Phase 3 status and safety

Phase 3 remains **operationally blocked**, not falsely closed: PostgreSQL 17 rehearsal, Testnet migration-effect reconciliation, financial retry/concurrency testing, Node 24.15.x build verification and multi-account acceptance remain outstanding. Phase 4 source work is authorized to proceed in parallel by the user's instruction; this does not approve production deployment or Mainnet.

No Testnet DDL, migration-history repair, financial operation, GitHub push, Vercel deployment or Mainnet change occurred. The last user-designated accepted baseline remains `0.338.139`; this candidate is not yet accepted.
