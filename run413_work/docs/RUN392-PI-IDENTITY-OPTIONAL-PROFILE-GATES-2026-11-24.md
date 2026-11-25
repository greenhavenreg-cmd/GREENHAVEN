# RUN392 — Pi Identity Synchronization, Wallet Consent Boundary & Optional Profile Gates

**Release:** GreenHaven 0.338.114  
**Base:** GreenHaven 0.338.113 (RUN391)  
**Date:** 2026-11-24

## Phase 3 — Pi identity and wallet authorization

- The Pi authentication route already verifies the access token against Pi `/v2/me` and persists the canonical Pi UID and verified Pi username in `gh_pi_identities`.
- This release synchronizes that verified Pi username into the canonical GreenHaven profile's `username` field on successful authentication.
- A user's existing display name is preserved; the Pi username is used as the display name only when no display name exists.
- Profile projection synchronization is best-effort and cannot block a valid Pi identity/session. Failures emit token-free diagnostic codes.
- The existing wallet authorization path is retained: the user must explicitly consent, a fresh Pi token is verified server-side, the Pi UID must match the durable GH identity mapping, and the authorization is read back from the database.
- Wallet authorization is deliberately NOT silently granted during ordinary login. The existing payout authorization card invokes the consent flow only after the user confirms consent. A wallet address is not treated as proof of ownership merely because it was submitted by the client.
- Withdrawal authorization and destination verification remain feature-specific gates. Normal application access does not require a payout wallet.

## Phase 4 — Optional profile completion

- The legacy `getOnboardingProfileGaps` export remains for compatibility, but no longer classifies optional profile fields as general account-access requirements.
- Age, gender, location, interests, connection intents and profile photos remain available for profile enrichment. They are not a universal registration/access gate.
- Feature-specific eligibility, safety, age and financial requirements must continue to be enforced at the relevant feature boundary.
- The authenticated onboarding completion endpoint remains identity-backed and does not accept client-supplied ownership IDs.

## Verification performed

- RUN392 identity sync / optional profile / wallet consent contract: PASS (14 assertions).
- RUN391 identity/onboarding gate contract: PASS (12 assertions).
- RUN296 progressive onboarding registration contract: PASS (12 assertions).

## Not verified

- Full TypeScript check, lint and production build were not run. This runtime is Node 22.16.0 and the project requires Node 24.15.0 or newer; dependencies are not installed in this environment.
- Live Pi Browser consent, Pi Platform `/v2/me` scope evidence, Supabase persistence and real withdrawal destination verification require Testnet operator verification.
- No live database, bucket, or wallet authorization records were modified by this source-only release.
