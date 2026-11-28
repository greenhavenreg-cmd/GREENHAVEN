# RUN501 — Messages count badge and dismissible toasts (2026-11-28)

**Baseline:** RUN500. Production NOT APPROVED.

## UX gaps
1. The Messages tab showed a bare red dot, so a user could not tell one unread message from forty.
2. Toasts could not be dismissed. A success message sat over the bottom navigation for 3.2s and a failure for 6.5s, with no way to clear it or reach what was behind it.

## Changes (`components/ghc/app.tsx`)
- Messages tab: the dot became a count pill (capped at `99+`, locale-formatted). It uses the RUN498 attention rule, so archived and muted chats are not counted, and it still hides while the Messages tab is open. Home, Communities and Profile keep their dots because their counts are not message totals. The accessible name is unchanged.
- Toasts: each toast has a labelled dismiss button (44px target with offsetting margins so the toast stays compact, visible focus). Dismissal reuses the existing hidden-id set, so timers, error duration (6.5s) and cleanup are unchanged.

## Not changed
No financial, storage, API or migration behaviour.

## Verification
`scripts/check-run501-messages-count-badge-and-toast-dismiss.mjs` 7/7 and the full `verify:static` suite. Typecheck, lint, build and device review were not run here and remain outstanding. Please check on a phone that the pill does not crowd the icon at `99+`.
