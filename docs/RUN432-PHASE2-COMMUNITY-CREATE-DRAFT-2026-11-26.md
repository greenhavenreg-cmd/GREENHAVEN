# RUN432 — Phase 2 Community creation draft recovery

**Date:** 26 November 2026  
**Candidate:** `gh-connect@0.338.145`  
**Parent candidate:** `0.338.144` / RUN431  
**Accepted source archive:** `GREENHAVEN-0.338.139-RUN426-PHASE0-SOCIAL-EXPERIENCE-FOUNDATION-2026-11-26.zip`

## Audit finding

The Community creation wizard kept form state and its generated create identity only in component memory. Closing the modal or reloading the app discarded the draft. This was particularly fragile after a payment/create attempt because the form retained its values only while the component stayed mounted.

## Implementation

- Added a bounded, account-scoped device-local draft store for the existing four-step creation wizard.
- Restores the current step, form fields, selected fee rail and stable create idempotency identity after close/reopen or reload.
- Persists only durable cover references; `blob:` and `data:` previews are excluded.
- Expires drafts after 30 days and caps serialized size, invited members and rule counts.
- Does not restore `feePaymentConfirmed`; the server/payment flow must re-confirm payment state.
- Retains the draft on failed creation/retry and clears it only after the parent confirms successful durable creation.
- Adds an explicit discard action for restored drafts.
- Adds 11 source-contract checks and 18 runtime helper assertions, registered in static verification and prebuild.

## Verification

- RUN432 helper runtime assertions: **18/18 PASS**.
- RUN432 creation-flow source contract: **11/11 PASS**.
- Full static suite and prebuild dry-run are rerun for the 0.338.145 candidate.

## Boundaries

Drafts remain device-local and account-scoped; they are not represented as cross-device synchronized. Payment confirmation is never trusted from browser storage. No new database table, RPC or migration was added. No live database, payment, Pi, GHC, wallet, membership, GitHub or Vercel operation occurred.
