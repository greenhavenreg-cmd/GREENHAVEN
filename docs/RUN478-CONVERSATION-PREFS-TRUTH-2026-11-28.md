# RUN478 — conversation preference and restrict write truth

**Baseline:** RUN477. Source candidate only — NOT APPROVED for production. No migration, economics or layout change.

## Findings and fixes
1. **Pin, archive and mute looked saved when the server rejected them.** The three conversation-preference writes applied the change locally, sent the durable PATCH and never read the response, so a 400, 429 or 503 left the list showing a setting that reverted on reload or on another device. They now share one helper, `persistConversationPrefs`: a rejected response rolls the local change back and fails the mutation with a user-safe message (429, auth and generic variants). A network failure or timeout keeps the existing local-first behaviour. The request is bounded to 10 seconds and sends the session.
2. **Restrict and unrestrict ignored the server answer.** The relationship action never read the `/api/social/restricts` response, inside a catch that discards everything. A rejected response now raises the shared error toast (`ghc:toast`, already handled by the app shell). Follow, block and mute already go through the social client and are unchanged.

## Verification
`check-run478-conversation-prefs-truth.mjs` (8 checks) passes and the full `verify:static` suite is run on this bundle. No runtime test covers the helper because it is module-private and the messaging domain needs the browser identity service; behaviour is pinned statically. Not run: typecheck, lint, build, browser, live Testnet.

## Not done
Remaining client mutations with unchecked responses were found and left alone because they are intentionally fire-and-forget or already guarded: logout, analytics and pioneer-activity beacons, onboarding-complete, matured-hold claim in the wallet refresh (the wallet re-reads authority afterwards), and the payment-intent cancel beacon. Challenge cancel-after-failed-publish and community role updates still deserve a response check. UI, layout and design work remains open and needs a build environment.
