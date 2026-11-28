# RUN494 — Notification bell "Mark all read" truth

**Baseline:** RUN493. Source candidate only — NOT APPROVED for production. No migration, economics, ledger, authentication or API change.

## Findings and fixes
1. **App badge cleared even when the server write failed.** The bell always dispatched `ghc:notifications-read`, and the app shell answers that by zeroing the section attention badge. After a failed mark-all the unread alerts were still unread on the server, but the navigation badge showed none. The event now fires only after every store confirms; on failure the bell dispatches `ghc:notifications-changed` so the shell re-polls the real count, and shows an error toast.
2. **Premature "unread: 0" broadcast removed.** It was sent before any server answer and made other listeners refresh against stores still being written.
3. **No single-flight.** Tapping "Mark all read" repeatedly sent duplicate writes to four stores. The action is now single-flight and the button is disabled with `aria-busy` while saving.

## Verification
`scripts/check-run494-notification-mark-all-truth.mjs` (6 checks), a native-TypeScript syntax pass over every file edited in RUN492–494, and the full `verify:static` suite. Not run: typecheck against dependencies, lint, build, browser/device testing (dependencies are not installed in this environment).
