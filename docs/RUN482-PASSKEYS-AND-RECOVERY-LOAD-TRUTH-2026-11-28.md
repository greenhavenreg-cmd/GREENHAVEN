# RUN482 — failed loads no longer read as "none" (passkeys, payment recovery banner)

**Baseline:** RUN481. Source candidate only — NOT APPROVED for production. No migration, economics or authentication-policy change.

## Findings and fixes
1. **Passkeys list: a failed load said "No passkeys registered."** `PasskeysPanel` set the list to empty on any non-ok response or network error. A member whose passkeys exist but whose request failed (session lapse, outage) saw "No passkeys registered", lost the Verify (step-up) button and could register duplicates or distrust their security setup. The list now has an explicit `loadFailed` flag: a failure never wipes the last known list. With nothing known it shows an alert ("Your passkeys could not be loaded. This does not mean none are registered.") with Try again; with a known list it keeps showing it and notes that it may be out of date. "No passkeys registered." only renders after a successful load.
2. **Payment recovery banner: a failed refresh hid pending recoveries.** `PaymentRecoveryBanner` re-reads status on mount, on `ghc:payment-recovered` and on `ghc:wallet-refresh`, and emptied its items on any failure, so a transient error removed the prompt for a payment that still needed recovery. It now keeps the last confirmed items when a refresh fails and only replaces them with a successful answer.

## Trade-off to review
After a recovery completes, if the following refresh fails, the banner can keep showing the completed item until the next successful read. Recovery requests remain server-validated and idempotent, so this cannot move money twice; it can only show a stale prompt.

## Unchanged on purpose
Register, revoke and step-up flows, WebAuthn calls, the recovery panel (which already shows a network-error note), the notification bell (its catch guards a local in-memory read, not a network call) and the GH Pay orders list (local read).

## Verification
`check-run482-passkeys-load-truth.mjs` (9 checks across both components) passes and the full `verify:static` suite is run on this bundle. Edited files parse. Not run: typecheck, lint, build, browser (the new alert states have not been seen rendered), live Testnet.

## Not done
Other list screens that blank on failure were not changed: communities directory offset-0 reset, profile listings, rewards server achievements, membership lifecycle history and creator-studio data quality each need a look at whether they already surface an error. UI, layout and design work remains open and needs a build environment.
