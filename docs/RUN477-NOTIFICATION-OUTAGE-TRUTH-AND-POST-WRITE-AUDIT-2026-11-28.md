# RUN477 — notification outage truth and post/match write audit

**Baseline:** RUN476. Source candidate only — NOT APPROVED for production. No migration, economics or UI change.

## Findings and fixes
1. **Economy notification reads hid outages.** `GET /api/economy/notifications` returned `items: []` with HTTP 200 and `GET /api/economy/notifications/unread-count` returned `count: 0` with HTTP 200 whenever the store failed. The bell could not tell "no notifications" from "could not load", and the attention badge reset to zero during an outage. Both routes now answer `NOTIFICATIONS_UNAVAILABLE` (HTTP 503) on a store failure; the bell and shell already keep their last known state on a non-OK response, so no client change was needed.
2. **Unread count was capped.** The count was the length of a 100-row list. It is now an exact `Prefer: count=exact` read (Content-Range), so a user with more than 100 unread items sees the true figure (the shell still clamps the badge at 99+). `listGhcNotifications` and `unreadGhcNotificationCount` remain as compatibility wrappers.
3. **List limit hardening.** The limit is clamped to 1..100 and a non-finite value falls back to 50.
4. **Post media-attach rollback was fire-and-forget.** When `gh_post_media_attach` failed, the hide-the-post PATCH ignored its own result, so a failed rollback could leave a half-published post visible while the client was told it failed. The attach now uses the timeout-bounded `supabaseRpc`, the rollback result is verified and logged, and the 503 carries `cleanupPending: true` if the rollback itself failed.
5. **Quote-of-post link failures were silent.** The quote PATCH had no timeout, no status check and an empty catch. It now uses `supabaseRest` with a timeout, is scoped to the author's own post, and the success response carries `quoteAttached: false` when the link could not be stored (the post itself is durable). The field is only present when a quote was requested.
6. **Match signal calls were unbounded.** `/api/matching/signal` used raw `fetch` with no timeout for the upsert RPC and the mutual-interest lookup. Both now use the shared client; a failed mutual lookup degrades to "not mutual" instead of failing a signal that was already stored.

## Verification
`check-run477-notification-outage-truth.mjs` (10 checks) and `test-run477-notification-outage-truth.mjs` (runtime) pass, as do the existing RUN473, RUN476, post-publishing, upstream-timeout and social-connection checks. The full `verify:static` suite is run on this bundle. Not run: typecheck, lint, build, browser, live Testnet (dependencies and Node 24 absent).

## Not done
No UI, layout or design work in this pass. The wider UI/UX audit of feed, story, community, messages, profile, settings, wallet, withdrawal, payments, membership, rewards, filter and search surfaces is still open and needs a build environment (dependencies, Node 24, browser) to verify changes honestly.
