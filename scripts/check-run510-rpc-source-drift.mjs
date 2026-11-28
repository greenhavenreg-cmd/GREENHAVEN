#!/usr/bin/env node
/**
 * RUN510: database RPC source-drift guard.
 *
 * Every gh_ or ghc_ prefixed RPC that server code calls must either be defined in
 * supabase/migrations or be listed in KNOWN_SOURCE_GAPS (called by live routes
 * but with no migration source in this repository). A NEW unlisted RPC fails
 * the check, so drift cannot grow silently; a listed RPC that later gains a
 * migration must be removed from the list.
 *
 * This inspects repository files only. It does not prove anything about any
 * live Supabase project: see docs/RUN510-RPC-SOURCE-DRIFT-2026-11-28.md for the
 * operator query that verifies the live catalog.
 */
import assert from "node:assert/strict"
import { readFileSync, readdirSync, statSync } from "node:fs"
import { join } from "node:path"

export const KNOWN_SOURCE_GAPS = [
  "gh_call_incoming_for_user", "gh_community_member_directory", "gh_discovery_candidates",
  "gh_marketplace_address_delete", "gh_marketplace_address_list", "gh_marketplace_address_save",
  "gh_marketplace_address_set_default", "gh_messaging_group_create_from_dm",
  "gh_messaging_group_invite_respond", "gh_messaging_share_own_contact",
  "gh_notification_push_subscription_list", "gh_notification_push_subscription_revoke",
  "gh_notification_push_subscription_upsert", "gh_research_election_tally_submit",
  "gh_session_issue_with_cap",
  // Transactional outbox: intentionally a proposal (docs/proposals), not applied.
  "gh_outbox_ack", "gh_outbox_claim", "gh_outbox_fail", "gh_outbox_heartbeat", "gh_outbox_replay",
]
const walk = (dir, out = []) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (/\.(ts|tsx)$/.test(name)) out.push(p)
  }
  return out
}
let sql = ""
for (const f of readdirSync("supabase/migrations")) if (f.endsWith(".sql")) sql += readFileSync(join("supabase/migrations", f), "utf8").toLowerCase()
const defined = new Set([...sql.matchAll(/create\s+(?:or\s+replace\s+)?function\s+(?:public\.)?"?([a-z0-9_]+)"?/g)].map((m) => m[1]))
const call = /(?:[A-Za-z]*[Rr]pc(?:<[^>]*>)?\(\s*(?:[a-zA-Z]+,\s*){0,2}|rest\/v1\/rpc\/)["'`]?((?:gh|ghc)_[a-z0-9_]+)/g
const used = new Set()
for (const root of ["app", "lib/server"]) for (const f of walk(root)) for (const m of readFileSync(f, "utf8").matchAll(call)) used.add(m[1])

const gaps = new Set(KNOWN_SOURCE_GAPS)
const unlisted = [...used].filter((n) => !defined.has(n) && !gaps.has(n)).sort()
const stale = KNOWN_SOURCE_GAPS.filter((n) => defined.has(n) || !used.has(n)).sort()
const checks = [
  [`no new RPC without migration source (${unlisted.join(", ") || "none"})`, unlisted.length === 0],
  [`KNOWN_SOURCE_GAPS has no stale entries (${stale.join(", ") || "none"})`, stale.length === 0],
  ["RPC inventory found", used.size > 100],
]
for (const [label, pass] of checks) { assert.ok(pass, label); console.log(`PASS ${label}`) }
console.log(`RUN510 RPC source drift: ${checks.length}/${checks.length} passed; ${gaps.size} known gaps tracked, ${used.size} RPCs called`)
