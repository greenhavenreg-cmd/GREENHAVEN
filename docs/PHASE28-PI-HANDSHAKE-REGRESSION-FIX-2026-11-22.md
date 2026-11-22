# Phase 28 — slow Pi Browser handshake regression fix

## Defect
The hard-timeout branch previously treated only a Pi-like user agent as proof that
the user was already inside Pi Browser. A Pi sandbox frame or an injected Pi SDK
bridge can identify the host even when the user-agent signal is absent or delayed.
That could produce misleading copy telling an in-Pi user to open Pi Browser.

## Repair
The timeout now treats any of these independent host signals as an in-Pi session:
- `isPiSandboxFrame()`
- `detectPiEnvironment().uaLooksLikePi`
- `detectPiEnvironment().hasWindowPi`

When one is present, the UI remains in a connecting/retry state and does not show
the external-browser-required message. This does not initiate authentication:
`Pi.authenticate` remains reserved for an explicit user gesture.

## Safety
No token persistence, server verification, wallet authorization, quote, PIN,
payout, Mainnet, or Production behavior was changed.

## Regression gate
` scripts/check-phase28-wallet-consent-flow.mjs ` now verifies all three host
signals and the connecting-state message.
