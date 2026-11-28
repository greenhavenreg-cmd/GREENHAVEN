# RUN508 — Secure idempotency keys and real comment reactions

**Package:** `gh-connect@0.338.177`
**Date:** 28 November 2026
**Scope:** Client request-identity generation and one comment-reaction control. Source candidate; production NOT APPROVED.

## Findings

1. **Weak idempotency fallback.** Nine client surfaces built request identities (Pi/GHC withdrawal, marketplace checkout and cart checkout, premium messaging purchase, utility spend, account deletion, post/story publish, contact-share and group-create) with `crypto.randomUUID()` and, when unavailable, `Date.now()` plus `Math.random()`. Predictable keys weaken duplicate-submission protection on money and publish paths.
2. **Fake reaction control.** The comment "Add reaction" button chose a random emoji for the person. It was also only rendered once a comment already had reactions, so a first reaction could not be added from that control.
3. **Pi amount parser disagreed with the GHC parser.** `parsePiInput` stripped every comma, so comma-keypad input became a much larger Pi amount (`1,5` → 15 Pi, `1,50` → 150 Pi, `1.000,50` → 1.0005 Pi). The withdraw field sanitises on typing, which masked this, but the parser is the final money-parse gate and RUN471 had only fixed the GHC side.
4. **Baseline regression.** The RUN507 document was not registered in `scripts/check-doc-hygiene.mjs`, so `npm run verify:static` failed in the delivered bundle even though the README reported it as passing.

## Repair

- All nine sites now use `secureUUID()` from `lib/secure-id.ts`, which uses Web Crypto and fails closed (`SECURE_RANDOM_UNAVAILABLE`) rather than degrading to `Math.random()`.
- `CommentReactions` shows an accessible picker (`aria-expanded`, `aria-haspopup`, labelled choices, Escape to close). The person picks the emoji. The control renders whenever a reaction handler exists.
- `parsePiInput` now shares the RUN471 comma-decimal rule with `parseGhcInput`, so both parsers return identical values for every comma form (`1,5` → 1.5, `1.000,50` → 1000.5). The legacy test that asserted comma-stripping (`1,000` → 1000 Pi) was replaced with tests for the shared rule and a parser-agreement test. The server remains the sole authority and still re-validates every amount.
- Registered RUN507 and RUN508 in documentation hygiene; added `scripts/check-run508-secure-idempotency-and-reactions.mjs` and `scripts/test-wallet-amount-helpers.mjs` (23 checks) to `verify:static`.

## Safety boundary

No server route, SQL, migration, ledger, fee, withdrawal, reward, membership, referral or curation logic changed. Idempotency key shape and prefixes are unchanged; only the entropy source is stricter. No live database, provider, Git or deployment action occurred.

## Verification

`npm run verify:static` passes in this workspace (Node 22.23.5; project requires `^24.15.0`; dependencies not installed). Typecheck, lint, production build and browser/Testnet acceptance were **not** run.
