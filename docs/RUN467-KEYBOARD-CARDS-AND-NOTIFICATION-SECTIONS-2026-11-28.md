# RUN467 — keyboard-reachable cards and notification list sections

**Baseline:** `gh-connect@0.338.173` / RUN461–RUN466. **Status:** source candidate only — NOT APPROVED for production. Version unchanged; no migration, economics or API change.

## What changed
| Area | Change |
|---|---|
| Shared helper | `lib/ui/activate-keys.ts` (`activatableProps`): role=button, one Tab stop, Enter/Space activation and an accessible name for cards that must stay containers because they hold a nested real button. Key presses from nested controls are ignored. |
| Discovery | Trending cards, Nearby rows and Suggested Creators rows were mouse-only; they are now keyboard activatable. The Nearby message button gained a name and a 44px target. |
| Image fallback | The clickable `LazyImage` placeholder is keyboard activatable when an `onClick` is supplied. |
| Unlabeled controls | Pagination previous/next, the feed bookmark toggle (now `aria-pressed`, 44px target) and profile photo tiles have accessible names. A static scan of every `<button>` in `components`, `features` and `app` finds no other icon-only button without a name. |
| Notification bell | The list has Today / Yesterday / Earlier this week / Earlier section headers (device time zone; skipped in the ranked Priority view) and mounts 30 threads at a time with a Show more control that resets when the tab or filter changes. |
| Settings age range | The Min/Max age fields clamped on every keystroke, so a first digit below 18 jumped to 18 and two-digit ages such as 30 could not be typed. They now keep a local draft, commit on blur or Enter (clamped 18–80 with min ≤ max by the existing handler), resync with the stored value, and use a numeric keyboard. |
| Date helper | `lib/ui/date-buckets.ts` with a boundary test (`scripts/test-run467-date-buckets.mjs`). |
| Contract | `scripts/check-run467-keyboard-cards-and-notification-sections.mjs` in `verify:static` and `prebuild:checks`. |

## Verification
Static only. `tsc --noResolve` finds no syntax errors or undefined names in the edited files; module-resolution errors are expected without dependencies. Behaviour in a browser is unverified.

## Still open
Rendered review at 320–430px, message conversation search and marketplace filters on the combobox pattern, and Node 24 typecheck/lint/build remain outstanding.
