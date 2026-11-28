# RUN456 — Read-only Impact History Release

**Package:** `gh-connect@0.338.168`  
**Parent candidate:** RUN455 / `0.338.167`  
**Date:** 27 November 2026  
**Scope:** Expose the existing read-only charity contribution summary as a distinct service.

## Implementation

- Added `impact-history` as a separate ACTIVE Ecosystem service with its own focus destination.
- Mounted the existing `CharityImpactScreen` from the Ecosystem directory with back navigation.
- Changed the summary API release check from the broader `charity` service to `impact-history` and scoped its durable rate-limit key accordingly.
- Kept donation-capable `charity`, `causes`, `donations`, and community-project workflows Coming Soon. No payment or donation mutation endpoint was introduced.
- Preserved authenticated user binding, durable rate limiting with deny-on-unavailable behavior, no-store responses, server-confirmed ledger projection, exact BigInt PI formatting, and the non-withdrawable segregated accounting boundary.
- Added a focused RUN456 release contract to both static verification and prebuild checks. Updated package, lockfile, in-app release identity, README, source-of-truth and verified-manifest version metadata.

## Verification

- RUN456 Impact History release contract: 8/8.
- Existing charity impact normalization tests: 19/19.
- Charity release boundary: 14/14.
- RUN455 Events/Services regression contract: 13/13.
- Full static suite: see the verification report; the first run exposed stale version metadata in the existing release-integrity contract, which was corrected before the final run.

## Limits

This release exposes only a read-only history of already-recorded contributions. It does not create a donation flow, accept payment, change charity ledger records, add a migration, or enable withdrawals. No Git push, Vercel deployment, Supabase mutation, provider operation or Mainnet action was performed. Supported-runtime build/typecheck/lint and live browser/Testnet acceptance remain separate release gates.
