#!/usr/bin/env node
/** Phase D Communities product completion and server-authority gate. */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const read = (path) => readFileSync(path, 'utf8')
const hub = read('components/ghc/premium-community-hub.tsx')
const card = read('components/ghc/group-card.tsx')
const directory = read('components/ghc/communities-screen.tsx')
const roleRoute = read('app/api/communities/[id]/roles/route.ts')
const requestsRoute = read('app/api/communities/[id]/requests/route.ts')
const joinRoute = read('app/api/communities/[id]/join/route.ts')
const discovery = read('lib/community/discovery.ts')
const governance = read('lib/server/community/governance-store.ts')
const pkg = JSON.parse(read('package.json'))
const checks = [
  ['moderator role is fetched from the authenticated server endpoint, not trusted from local cache', hub.includes('/api/communities/${encodeURIComponent(community.id)}/roles') && hub.includes('payload?.durable === true') && hub.includes('const isMod = verifiedCommunityRole') && hub.includes('[community.id, roleIdentityKey]') && hub.includes('ghcSession.profile?.id')],
  ['role endpoint returns only the caller role with no-store headers and durable rate limiting', roleRoute.includes('export async function GET') && roleRoute.includes('communityRole(communityId, auth.userId)') && roleRoute.includes('checkDurableRateLimit') && roleRoute.includes('NO_STORE = { \"Cache-Control\": \"no-store, private\" }')],
  ['role lookup delegates to canonical server-side community role RPC', governance.includes('gh_community_platform_role')],
  ['moderation console and Mod tab are hidden unless server role is owner/admin/moderator', hub.includes('(isMod ? HUB_TABS : HUB_TABS.filter((t) => t.id !== "mod"))') && hub.includes('tab === "mod" && isMod')],
  ['join queue approval and decline remain server-authorized and durable', requestsRoute.includes('gh_community_join_decide') && requestsRoute.includes('p_actor_id: auth.userId') && joinRoute.includes('resolveAuthenticatedUser')],
  ['join queue display does not expose opaque applicant account IDs', hub.includes('`Applicant ${index + 1}`') && !hub.includes('{uid.slice(0, 16)}')],
  ['directory cards show normalized access privacy chips', card.includes('communityPrivacyLabel(privacy)') && card.includes('aria-label={`Community access:') && directory.includes('privacy={community.privacy}')],
  ['privacy label distinguishes open, approval, invite-only and private communities', discovery.includes('export function communityPrivacyLabel') && discovery.includes('normalizeCommunityPrivacy(raw)')],
  ['privacy filters retain all/public/request/invite semantics', discovery.includes('matchesPrivacyFilter') && discovery.includes('filter === "request"') && discovery.includes('filter === "invite"')],
  ['Board, Updates, Members and moderator hub sections remain present', ['id: "board"','id: "announcements"','id: "members"','id: "mod"'].every((token) => hub.includes(token))],
  ['Phase D community gate is registered exactly once in prebuild and static verification', ['prebuild:checks','verify:static'].every((key) => (pkg.scripts[key].match(/check-phaseD-communities-completion\.mjs/g) || []).length === 1)],
]
let failed = 0
for (const [name, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`); if (!ok) failed++ }
console.log(`\nPhase D Communities completion: ${checks.length - failed}/${checks.length} passed`)
assert.equal(failed, 0)
