# RUN506 — Direct-call control state and accessibility

**Release:** `gh-connect@0.338.177`  
**Date:** 28 November 2026  
**Scope:** Client-side direct-call sheet only.

## Problem

The direct-call sheet stored microphone-muted and camera-disabled UI state in component state. That state was not explicitly reset when a different call session replaced the previous session. A subsequent call could therefore display stale toggle labels/icons even though the new media tracks start with their own default state.

## Implementation

- Reset microphone and camera UI state whenever `session.callId` changes.
- Expose the current microphone and camera toggle states through `aria-pressed`.
- Announce call phase changes through a polite, atomic status live region.
- Preserve the existing server-authorized call signaling, media acquisition, call policy, and hangup flow.

## Verification

`check-run506-direct-call-control-state.mjs` asserts the per-call reset, accessible toggle state, and live-region semantics. It is registered in both `verify:static` and `prebuild:checks`.

## Safety boundary

No API route, database schema, SQL migration, Pi integration, GHC ledger, payment, withdrawal, membership, referral, reward or curation settlement logic was changed. This change does not certify live call transport or production readiness.
