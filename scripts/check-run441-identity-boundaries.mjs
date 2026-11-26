#!/usr/bin/env node
/** RUN441 source contract for identity lifecycle and held Community/Messenger transaction boundaries. */
import { readFileSync } from 'node:fs'
const read = (p) => readFileSync(p, 'utf8')
const pkg = JSON.parse(read('package.json'))
const session = read('lib/server/identity/session-store.ts')
const stepUp = read('lib/server/identity/step-up-store.ts')
const profile = read('lib/server/identity/public-profile-hydration.ts')
const identity = read('lib/identity/identity-service.ts')
const groupCreate = read('app/api/messaging/conversations/group/route.ts')
const groupSql = read('supabase/proposals/20261118_phase4_identity_group_contact.sql')
const communityCorrection = read('supabase/proposals/20261126_run441_community_invitation_lock_order_correction.sql')
const checks = [
  ['canonical principal change resets prior identity state', /canonicalUserId !== identity\.userId/.test(identity) && /const base = accountChanged \? defaultIdentity\(\) : identity/.test(identity)],
  ['verified profile hydration requires exact canonical owner and ignores unverified Pi-only profile data', /isServerVerified && \(!profileId \|\| profileId !== identity\.userId\)/.test(identity) && /identity\.piUserId && !isServerVerified/.test(identity)],
  ['session revocation is checked against canonical owner before update', /if \(rec\.ghUserId !== uid\)[\s\S]{0,180}return "forbidden"/.test(session)],
  ['session management read outage fails closed', /if \(!durableRows\)[\s\S]{0,400}SESSION_STORE_UNAVAILABLE/.test(session)],
  ['step-up proof is bound to both GH user and session', /sessionKey\(ghUserId, sessionId\)/.test(stepUp) && /findValidStepUp\(auth\.userId, auth\.sessionId\)/.test(stepUp)],
  ['step-up database outage cannot resurrect memory-cached proof', /memBySession\.delete\(key\)[\s\S]{0,80}return null/.test(stepUp)],
  ['session step-up revocation persists before memory mutation', /const persisted = await dbRevokeForSession\(sid\)[\s\S]{0,100}if \(!persisted\) return false/.test(stepUp)],
  ['profile hydration selects only public profile fields', /select: "gh_user_id,display_name,username,photos"/.test(profile)],
  ['profile hydration validates returned IDs against requested identity set', /const requestedIds = new Set\(ids\)[\s\S]{0,360}!requestedIds\.has\(id\)/.test(profile)],
  ['profile hydration returns transformed copies instead of mutating cached rows', /next = \{ \.\.\.item \}/.test(profile) && /return items\.map\(\(item\) => transform\(item, 0\) as T\)/.test(profile)],
  ['group creation derives actor from server session and ignores client actor fields', /p_actor_id: auth\.userId/.test(groupCreate) && !/body\.actorId|body\.userId/.test(groupCreate)],
  ['group create idempotency is serialized per actor/request key', /pg_advisory_xact_lock\(hashtextextended\(p_actor_id \|\| ':' \|\| p_client_request_id, 0\)\)/.test(groupSql)],
  ['group create idempotency has a durable unique constraint', /uq_gh_conversations_creator_request/.test(groupSql)],
  ['invite acceptance locks the exact invitation row', /FROM public\.gh_conversation_invites WHERE id = p_invite_id FOR UPDATE/.test(groupSql)],
  ['invite acceptance verifies invitee ownership and expiry', /v_inv\.invited_user_id <> p_actor_id/.test(groupSql) && /v_inv\.expires_at <= now\(\)/.test(groupSql)],
  ['invitees become members only after acceptance', /INSERT INTO public\.gh_conversation_members \(conversation_id, gh_user_id, role\)[\s\S]{0,100}VALUES \(v_inv\.conversation_id, p_actor_id, 'member'\)/.test(groupSql)],
  ['member-count trigger covers inserts, active-state changes, moves and deletes', /AFTER INSERT OR UPDATE OF left_at, conversation_id OR DELETE/.test(groupSql)],
  ['member-count recalculation locks affected conversations in deterministic order before counting', /ORDER BY c\.id\s+FOR UPDATE/.test(groupSql) && groupSql.indexOf('ORDER BY c.id') < groupSql.indexOf('SET member_count = (')],
  ['RUN429 community invitation correction follows Community-then-invitation lock order', communityCorrection.indexOf('FROM public.gh_communities') < communityCorrection.indexOf('FOR UPDATE;\n    v_community_found') && communityCorrection.indexOf('v_community_found := FOUND') < communityCorrection.indexOf('FROM public.gh_community_invitations\n  WHERE id = trim(p_invitation_id) AND invitee_user_id = trim(p_actor_id)\n  FOR UPDATE')],
  ['proposal security-definer functions pin search_path and revoke client execution', (groupSql.match(/SET search_path = pg_catalog, public, pg_temp/g) || []).length >= 5 && /REVOKE ALL ON FUNCTION public\.gh_messaging_group_invite_respond\(text,text,boolean\) FROM PUBLIC, anon, authenticated/.test(groupSql)],
  ['RUN441 checks are registered in static and prebuild gates', pkg.scripts['verify:static'].includes('check-run441-identity-boundaries.mjs') && pkg.scripts['prebuild:checks'].includes('check-run441-identity-boundaries.mjs') && pkg.scripts['verify:static'].includes('test-run441-identity-boundaries.mjs') && pkg.scripts['prebuild:checks'].includes('test-run441-identity-boundaries.mjs')],
]
let failed = 0
for (const [label, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`); if (!ok) failed++ }
console.log(`\nRUN441 identity boundary contract: ${checks.length - failed}/${checks.length} passed`)
if (failed) process.exit(1)
