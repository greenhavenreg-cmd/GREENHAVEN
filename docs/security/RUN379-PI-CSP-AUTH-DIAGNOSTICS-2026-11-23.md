# RUN379 — Pi authentication CSP diagnostics (2026-11-23)

## Purpose

The RUN378 Testnet attempt still rejects inside `Pi.authenticate()` before GreenHaven's `/api/auth/pi` boundary. RUN379 adds evidence collection only; it does not claim CSP is the cause.

## Changes

- Records the requested Pi scopes (`username`, `payments`, and/or `wallet_address`) in token-free authentication diagnostics.
- Captures browser `securitypolicyviolation` events and records only the effective directive, blocked hostname (or `inline`/`eval` marker), and enforce/report disposition.
- Adds a concise `cspViolations=` line to the copyable Pi auth report.
- Preserves the RUN378 single sign-in call, Pi initialization, server-side `/v2/me` verification, durable identity/session flow, and existing CSP enforcement policy.

## Security and test boundaries

- No access tokens, usernames, UIDs, cookies, full blocked URLs, paths, query strings, or raw CSP event objects are recorded.
- `vercel.json` CSP is unchanged. Do not switch to Report-Only unless RUN379 produces no enforced CSP violations and a controlled Testnet-only comparison is approved.
- A CSP violation is evidence of a browser policy block, but not every CSP violation necessarily explains the authentication rejection; correlate its directive/host and timestamp with the Pi prompt.
- Static source checks do not prove Pi Browser runtime success. Retest once in Testnet Preview and inspect the new `scopes=` diagnostics plus `cspViolations=` output.
