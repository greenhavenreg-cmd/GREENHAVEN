# RUN490 — media lightbox arrow keys and global key-handler audit

**Baseline:** RUN489. Source candidate only — NOT APPROVED for production. No migration, economics, ledger, authentication or API change.

## Findings and fixes
Audited all 26 global `keydown` listeners. Global hotkeys (`/`, `c`) already skip editable fields and dialogs; dialogs built on `useDialogA11y` handle Escape in the capture phase and stop propagation, so they do not also close the screen beneath. The media lightbox was the remaining gap: ArrowLeft/ArrowRight always changed the gallery item, so a keyboard user seeking inside a focused video or audio control, or moving a slider, jumped to another item. The lightbox now ignores arrows originating in inputs, video, audio, sliders and text boxes, and modifier combinations. (Story viewer was fixed in RUN489.)

## Verification
`check-run490-lightbox-arrow-keys.mjs` (4 checks) and the full `verify:static` suite pass. Not run: typecheck, lint, build or browser testing.

## Not done
Message-thread Escape closes the thread from any focus that is not inside a `useDialogA11y` dialog, including the composer; whether that is wanted needs product review.
