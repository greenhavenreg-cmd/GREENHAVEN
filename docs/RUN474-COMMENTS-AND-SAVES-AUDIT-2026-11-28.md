# RUN474 — comments and saved-posts audit

**Baseline:** `gh-connect@0.338.173` / RUN461–RUN473. **Status:** source candidate only — NOT APPROVED for production. Version unchanged; no migration, economics, ledger or reward-formula change.

Closes the "comment routes not audited" and `gh_save_toggle` items left open by RUN473.

## Findings and fixes
1. **A saved post could not be removed once it became unreachable.** `POST /api/social/saves` ran the visibility check before the toggle, so a post that was later deleted, archived, made private or blocked returned 404 and stayed in the member's list. The route now allows the toggle when the member's own save row exists (so it can be removed) and still refuses new saves of unreachable posts. A failed lookup is 503, not a false 404. Durability is checked before visibility.
2. **Mention notices could reach people who cannot open the post.** Each mentioned member is now checked with `canViewSocialPost` before a notice is sent (private, community-only and blocked cases).
3. **Mention lookup matched the wrong users.** `ilike` treats `_` as a wildcard, so `@a_b` could match `axb` and, with the result limit, crowd out the real user. The underscore is escaped. The lookup now has a timeout and checks the response status and shape.
4. **Unguarded background work.** The comment side-effect block (attention event, reputation, notifications, mentions) now ends in a catch so a failure cannot become an unhandled rejection.
5. **Request validation.** Comment list/create validate the post id shape; create rejects non-string text (non-object bodies were already rejected by `readBoundedJson`, so that check is defensive only); comment edit/delete validate both ids and edit rejects non-object bodies. A dead local variable was removed.

## Verification
`node scripts/check-run474-comments-saves-audit.mjs` passes. Not run: TypeScript typecheck, lint, build (dependencies and Node 24 absent here), browser testing, live Testnet.

## Still open / not changed
- `gh_comment_create` / `gh_comment_edit` SQL was not re-read in this pass; the route-level contract only.
- `enhanced-post-card.tsx`, feed ranking, story, settings, wallet and messaging UI layouts were not changed in this pass.
- Saved-post list (`GET`) still returns ids only; hiding unreachable ones in the UI is a follow-up.
