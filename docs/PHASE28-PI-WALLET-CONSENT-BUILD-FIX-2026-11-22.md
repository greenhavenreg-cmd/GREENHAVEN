# GH-CONNECT 0.338.112 — Phase 28 Pi wallet-consent build repair

## Reported failure
`check-phase28-wallet-consent-flow.mjs` failed its slow Pi Browser handshake assertion
(45/46). The prebuild runner stopped at check 284/413.

## Root cause
The Pi authentication provider's SDK/bootstrap error branch did not explicitly preserve
an in-Pi connecting/retry message for all reliable Pi host signals. It could fall back
to generic error copy while the Pi Browser bridge was still initializing.

## Repair
`contexts/pi-auth-context.tsx` now identifies an in-Pi host using the Pi Sandbox frame,
Pi-like user-agent/referrer detection, or the injected Pi SDK bridge. During SDK
initialization/bootstrap failures it displays a connecting/retry message. It does not
start authentication automatically. `Pi.authenticate` remains restricted to an explicit
user gesture.

The Phase 28 static regression assertion now verifies the actual error-handling branch
and all three host signals.

## Preserved safeguards
- Pi Platform remains authoritative for verified UID and wallet address.
- Browser SDK wallet address remains comparison-only.
- Access tokens are not persisted or logged server-side.
- Server-side Pi token verification and wallet-scope proof remain mandatory.
- Wallet authorization remains explicit-consent-only and service-role protected.
- Withdrawal quote authorization, PIN fail-closed behavior, fees, payout execution
  restrictions, Testnet-only safeguards, Mainnet and Production configuration are
  unchanged.

## Verification performed
- Phase 28 wallet consent: 46/46.
- RUN382 explicit-gesture/SDK receiver: 9/9.
- RUN353 Pi auth root-cause regression: 16/16.
- Prebuild manifest dry-run: 413/413 commands discovered.
- Phase 28 test script syntax: passed.

The complete 413-check execution, TypeScript check, lint and Next.js production build
were not run in this environment. The project requires Node `^24.15.0`; the available
runtime for this package preparation was Node 22.16.0. Run the full gates with the
declared Node version before pushing.
