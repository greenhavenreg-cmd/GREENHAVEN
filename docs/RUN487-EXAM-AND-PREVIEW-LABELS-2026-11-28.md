# RUN487 — exam/preview control names and toast pipeline

**Baseline:** RUN486. Source candidate only — NOT APPROVED for production. No migration, economics, ledger, authentication or API change.

## Findings and fixes
1. **Timed examination (public, unauthenticated respondents):** RUN486 labelled the survey form but not `ExamRunner`, in the same file. Exam question text was an unassociated paragraph, so short and long text answers had no accessible name and the single-choice options were announced without their question. Each exam section is now labelled by its question, text controls carry `aria-labelledby`, options are a `radiogroup`, and the required asterisk is announced as "(required)".
2. **Exam clock:** the countdown was `aria-live="polite"` and re-announced every second. It is now a `timer` with live announcements off and an accessible name, plus a separate polite status that changes only at five minutes and one minute remaining.
3. **Studio preview:** the owner's preview of a form had the same unnamed controls and ungrouped options; it now uses `preview-<id>-label` associations and `group`/`radiogroup`.

Answers, autosave, deadline lock, validation and submit payloads are unchanged. The RUN486 check's control-count assertion moved from 5 to 7 because the two exam text controls now carry the same `id` pattern.

4. **Toast pipeline (all screens):** the shell hides error toasts after 6.5s, but `addToast` removed every toast from state at 3s, so the longer error time never applied. The provider now keeps errors 7.5s and others 4s. Messages also pass through the new `lib/ux/toast-safe-message.ts`: raw server codes (many call sites pass `result.error` straight through) are mapped to plain language via the two existing code maps, unmapped codes in error toasts and infrastructure/secret-like text become a generic retry message, and ordinary sentences are unchanged. An identical toast already listed is replaced rather than stacked.

## Verification
`check-run487-exam-and-preview-labels.mjs` (9 checks), `check-run487-toast-safe-message.mjs` (8 checks) and the RUN486 check pass; the full `verify:static` suite passes. Not run: typecheck, lint, build, browser or screen-reader testing (dependencies are not installed in the audit environment).

## Reviewed, no change needed
Scanned all components for icon-only buttons without names, images without `alt`, and unlabelled inputs outside the research forms: none found. The remaining `.catch(() => {})` calls are best-effort background reads (saved-state hints, membership badge refresh) that fail to a safe default.

## Not done
The broad redesign, feed, wallet and notification work needs a built app to verify layout and behaviour; it was not attempted blind.
