# RUN481 — global search no longer reports "No results" while loading or after a failure

**Baseline:** RUN480. Source candidate only — NOT APPROVED for production. No migration, economics or ranking change.

## Findings and fixes
1. **"No results" appeared while the server search was still running.** Global search shows local matches immediately and fetches the server search after a 220 ms debounce. Until the response arrived, any query without a local match rendered "No results for …" and the summary card "No visible matches yet", then the list replaced it. Search now tracks an explicit server state (idle, loading, ready, failed): while loading it shows a polite "Searching…" status and "Searching GreenHaven…" in the summary card.
2. **A failed server search looked like an empty result.** A 4xx/5xx, a non-durable response or a network error only flipped an internal flag, so the member saw "No results" and could conclude nobody matched. A failed search with no local match now shows an alert, "Search is unavailable right now", says nothing on this device matches and that this is not the same as no results, and offers "Try again" (re-runs the request). Local matches still show when they exist.
3. **Aborted requests can no longer write state.** The body read after an abort was swallowed into an empty object, which then marked the search as failed. The effect now returns as soon as its request was aborted.

## Unchanged on purpose
Local filtering, block/mute rules, privacy copy, tabs, recent searches and the server contract are untouched.

## Verification
`check-run481-search-status-truth.mjs` (10 checks) passes and the full `verify:static` suite is run on this bundle. The edited file parses. Not run: typecheck, lint, build, browser (the loading, failed and empty states have not been seen rendered), live Testnet.

## Not done
No visual review, i18n of the new strings (they are English literals like the neighbouring search copy), or debounce/ranking changes. UI, layout and design work elsewhere remains open and needs a build environment.
