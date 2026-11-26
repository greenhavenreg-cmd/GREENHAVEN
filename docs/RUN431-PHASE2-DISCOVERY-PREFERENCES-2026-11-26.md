# RUN431 — Phase 2 Discovery preferences integration

**Date:** 26 November 2026  
**Candidate:** `gh-connect@0.338.144`  
**Parent candidate:** `0.338.143` / RUN430  
**Accepted source archive:** `GREENHAVEN-0.338.139-RUN426-PHASE0-SOCIAL-EXPERIENCE-FOUNDATION-2026-11-26.zip`  
**Scope:** Discover connection-intent persistence and feedback.  
**Network:** Pi Testnet only; Mainnet unchanged.

## Audit finding

The Discover screen previously changed its selected connection intents and wrote only to account-keyed browser storage. The server profile contract already contained `connection_intents`, and the canonical `updateProfile` operation already persisted social profile fields through the authenticated `/api/profile/me` route. The Discovery context did not expose that operation or its shared toast action. Consequently, preferences could appear changed on one device without using the existing account-level profile persistence path, and discovery feedback calls had no supplied toast action.

## Implementation

- Exposed the existing `updateProfile` and `addToast` actions through `GHCDiscoveryContext` and its provider value, with complete memo dependencies.
- Discover now sends connection-intent changes through the canonical authenticated profile update path.
- Success feedback is shown only when the profile update confirms success. If the profile update is queued or not confirmed, the screen explicitly says server confirmation is pending rather than claiming a durable save.
- Retained account-keyed local storage as a compatibility/convenience mirror; added `saveConnectionIntentsWithStatus` to report actual browser-storage persistence while preserving the legacy helper contract.
- Added `scripts/check-run431-phase2-discovery-preferences.mjs` and registered it in both `verify:static` and `prebuild:checks`.

## Verification

- RUN431 contract: **9/9 PASS** at initial focused run.
- The full static suite and remaining social suites are being rerun for this candidate.
- No dependency-backed TypeScript build is claimed until Node 24.15.x and dependencies are available.

## Boundaries

No new table, RPC or migration was added. No live Supabase data or schema was changed. No invitations were applied, no notifications were sent, and no Pi, GHC, wallet, membership or financial behaviour was changed. No GitHub push, Vercel deployment or Mainnet action occurred.

## Remaining acceptance

The five-stage Community/Messaging/Discovery transformation still requires full two-account and multi-device acceptance, live authorization/realtime checks, mobile browser validation, supported-runtime typecheck/lint/build and completion of Phase 1's RUN429 disposable-PostgreSQL/Testnet migration gates. This source increment is not a production-ready completion claim.
