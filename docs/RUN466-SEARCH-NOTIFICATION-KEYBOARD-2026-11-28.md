# RUN466 — Search, notification and filter keyboard model

**Baseline:** `gh-connect@0.338.173` / RUN461–RUN465. **Status:** source candidate only — NOT APPROVED for production. Version unchanged; no migration, economics or API change.

## What changed
| Area | Change |
|---|---|
| Shared tabs helper | `lib/ui/tablist-keys.ts`: ArrowLeft/Right (wrapping), Home, End move focus to the neighbouring `role="tab"` and activate it. |
| Notification bell | Both tab rows (All/Unread/Priority and the category chips) use it. Previously the category arrows changed the selection but left keyboard focus on the old tab; the first row had no arrow keys and no roving tabindex. |
| Global search | Category buttons are now a labelled `tablist` of `tab`s with the same keyboard model, a 36px minimum height and a focus ring. The result outcome summary is `aria-live="polite"`. Input is `type="search"` with a search enter key on mobile. |
| Discovery search bar | The suggestion chips were `role="option"` with a constant `aria-selected="false"` and no keyboard path. It is now a combobox: ArrowUp/Down move an active option (`aria-activedescendant`), Enter commits it, Escape closes the list before any parent dialog, options are 36px high. |
| CSS | Native WebKit search clear/decoration hidden because the app has its own clear buttons. |
| Copy | `plural()` helper; fixed "1 results", "1 comments", "1 members", "1 items", "1 people liked you" and "1 posts saved". |
| Contract | `scripts/check-run466-search-notification-keyboard.mjs` in `verify:static` and `prebuild:checks`. |

## Verification
Static only (see RUN465 for scope). `tsc --noResolve` syntax pass shows no syntax or undefined-symbol errors. Behaviour in a browser is unverified.

## Still open
Rendered review of search, bell and filters at 320–430px widths; message conversation search and marketplace filters have not been moved onto the combobox pattern; notification list virtualisation was not examined.
