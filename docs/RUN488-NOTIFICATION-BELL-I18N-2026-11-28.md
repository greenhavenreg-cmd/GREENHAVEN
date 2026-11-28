# RUN488 — notification bell strings and group names

**Baseline:** RUN487. Source candidate only — NOT APPROVED for production. No migration, economics, ledger, authentication or API change.

## Findings and fixes
The notification bell already had dialog focus handling, tab semantics, live status, a 99+ cap and failure reconciliation. Its remaining gap was language: the Unread tab label, read-state and mark-all status lines, the "all marked read" toast and two accessible names were hard-coded English, so a Hausa, Igbo, Yoruba or Pidgin user got a half-translated panel and screen-reader labels. Nine strings moved into `lib/i18n/social.ts` (English base; locale packs fall back per key until native review supplies translations). The notification actions container also had an `aria-label` without a role, which assistive technology ignores; it is now `role="group"`.

Behaviour is unchanged: counts, read/unread handling, optimistic updates and server reconciliation.

## Verification
`check-run488-notification-bell-i18n.mjs` (7 checks) and the full `verify:static` suite pass. Not run: typecheck, lint, build, browser or screen-reader testing.

## Not done
Native Hausa, Igbo, Yoruba and Pidgin copy for the nine new keys; they display in English until reviewed.
