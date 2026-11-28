# RUN483 — failed list loads no longer read as "none" (achievements, communities, profile listings)

**Baseline:** RUN482. Source candidate only — NOT APPROVED for production. No migration, economics, ledger or authentication-policy change.

## Findings and fixes
1. **Rewards achievements:** a failed or rejected server load left the tab saying "No achievements unlocked / 0 achievements". It now sets `achievementsLoadFailed`, shows an alert ("Your achievements could not be loaded. This does not mean none are unlocked. Your balance is unaffected.") with Try again (reusing `achievementRefreshTick`), and the count line reads "Achievements could not be loaded". The account-switch wipe is unchanged.
2. **Community directory:** a failed first-page refresh (including the 15 s section refresh) emptied the list. The list is now kept only when the failed request has the same identity, tab, category and search as the last successful first-page load (`directoryGoodKeyRef`), and the error says it may be out of date. A different query or identity still clears, so one query's rows never appear under another.
3. **Profile listings:** a failed load showed "No listings yet". It now keeps the last list, shows an alert with Try again, and hides the empty state. Listings are cleared when the session identity changes so a retained list cannot cross accounts.

## Reviewed, no change needed
Membership lifecycle history already has an `unavailable` state; the feed topic/not-interested preference catches read device storage, not the network.

## Verification
`check-run483-list-failure-truth.mjs` (14 checks) passes. Not run: typecheck, lint, build, browser (the new alerts have not been seen rendered), live Testnet.

## Not done
Creator-studio data quality; remaining list screens not audited here; UI/layout work that needs a build environment.
