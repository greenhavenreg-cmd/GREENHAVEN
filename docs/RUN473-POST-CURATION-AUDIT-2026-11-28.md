# RUN473 — post and curation audit

**Baseline:** `gh-connect@0.338.173` / RUN461–RUN472. **Status:** source candidate only — NOT APPROVED for production. Version unchanged; no migration, economics, ledger or reward-formula change.

## Findings and fixes
1. **Author lookups pointed at a placeholder host.** `lookupPostAuthor`, `lookupCommentThreadParticipants` (two fetches) and `lookupPostListingId` fetched `https://rest.local/...`, which never resolves; every failure was swallowed and returned null. Effect: curation, like and comment notifications to authors were never sent, and the flagged curation redistribution step never ran. They now use the project's PostgREST base URL (`restBase`), with a timeout on the author lookup.
2. **Delete reported success on rejection.** `DELETE /api/social/posts/[id]` returned `ok:true` when the RPC answered `ok:false` with any error other than FORBIDDEN/NOT_FOUND. It now returns an error.
3. **Edit route.** Rate limited (was the only post mutation without one). Existing first-party media (`/api/media/<id>/content`) is now accepted only when the post already carries that exact reference, so editing a post with durable media no longer fails with INVALID_MEDIA, and an edit still cannot attach unvetted media. Media-only posts can be edited without text. A failed read is 503 instead of a false 404. The write is guarded with `deleted_at=is.null`. Calls have timeouts.
4. **Reward and review-status reads** (`/reward`, `/ghpv`) now follow post visibility, so they no longer reveal status or amounts for posts the viewer cannot see.
5. **Curation route.** A failure in the optional redistribution step no longer turns an already-saved vote into a 500. Notification side effects cannot raise unhandled rejections; the notice uses the server-confirmed choice. Post id shape is validated. The roster validates its `choice` filter.
6. **Client messages.** The server's real codes (`SELF_CURATION_FORBIDDEN`, `DAILY_CURATION_LIMIT`, `CURATION_REVIEW_REQUIRED`, `CURATION_INTELLIGENCE_UNAVAILABLE`, `SOCIAL_RPC_UNAVAILABLE`) were not mapped and fell through to a generic message.
7. **Create route.** Oversize or non-string text is rejected before media work. Client-supplied community/listing labels are length-bounded and the community id shape is validated. A quote is attached only when the author can see the original post. Reaction and share notification side effects get the same rejection guard. Archive fallback write is scoped to the owner and non-deleted posts.

## Verified as already sound (no change)
`gh_post_curation_set_with_reward` performs per-user daily serialization, canonical visibility preflight, vote, reward-policy evaluation, GHPV weight and activity audit in one transaction. Post create validates visibility and content type in SQL.

## Verification
`node scripts/check-run473-post-curation-audit.mjs` passes. Not run: TypeScript typecheck, lint, build (dependencies and Node 24 are absent here), browser testing, live Testnet.

## Still open / not changed
- Editing a post after it has received votes or rewards is still allowed (product decision).
- `gh_save_toggle` visibility enforcement was not confirmed from the migration text and should be checked against the live function.
- The comment routes, post card UI (`enhanced-post-card.tsx`) and feed ranking were not audited in this pass.
