# RUN471 — comma-decimal amount input for every money field

**Baseline:** `gh-connect@0.338.173` / RUN461–RUN470. **Status:** source candidate only — NOT APPROVED for production. Version unchanged; no migration, economics, ledger or API change.

## Defect
Withdraw Pi, Send GHC and Request GHC use `inputMode="decimal"`. On phones set to German, French, Spanish, Portuguese and many other locales that keypad shows a **comma**, not a dot. All three fields removed everything except digits and ".", so the comma was silently dropped: `1,5` became `15` (a 10× error on a money amount) and decimals could not be typed at all.

## Change
New `lib/wallet/amount-input.ts` `sanitizeAmountInput(raw, maxDecimals)`, used by all three fields (7 decimals for Pi, 4 for GHC):
- `,` and `.` both act as the decimal separator; a single separator is the decimal.
- Repeated same-type separators are digit grouping (`1,000,000` → `1000000`).
- With both types present, the last is the decimal only when the earlier one is well-formed grouping (`1,234.5`, `1.234,5`); otherwise a second separator typed into a decimal is ignored (`1.5,` → `1.5`), so the value never jumps.
- Extra fraction digits are dropped, never rounded. Letters, signs and exponents are stripped.
The server and ledger still re-validate every amount; the existing exact `parsePiInput` / `parseGhcAmount` parsers and the review step are unchanged.

## Housekeeping
RUN470's doc was not registered in `scripts/check-doc-hygiene.mjs`, so `verify:static` failed on "unclassified documentation" in the RUN470 bundle. Both RUN470 and RUN471 docs are now registered and listed in `docs/INDEX.md`.

## Verification
`npm run verify:static` passes, including `scripts/test-run471-amount-input.mjs` (13 behaviour assertions plus a source contract). Edited files pass a TypeScript **syntax** parse; this is **not** a full typecheck. Not exercised on a device keyboard.

## Still open
Decimal handling is not applied to non-money numeric fields. Rendered review, Node 24 typecheck, lint, build and live Testnet acceptance remain outstanding.
