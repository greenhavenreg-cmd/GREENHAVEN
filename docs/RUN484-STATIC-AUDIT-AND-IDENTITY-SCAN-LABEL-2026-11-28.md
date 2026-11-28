# RUN484 — static accessibility/leak audit and identity scan input label

**Baseline:** RUN483. Source candidate only — NOT APPROVED for production. No migration, economics, ledger or authentication-policy change.

## Fix
`GreenHavenIdentityCard` "paste GH ID / receive link" textarea had only a placeholder, so screen readers announced an unnamed field. It now has `aria-label="Paste a GH ID or receive link"` and disables autocorrect/spellcheck so a pasted `GH-XXXXXX` or `ghc://receive` link is not altered.

## Audited, no change needed
- Multi-line failure branches (59 hits across components, app and features): remaining state resets are busy flags, device-storage reads, documented fail-closed attention badges, or already show an explicit error (wallet Pi snapshot `piFailed`, Spend GHC `loadError`, membership lifecycle `unavailable`).
- Buttons without `type` (5, all in the field-research surface, outside the member app), images without `alt` (0).
- Clickable non-interactive elements (8): modal backdrops handled by the shared dialog hook, and the post image area, which already has `tabIndex`, Enter/Space handling and a label.
- Form controls: after reading full tags, withdraw amount, PIN, global search, discovery search, settings selects/slider and message composer are all labelled.
- `addEventListener` without cleanup: only `{ once: true }` pointer listeners and module-level singletons in `lib/`. No uncleared intervals.

## Verification
`check-run484-identity-scan-input-label.mjs` (3 checks) and the full `verify:static` suite pass. Not run: typecheck, lint, build, browser, live Testnet.

## Not done
Field-research surface labels (7+7 unnamed controls in `public-research-form` and `research-studio-client`) were not reviewed; broad UI/layout/design work needs a build environment and visual review.
