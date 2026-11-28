# RUN499 — Sheet close-button touch targets (2026-11-28)

**Baseline:** RUN498. Production NOT APPROVED.

## Defect
Eleven sheets and dialogs, including the money flows (send, receive, request GHC, payment and transaction details, requests panel), share, search, report and post sheets, used a `rounded-full p-2` close button around an 18–19px icon. That is about 34px, below the 44px minimum the rest of the app uses, and easy to miss on a phone.

## Change
Each close button is now `h-11 w-11` (44px) with `-m-1.5` so header height and alignment are unchanged, `shrink-0` so it never squashes, and the same hover style. Accessible names, handlers and in-flight guards are untouched.

## Not changed
No behaviour, financial, API, storage or migration change.

## Verification
`scripts/check-run499-close-button-touch-targets.mjs` 12/12; full `verify:static` passes. Typecheck, lint, build and browser/device visual review were not run in this environment and remain outstanding.
