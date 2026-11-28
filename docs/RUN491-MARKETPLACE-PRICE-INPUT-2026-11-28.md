# RUN491 — comma-decimal marketplace price fields

**Baseline:** RUN490. Source candidate only — NOT APPROVED for production. No migration, economics, ledger, authentication or API change.

## Finding and fix
RUN471 fixed Withdraw Pi, Send GHC and Request GHC, where a comma-decimal keypad turned `1,5` into `15`. The marketplace had the same defect in three more money fields: the seller's base listing price and the buyer's minimum and maximum price filters each stripped everything except digits and ".", so a seller on a comma-locale phone who typed `1,5` listed an item at 15 (a 10× overprice), and a filter of `2,5` searched for 25.

All three now use the shared `sanitizeAmountInput` from `lib/wallet/amount-input.ts`, capped at 8 decimals to match `MAX_PRICE_DECIMALS` in the listings API (previously the client allowed unlimited decimals and the server rejected them with `PRICE_PRECISION`). The server still validates every price; the listing submit path and filter query are unchanged.

## Verification
`check-run491-marketplace-price-input.mjs` (6 checks), the existing RUN471 sanitiser behaviour test and the full `verify:static` suite pass. Not run: typecheck, lint, build, device keypad testing.

## Not done
SKU variant prices are entered in a text block and parsed on submit; they were not changed here.
