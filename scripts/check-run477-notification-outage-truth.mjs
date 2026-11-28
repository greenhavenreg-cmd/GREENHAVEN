import fs from "node:fs"
import assert from "node:assert/strict"
const read = (p) => fs.readFileSync(p, "utf8")
const count = read("app/api/economy/notifications/unread-count/route.ts")
const list = read("app/api/economy/notifications/route.ts")
const store = read("lib/server/economy/notifications.ts")
const posts = read("app/api/social/posts/route.ts")
const signal = read("app/api/matching/signal/route.ts")
const checks = [
  ["unread-count route answers 503 on an unreadable store", /count === null\) return jsonErr\("NOTIFICATIONS_UNAVAILABLE"[^)]*503\)/.test(count)],
  ["unread-count route no longer coerces failure to zero", !/unreadGhcNotificationCount\(auth/.test(count)],
  ["list route answers 503 on an unreadable store", /items === null\) return jsonErr\("NOTIFICATIONS_UNAVAILABLE"[^)]*503\)/.test(list)],
  ["store exposes checked list and exact count", /export async function listGhcNotificationsChecked/.test(store) && /export async function unreadGhcNotificationCountChecked/.test(store) && /count=exact/.test(store)],
  ["post media-attach uses the timeout-bounded RPC client", /supabaseRpc<\{ ok\?: boolean \}>\(\s*"gh_post_media_attach"/.test(posts)],
  ["post media-attach rollback result is verified, not swallowed", /const hide = await supabaseRest/.test(posts) && /cleanupPending: true/.test(posts) && !/\.catch\(\(\) => undefined\)\s*\n\s*}\s*\n\s*return NextResponse\.json\(\{ ok: false, error: "MEDIA_ATTACH_FAILED"/.test(posts)],
  ["quote link failure is reported as quoteAttached:false", /quoteAttached = link\.ok/.test(posts) && /quoteAttached/.test(posts.split("return NextResponse.json({ ok: true, durable: true")[1] || "")],
  ["quote link is scoped to the author's own post", /gh_posts\?id=eq\.\$\{encodeURIComponent\(id\)\}&author_id=eq\.\$\{encodeURIComponent\(auth\.userId\)\}`,\s*\{\s*method: "PATCH"[\s\S]{0,200}quote_of_post_id/.test(posts)],
  ["match signal upsert uses the timeout-bounded RPC client", /supabaseRpc\("ghc_match_signal_upsert"/.test(signal) && !/fetch\(/.test(signal)],
  ["match signal peer lookup degrades to not-mutual instead of throwing", /mutual = peer\.ok && Array\.isArray\(peer\.data\)/.test(signal)],
]
for (const [name, pass] of checks) { console.log(`${pass ? "PASS" : "FAIL"} ${name}`); assert.ok(pass, name) }
console.log(`RUN477 notification outage-truth and post write audit: ${checks.length}/${checks.length} passed`)
