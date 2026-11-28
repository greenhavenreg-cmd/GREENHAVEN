#!/usr/bin/env node
/** RUN477 runtime regression: economy notification reads tell an outage from an empty inbox, and the unread count is exact. */
import assert from "node:assert/strict"
import { register } from "node:module"
register("data:text/javascript," + encodeURIComponent(`
export async function resolve(specifier, context, nextResolve) {
  if (specifier === "next/server") return { url: "data:text/javascript,export class NextResponse { static json(b, i) { return new Response(JSON.stringify(b), i) } }", shortCircuit: true }
  return nextResolve(specifier, context)
}`), import.meta.url)
process.env.SUPABASE_URL = "https://proj.supabase.co"
process.env.SUPABASE_SERVICE_ROLE_KEY = "service-key"
delete process.env.DATABASE_URL
delete process.env.SUPABASE_DB_URL

const calls = []
let respond = () => ({ status: 200, body: [] })
globalThis.fetch = async (input, init = {}) => {
  const url = typeof input === "string" ? input : input.url
  calls.push({ url, method: init.method || "GET", headers: new Headers(init.headers) })
  const r = respond(url, init)
  return new Response(JSON.stringify(r.body), { status: r.status, headers: { "content-type": "application/json", ...(r.headers || {}) } })
}

const n = await import("../lib/server/economy/notifications.ts")

// Outage: checked list is null, compatibility wrapper stays an empty list.
respond = () => ({ status: 500, body: { message: "boom" } })
assert.equal(await n.listGhcNotificationsChecked("u1"), null)
assert.deepEqual(await n.listGhcNotifications("u1"), [])
// Success with no rows is an empty inbox, not an outage.
respond = () => ({ status: 200, body: [] })
assert.deepEqual(await n.listGhcNotificationsChecked("u1"), [])
// Limit is clamped to 1..100 and a NaN limit falls back to 50.
calls.length = 0
await n.listGhcNotificationsChecked("u1", { limit: 9999 }); assert.match(calls.at(-1).url, /limit=100/)
await n.listGhcNotificationsChecked("u1", { limit: -5 }); assert.match(calls.at(-1).url, /limit=1(&|$)/)
await n.listGhcNotificationsChecked("u1", { limit: Number.NaN }); assert.match(calls.at(-1).url, /limit=50/)

// Exact unread count comes from Content-Range, not a capped row count.
calls.length = 0
respond = () => ({ status: 206, body: [{ id: "x" }], headers: { "content-range": "0-0/137" } })
assert.equal(await n.unreadGhcNotificationCountChecked("u1"), 137)
assert.equal(calls[0].headers.get("prefer"), "count=exact")
assert.match(calls[0].url, /read_at=is\.null/)
// Zero unread is a real zero.
respond = () => ({ status: 200, body: [], headers: { "content-range": "*/0" } })
assert.equal(await n.unreadGhcNotificationCountChecked("u1"), 0)
// Outage is null, never 0; the compatibility wrapper keeps its old 0.
respond = () => ({ status: 503, body: { message: "down" } })
assert.equal(await n.unreadGhcNotificationCountChecked("u1"), null)
assert.equal(await n.unreadGhcNotificationCount("u1"), 0)

console.log("RUN477 notification outage-truth runtime test passed")
