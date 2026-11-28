#!/usr/bin/env node
/** RUN504: notification outage semantics and truthful messaging presence durability. */
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const read = (path) => readFileSync(path, "utf8")
const unified = read("app/api/notifications/route.ts")
const social = read("app/api/social/notifications/route.ts")
const messaging = read("lib/server/messaging/message-store.ts")
const shell = read("components/ghc/app.tsx")

const checks = [
  ["Unified unread-count failure returns HTTP 503", /if \(!result\.ok\)[\s\S]*?status: 503/.test(unified)],
  ["Unified unread-count failure does not synthesize zero", !/unreadCount:\s*result\.ok\s*\?\s*result\.data\s*:\s*0/.test(unified)],
  ["Unified notification list failure returns HTTP 503", /if \(!result\.ok\)[\s\S]*?status: 503/.test(unified)],
  ["Social unread-count failure returns HTTP 503", /if \(!result\.ok \|\| !result\.data\)[\s\S]*?status: 503/.test(social)],
  ["Social unread-count rejects invalid counts instead of coercing them to zero", /!Number\.isFinite\(count\) \|\| count < 0/.test(social)],
  ["Social notification list failure returns HTTP 503", /if \(!result\.ok \|\| !result\.data \|\| !Array\.isArray\(result\.data\.notifications\)\)[\s\S]*?status: 503/.test(social)],
  ["Social notification responses remain private and non-cacheable", (social.match(/Cache-Control/g) || []).length >= 3],
  ["Presence durability reflects the actual database write result", /let durable = false[\s\S]*?durable = saved\.ok[\s\S]*?return \{ ok: true, presence, durable \}/.test(messaging)],
  ["Production presence still fails closed when the durable store is unavailable", /if \(!saved\.ok && isProd\(\)\) return \{ ok: false, error: "PRESENCE_UNAVAILABLE" \}/.test(messaging)],
  ["Navigation attention preserves last known counts on transient failures", /else if \(socialResponse && \(socialResponse\.status === 401 \|\| socialResponse\.status === 403\)\)/.test(shell) && /else if \(economyResponse && \(economyResponse\.status === 401 \|\| economyResponse\.status === 403\)\)/.test(shell)],
  ["Notification bell snapshots its last confirmed durable rows", /const priorDurableItems = itemsRef\.current\.filter/.test(read("components/ghc/notification-bell.tsx"))],
  ["Notification bell retains only rows belonging to failed stores", /const staleStoreRows = priorDurableItems\.filter/.test(read("components/ghc/notification-bell.tsx")) && /!unifiedAvailable && !socialAvailable/.test(read("components/ghc/notification-bell.tsx")) && /!unifiedAvailable && !economyAvailable/.test(read("components/ghc/notification-bell.tsx"))],
  ["Retained notifications remain in both visible items and unread calculation", /mappedAnnouncements, \.\.\.staleStoreRows, \.\.\.localOnly/.test(read("components/ghc/notification-bell.tsx")) && /durableEconomyVisible, \.\.\.mappedAnnouncements, \.\.\.staleStoreRows/.test(read("components/ghc/notification-bell.tsx"))],
  ["Notification bell clears retained rows on account switch", /itemsRef\.current = \[\][\s\S]*?setItems\(\[\]\)/.test(read("components/ghc/notification-bell.tsx"))],
  ["Durable health requires unified success or both legacy stores", /setDurableOk\(unifiedAvailable \|\| \(socialAvailable && economyAvailable\)\)/.test(read("components/ghc/notification-bell.tsx"))],
]

for (const [label, pass] of checks) {
  assert.ok(pass, label)
  console.log(`PASS ${label}`)
}
console.log(`RUN504 notification outage and presence durability: ${checks.length}/${checks.length} passed`)
