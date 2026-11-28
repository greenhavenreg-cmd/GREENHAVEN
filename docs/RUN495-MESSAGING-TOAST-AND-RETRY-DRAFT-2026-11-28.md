# RUN495 — Messaging failure toasts and retry draft safety

**Baseline:** RUN494. Source candidate only — NOT APPROVED for production. No migration, economics, ledger, authentication or API change.

## Findings and fixes
1. **Failure toasts rendered as neutral info.** Six messaging toasts (voice-note unsupported/recording/upload/failed, attachment validation) sent `tone: "warning"`, but the app's `ghc:toast` listener reads only `type` (success | error | info) and defaults anything else to info. A failed voice-note upload looked like a notice, not an error. They now send `type: "error"`.
2. **Retrying a failed message could erase what the person was typing.** If a retry was not confirmed or threw, the handler wrote the failed text into the composer unconditionally. The failed text is now restored only when the composer is empty.

## Verification
`scripts/check-run495-messaging-toast-and-retry-draft.mjs` (5 checks), native-TypeScript syntax pass on the edited file, and the full `verify:static` suite. Not run: typecheck against dependencies, lint, build, browser/device testing (dependencies are not installed in this environment).
