# RUN489 — story viewer keyboard handling

**Baseline:** RUN488. Source candidate only — NOT APPROVED for production. No migration, economics, ledger, authentication or API change.

## Findings and fixes
The story viewer already had a focus trap, scroll lock, pause control, reduced-motion handling and a dialog role. Its window-level key handler had two defects:
1. ArrowLeft/ArrowRight changed story even while the person was typing in the reply box, so moving the text cursor skipped to another story. The handler now ignores inputs, textareas, selects and contenteditable targets, and modifier combinations.
2. Escape always closed the whole viewer, even with the "who viewed" sheet open on top. Escape now closes the sheet first; a second press leaves the story.

The story strip container also had an `aria-label` without a role; it is now a `region`.

## Verification
`check-run489-story-viewer-keys.mjs` (6 checks) and the full `verify:static` suite pass. Not run: typecheck, lint, build or browser testing.

## Not done
Touch-swipe and long-press behaviour were read but not changed; they need device testing.
