# Upgrade worklog — GreenHaven 0.338.145 / RUN432 Phase 2 Community creation draft recovery

**Date:** 26 November 2026  
**Parent candidate:** `0.338.144` / RUN431  
**Accepted source archive:** `GREENHAVEN-0.338.139-RUN426-PHASE0-SOCIAL-EXPERIENCE-FOUNDATION-2026-11-26.zip`

## Implementation sequence

1. Audited the four-step Community creation modal and its submission/idempotency lifecycle.
2. Confirmed form values and create identity were held only in component state/ref and were lost on unmount/reload.
3. Added a pure account-scoped draft normalizer and storage adapter.
4. Bounded draft age, serialized size, field lengths, rules and invitee count.
5. Excluded transient `blob:` and `data:` cover previews from persistence.
6. Restored wizard step, fee rail and form state for the same account.
7. Persisted the stable create idempotency identity before submission for retry continuity.
8. Kept payment confirmation out of local storage and required the existing server flow to re-confirm it.
9. Preserved drafts on failure and cleared them only after confirmed successful creation.
10. Registered source and runtime tests in static verification and prebuild.

## Verification

RUN432 source contract: **11/11 PASS**; helper runtime assertions: **18/18 PASS**. Full static verification is source-level verification only. The required Node.js 24.15.0 runtime is not installed locally (available Node is 22.16.0) and `node_modules` is absent; dependency-backed typecheck, lint and production build remain blocked.

## Release boundary

`0.338.145` is a source-only candidate. The last user-designated accepted archive remains `0.338.139`. No live database mutation, migration application, payment operation, GitHub push, Vercel deployment or Mainnet action occurred.
