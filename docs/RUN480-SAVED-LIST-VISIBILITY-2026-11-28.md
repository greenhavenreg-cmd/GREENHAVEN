# RUN480 — saved-post list hides unreachable posts

**Baseline:** RUN479. Source candidate only — NOT APPROVED for production. No migration, economics or layout change.

## Findings and fixes
1. **The saved list and its count included posts the member can no longer open.** `GET /api/social/saves` returned every stored `post_id`, so a post that was deleted, archived, made followers-only or blocked since it was saved still counted and could render as a dead entry. This closes the follow-up left open by RUN474. The route now runs the ids through the existing batched `filterVisibleSocialPosts` helper (one policy read per table, no N+1) and returns only reachable ids; `count` matches the list.
2. **Outage behaviour is explicit.** If the visibility policy data cannot be read, the route still returns the member's own saved ids (no post content is in the response and opening a post re-checks visibility) and sets `filtered: false` so the condition is observable.
3. **Unchanged on purpose:** the toggle route still lets a member remove an existing save of an unreachable post and still refuses to add a new save of one.

## Behaviour change to review
A hidden save stays in the database but no longer appears in the list; if the post becomes visible again (follow restored, unblocked) it reappears. The member cannot remove a hidden save from the list while it is hidden.

## Verification
`check-run480-saved-list-visibility.mjs` (8 checks) passes and the full `verify:static` suite is run on this bundle. Not run: typecheck, lint, build, browser, live Testnet.

## Not done
`gh_save_toggle` visibility enforcement inside the SQL function is still unconfirmed against the live database. UI, layout and design work remains open and needs a build environment.
