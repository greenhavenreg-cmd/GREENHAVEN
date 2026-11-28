# RUN497 — No contradictory success toasts after failed actions

**Baseline:** RUN496. Source candidate only — NOT APPROVED for production. No migration, economics, ledger, authentication or API change.

## Finding and fixes
Several context actions (`unblockUser`, `reportContent`, `muteConversation`, `unmuteConversation`) catch their own failures, show their own success or error toast and resolve normally. Three callers wrapped them in `try { await action(); toast success } catch { toast error }`, which is wrong because the action never throws on a rejected write: after a failed unblock/report/mute the person saw the context's error toast and then a second, contradictory "success" toast; after a success they saw the message twice.

- Settings → Blocked users: removed the second "User unblocked".
- Comment report: removed the second "Report submitted for review".
- Community mute/unmute: removed the second "Community muted/unmuted".

Each caller keeps its catch for an unexpected throw. A repo-wide scan of every context action that toasts success followed by a caller toasting success again found only these three sites.

## Not done
The context actions still resolve with no value, so callers cannot branch on success. Returning a boolean from them is the follow-up for flows that need to close a dialog only on success.

## Verification
`scripts/check-run497-no-contradictory-success-toasts.mjs` (5 checks), native-TypeScript syntax pass on the edited files, and the full `verify:static` suite. Not run: typecheck against dependencies, lint, build, browser testing.
