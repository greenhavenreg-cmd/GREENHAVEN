# RUN468 — touch-target expansion

**Baseline:** `gh-connect@0.338.173` / RUN461–RUN467. **Status:** source candidate only — NOT APPROVED for production. Version unchanged; no migration, economics or API change.

## What changed
| Area | Change |
|---|---|
| CSS | `.gh-hit-44` in `app/globals.css` adds an invisible `::after` of at least 44×44px centred on the control. Visual size and layout are unchanged. Static buttons become the containing block; `absolute`, `fixed`, `sticky` and `relative` buttons keep their own positioning. |
| Buttons | 45 icon buttons sized 36px or smaller (marketplace header/cart steppers, profile and story controls, discovery, onboarding, create hub, wallet request/withdraw close buttons and others) now use it. |
| Contract | `scripts/check-run468-touch-target-expansion.mjs` fails if a new fixed-size icon button of 36px or less is added without a 44px hit area. In `verify:static` and `prebuild:checks`. |

## Verification
Static only. Adjacent small buttons (for example cart quantity steppers) have overlapping hit areas; the later element receives the tap in the overlap. This needs a check on a real phone.

## Still open
Rendered review at 320–430px, message conversation search and marketplace filters on the combobox pattern, and Node 24 typecheck/lint/build.
