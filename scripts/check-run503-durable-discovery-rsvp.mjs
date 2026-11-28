#!/usr/bin/env node
/** RUN503: connect Discover Events and Services to durable product workflows; complete RSVP states. */
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
const read = (path) => readFileSync(path, "utf8")
const discovery = read("components/ghc/discovery-grid-screen.tsx")
const events = read("components/ghc/events-discovery-screen.tsx")
const services = read("components/ghc/services-directory-screen.tsx")
const platform = read("app/api/communities/[id]/platform/route.ts")
const checks = [
  ["Discover Events category mounts the authenticated durable Events screen", discovery.includes('if (category === "events")') && discovery.includes("<EventsDiscoveryScreen")],
  ["Discover Services category mounts the durable Marketplace-backed directory", discovery.includes('if (category === "services")') && discovery.includes("<ServicesDirectoryScreen")],
  ["Back actions return to the Discover people category", discovery.includes('onBack={() => setCategory("people")}')],
  ["Services handoff opens the exact selected Marketplace listing", discovery.includes('onOpenMarketplace={(listingId) => navigateTo("marketplace", { listingId })')],
  ["Events directory reads the authenticated durable Events API", events.includes("fetch(`/api/ecosystem/events?") && events.includes("payload?.ok !== true")],
  ["Services directory requires durable server-backed listings", services.includes("payload.durable !== true") && services.includes("/api/marketplace/listings")],
  ["RSVP UI exposes all three server-supported states", events.includes('["going", "Going"]') && events.includes('["maybe", "Maybe"]') && events.includes("[\"declined\", \"Can't go\"]")],
  ["RSVP mutations use the existing server-authorized community platform action", events.includes('action: "event_rsvp"') && platform.includes("gh_community_event_rsvp")],
  ["RSVP status changes only after a durable server confirmation", /payload\.durable !== true[\s\S]{0,360}setEvents\(\(current\)/.test(events)],
  ["RSVP failure has a separate honest error state", events.includes("setRsvpError(") && events.includes('rsvpError ? <p role="alert"')],
  ["RSVP controls expose pressed state and prevent duplicate submissions", events.includes("aria-pressed={selected}") && events.includes("disabled={Boolean(rsvpBusy)}")],
  ["Events and Services screens retain abortable, bounded search/pagination requests", events.includes("requestRef.current?.abort()") && services.includes("requestRef.current?.abort()") && events.includes("pageSize = 30") && services.includes("const limit = 30")],
]
let failed = 0
for (const [name, ok] of checks) { console.log(`${ok ? "PASS" : "FAIL"} ${name}`); if (!ok) failed++ }
console.log(`\nRUN503 durable discovery and RSVP integration: ${checks.length - failed}/${checks.length} passed`)
assert.equal(failed, 0)
