#!/usr/bin/env node
/** RUN476 runtime regression: economy notification store calls reach an absolute Supabase URL. */
import assert from "node:assert/strict"
import { register } from "node:module"
// `next` is a build-time dependency that is not installed for static checks; stub only its server entry point.
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
  calls.push({ url, method: init.method || "GET", body: init.body ? String(init.body) : null, headers: new Headers(init.headers) })
  const r = respond(url, init)
  return new Response(r.status === 204 ? null : JSON.stringify(r.body), { status: r.status, headers: { "content-type": "application/json" } })
}

const n = await import("../lib/server/economy/notifications.ts")
const absolute = (c) => assert.ok(c.url.startsWith("https://proj.supabase.co/rest/v1/"), `absolute URL expected, got ${c.url}`)

// list
respond = () => ({ status: 200, body: [{ id: "n1", user_id: "u1", event_type: "GHC_SENT", title: "t", body: "b", created_at: new Date().toISOString(), read_at: null }] })
const list = await n.listGhcNotifications("u1", { unreadOnly: true })
assert.equal(list.length, 1); absolute(calls.at(-1)); assert.match(calls.at(-1).url, /user_id=eq\.u1/); assert.match(calls.at(-1).url, /read_at=is\.null/)

// record
calls.length = 0
respond = () => ({ status: 200, body: { ok: true, id: "e1", idempotent: false } })
const rec = await n.recordGhcNotification({ userId: "u1", eventType: "GHC_SENT", title: "t", body: "b", referenceId: "r1" })
assert.equal(rec.ok, true); absolute(calls[0]); assert.equal(calls[0].method, "POST"); assert.match(calls[0].url, /rpc\/ghc_record_notification_event$/)
assert.equal(calls[0].headers.get("content-type"), "application/json")

// mark one: changed row
calls.length = 0
respond = () => ({ status: 200, body: [{ id: "n1" }] })
assert.equal(await n.markGhcNotificationRead("u1", "n1"), "marked")
absolute(calls[0]); assert.equal(calls[0].method, "PATCH"); assert.match(calls[0].url, /id=eq\.n1&user_id=eq\.u1&read_at=is\.null/)
assert.equal(calls[0].headers.get("prefer"), "return=representation")
// mark one: already read -> existence check -> idempotent success
calls.length = 0
respond = (url, init) => (init.method === "PATCH" ? { status: 200, body: [] } : { status: 200, body: [{ id: "n1" }] })
assert.equal(await n.markGhcNotificationRead("u1", "n1"), "marked"); assert.equal(calls.length, 2)
// mark one: someone else's / missing -> not_found
respond = () => ({ status: 200, body: [] })
assert.equal(await n.markGhcNotificationRead("u1", "nope"), "not_found")
// mark one: outage -> unavailable (not 404)
respond = () => ({ status: 500, body: { message: "boom" } })
assert.equal(await n.markGhcNotificationRead("u1", "n1"), "unavailable")

// mark all
calls.length = 0
respond = () => ({ status: 200, body: [{ id: "a" }, { id: "b" }] })
assert.equal(await n.markAllGhcNotificationsRead("u1"), 2); absolute(calls[0]); assert.equal(calls[0].method, "PATCH")
respond = () => ({ status: 503, body: null })
assert.equal(await n.markAllGhcNotificationsRead("u1"), null)

console.log("RUN476 economy notification store runtime test passed")
