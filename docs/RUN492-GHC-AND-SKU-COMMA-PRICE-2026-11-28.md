# RUN492 — GHC withdrawal and SKU variant comma-decimal prices

**Baseline:** RUN491. Source candidate only — NOT APPROVED for production. No migration, economics, ledger, authentication or API change.

## Findings and fixes
1. **GHC withdrawal amount (money, 10x).** `parseGhcInput` removed every comma before parsing, and the Withdraw GHC panel let commas through, so a comma-decimal keypad typing `1,5` produced 15 GHC. RUN471 fixed Pi/Send/Request but missed this panel. The panel now uses `sanitizeAmountInput(…, GHC_INPUT_DECIMALS)`, and `parseGhcInput` routes commas through the same sanitiser (lone comma = decimal; repeated = grouping). Exponent, signs and letters are still rejected as INVALID. The server still validates and the ledger stays authoritative; the confirmation amount shown is the parsed value.
2. **SKU variant prices.** A seller typing `2,5` made the whole variants form fail with no explanation. `normalizeVariantPrice` accepts a single comma followed by 1–8 digits as a decimal. `1,000` is ambiguous (1 or 1000) and is rejected rather than guessed, as are multiple commas and comma-with-dot.

## Verification
`scripts/test-run492-ghc-and-sku-comma-price.mjs` (8 checks), `test-wallet-amount-helpers.mjs` (20/20) and the RUN471 sanitiser test. Not run: typecheck, lint, build, device keypad testing (dependencies are not installed in this environment).
