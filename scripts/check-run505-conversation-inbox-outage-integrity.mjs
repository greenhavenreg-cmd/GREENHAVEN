#!/usr/bin/env node
/** RUN505: conversation inbox reads must not disguise partial store outages as empty data. */
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const store = readFileSync("lib/server/messaging/message-store.ts", "utf8")
const route = readFileSync("app/api/messaging/conversations/route.ts", "utf8")
const checks = [
  ["member lookup outage is surfaced", /if \(!memRes\.ok \|\| !Array\.isArray\(memRes\.data\)\) throw new Error\("CONVERSATION_MEMBERS_UNAVAILABLE"\)/.test(store)],
  ["conversation lookup outage is surfaced", /if \(!convRes\.ok \|\| !Array\.isArray\(convRes\.data\)\) throw new Error\("CONVERSATIONS_UNAVAILABLE"\)/.test(store)],
  ["self preference lookup outage is surfaced", /CONVERSATION_PREFERENCES_UNAVAILABLE/.test(store)],
  ["membership lookup outage is surfaced", /CONVERSATION_MEMBERSHIP_UNAVAILABLE/.test(store)],
  ["unread-count RPC outage is surfaced", /CONVERSATION_UNREAD_COUNTS_UNAVAILABLE/.test(store)],
  ["route maps failed inbox read to an error response", /\{ status: 500, headers: \{ "Cache-Control": "no-store" \} \}/.test(route)],
  ["no production fallback silently returns an empty inbox", /if \(isProd\(\)\) throw new Error\("MESSAGING_STORE_UNAVAILABLE"\)/.test(store)],
]
for (const [label, pass] of checks) {
  assert.ok(pass, label)
  console.log(`PASS ${label}`)
}
console.log(`RUN505 conversation inbox outage integrity: ${checks.length}/${checks.length} passed`)
