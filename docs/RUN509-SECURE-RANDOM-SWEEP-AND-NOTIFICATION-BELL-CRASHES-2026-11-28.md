# RUN509 — Secure random sweep and notification bell crash fixes

Status: source change only. Production NOT APPROVED. No SQL, ledger, fee, withdrawal or reward logic changed.

## Fixed
1. **Notification bell runtime crashes (found by type-check).**
   - `setDurableOk(unifiedAvailable || ...)` ran before the `const` availability flags were declared (temporal dead zone) and would throw on every durable refresh. The flags are now declared first.
   - `priorDurableItems` was declared inside a `try` block but read in the later async store merge (ReferenceError). It is now declared at the top of `refresh`.
2. **Math.random() removed from application source** (about 70 sites). Everything now uses `lib/secure-id.ts`, which fails closed (`SECURE_RANDOM_UNAVAILABLE`) when Web Crypto is unavailable.
   - Security-sensitive: CSRF token, session salt, Pi OAuth state, direct-call IDs, community invite codes, device IDs, membership purchase-attempt IDs.
   - Money / idempotency: P2P and request transfer references, marketplace order idempotency keys, GH Pay order IDs, ledger and payment IDs, economy notification IDs.
   - Content IDs: posts, stories, comments, polls, listings, communities, verification requests, messages, conversations, shares and similar. Existing ID validators (`^post_…`, `^story_…`, `^call_[a-f0-9]{32}`, idempotency-key charset/length) still accept the new formats.
3. **Fabricated matches removed.** The local matching service in `lib/backend/client-services.ts` returned a random "Match" 30% of the time. It now always reports not matched; matches come only from the server mutual-interest flow.

## Intentionally unchanged
`lib/web-vitals-collector.ts` (sampling) and `lib/accessibility.ts` (DOM description id) keep non-cryptographic randomness.

## Verification
`scripts/check-run509-secure-random-sweep.mjs` is part of `verify:static`. Node 24, a clean install, ESLint, the production build, device acceptance and live Supabase checks are still outstanding release gates.
