# Run 400 — Welcome and Pi sign-in UX

## Scope

Source-only, non-destructive update based on the Run 398 derivative. The welcome page keeps the GreenHaven brand and existing authentication provider while presenting a single primary sign-in action.

## Changes

- Primary action label is `Sign in`; no simultaneous `Sign in with Pi` and `Retry Pi authentication` buttons.
- The primary action uses a fingerprint-inspired visual mark, elevated gold gradient, and clear secure-connection caption. This is a visual affordance only; it does not claim biometric verification.
- After an attempt, the same action changes to `Try again`; while busy it shows a spinner and prevents repeated submissions.
- The user-facing status copy is calm and does not expose the raw `Pi Sandbox is ready` diagnostic string. Detailed diagnostics remain available on demand.
- Existing Pi SDK reinitialization and ordinary-browser OAuth behavior remain the authentication mechanisms.

## PI reward safety

The existing 100 PI Testnet cumulative registration campaign remains fail-closed behind the feature flag, Testnet environment, approved migration and ledger status. No UI-only balance change, automatic unverified credit, migration application, or payout was performed in this run. Run 399 migration reconciliation remains a blocker to safe campaign activation. A valid reward must be ledger-backed and included in the actual available PI balance before withdrawal is allowed.

## Verification

- `check-run344-pi-auth-diagnostics-ux.mjs`: 10/10 passed.
- `check-run398-referral-session-isolation.mjs`: 8/8 passed.
- Full dependency-backed build, TypeScript/lint, browser/device tests, live Supabase migration verification and Pi Testnet withdrawal acceptance were not performed in this run.
