# Upgrade worklog — GreenHaven 0.338.141 / RUN428 Phase 1B

**Date:** 26 November 2026  
**Parent:** 0.338.140 / RUN427 Phase 1A  
**Source baseline:** 0.338.139 / RUN426 Phase 0 archive  
**Scope:** Community directory/workspace completion increment and cross-domain Phase 1 contract verification.

## Implemented

- Added a dedicated Invitations directory using explicit invitation state from the existing community conversation/domain projection.
- Kept invitation status separate from Discover. Discover now shows only `discoverable` and `pending` community states; invited communities are listed in Invitations and keep the existing accept/decline actions.
- Added a dedicated Resources tab to the existing community hub, reusing the existing `community.resources` projection and `PinnedResourceCard` component.
- Preserved the existing My and Managed views, role-derived management filter, authenticated membership enrichment and server-side authorization.
- Added RUN428 source-contract checks across Community, Messages, Discovery, Connections and notification deep links; registered the gate in `verify:static` and as `npm run check:run428-phase1-social-connections`.
- Bumped package, lockfile and app release metadata to `0.338.141`.

## Implementation sequence

1. Re-opened the exact RUN426 archive derivative and preserved it as the only project baseline.
2. Audited existing community directory, membership, invitation, role and platform APIs before adding UI.
3. Added the Managed directory using canonical creator identity and viewer roles.
4. Added a distinct Invitations view over explicit existing invitation state.
5. Removed invited rows from ordinary Discover results while retaining pending requests as visible status rows.
6. Added the dedicated Resources destination using the existing platform projection and resource card.
7. Audited the existing Messages inbox, durable store, membership authorization and idempotency path.
8. Audited the existing offline message queue and reconnect flush integration.
9. Audited Discovery candidate filtering, privacy projection and connection request lifecycle.
10. Added cross-domain Community/Messages/Discovery/Connections/notification source-contract coverage.
11. Restored the credential-free Testnet `.env.example` template with privileged credentials blank and payout/A2U controls disabled.
12. Synchronized package, lockfile, release identity, manifest and current candidate documentation.

## Targeted verification

**Source-level verification scope:** static/source-contract checks only; these are not runtime or live-service acceptance evidence.

- RUN426: 15/15 PASS.
- RUN427: 11/11 PASS.
- RUN428: 20/20 PASS.
- Changed TSX parser check: no syntax diagnostics.
- Changed `.mjs` scripts: `node --check` passes.
- Package JSON parses; package, lockfile root and app release version are synchronized.

## Remaining work before Phase 1 acceptance

- Community invitations are **not yet a durable multi-device contract**. Existing `gh_community_members.status` has no `invited` value, and the current community schema has no dedicated invitation relation. The directory currently reflects explicit `invitedMembers` values in the existing conversation/domain projection only. Complete durable invite delivery/accept/decline with an additive, reviewed migration/RPC, then wire the existing UI to that authoritative contract.
- Audit creation draft persistence, idempotent retry and upload recovery end-to-end.
- Complete two-account community lifecycle tests: public join, approval request/decision, invitation accept/decline, role change, removal/ban, privacy boundaries and member/resource visibility.
- Complete two-account and multi-device messaging tests for request decisions, blocked/privacy denial, delivery/read receipts, attachment access, offline queue/reconnect and duplicate retry.
- Complete two-account Discovery/connection tests for filters, self/blocked/connected exclusions, request/accept/decline, privacy opt-outs and deep links.
- Verify unread/notification consistency and every deep-link authorization path in a running environment.
- Run Node 24.15.0 dependency-backed typecheck, lint, production build and mobile/device acceptance.

## Environment and safety boundaries

- The available environment has Node 22.16.0, while the project engine requires `^24.15.0`; dependencies are not installed. Static verification passed on the available runtime, but this does not replace supported-runtime typecheck, lint or build.
- Supabase CLI is unavailable in the extracted workspace. No migration was created or applied; no live database mutation was attempted.
- Full `npm run verify:static` now passes RUN337 and RUN300; it currently stops at RUN301 due stale release metadata/worklog assertions, which are being reconciled in this candidate.
- No Pi/GHC/wallet/payment/payout/settlement changes, no GitHub push, no Vercel deployment and no Mainnet activation.

**Status:** `0.338.141` is an implementation candidate, not a Phase 1 acceptance release. Keep `0.338.139` as the accepted source of truth until outstanding database, runtime and end-to-end gates pass and the user accepts the candidate.
