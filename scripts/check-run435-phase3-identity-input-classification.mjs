#!/usr/bin/env node
/** RUN435 Phase 3: classify caller-supplied identity fields vs session actors and domain targets. */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const routes = {
  communities: read('app/api/communities/route.ts'),
  spend: read('app/api/economy/ledger/spend/route.ts'),
  transfers: read('app/api/economy/transfers/route.ts'),
  listings: read('app/api/marketplace/listings/route.ts'),
  messages: read('app/api/messaging/conversations/[conversationId]/messages/route.ts'),
  profile: read('app/api/profile/me/route.ts'),
  follows: read('app/api/social/follows/route.ts'),
  attention: read('app/api/social/posts/[id]/attention/route.ts'),
}
const checks = [
  ['community creator identity is session-derived; body ownership aliases are ignored', /void body\.(?:createdBy|ownerId|userId|creatorId)/.test(routes.communities) && /createdBy:\s*auth\.userId/.test(routes.communities)],
  ['GHC spend ignores body user/sender identity and binds spend to session', /void body\.userId/.test(routes.spend) && /void body\.senderId/.test(routes.spend) && /userId:\s*auth\.userId/.test(routes.spend)],
  ['GHC transfer ignores body sender aliases and binds debit actor to session', /void body\.senderId/.test(routes.transfers) && /void body\.fromUserId/.test(routes.transfers) && /void body\.userId/.test(routes.transfers) && /senderId:\s*auth\.userId/.test(routes.transfers)],
  ['marketplace listing ignores body owner aliases and binds seller to session', /void body\.ownerId/.test(routes.listings) && /void body\.userId/.test(routes.listings) && /sellerId:\s*auth\.userId/.test(routes.listings)],
  ['message sender aliases are ignored and message sender is session-derived', /void body\.senderId/.test(routes.messages) && /void body\.userId/.test(routes.messages) && /void body\.authorId/.test(routes.messages) && /void body\.actorId/.test(routes.messages) && /senderId:\s*auth\.userId/.test(routes.messages)],
  ['profile identity aliases are stripped before upsert and owner is session-derived', /delete input\.userId/.test(routes.profile) && /delete input\.ghUserId/.test(routes.profile) && /delete input\.ownerId/.test(routes.profile) && /upsertServerProfile\(auth\.userId, input\)/.test(routes.profile)],
  ['follow actor aliases are ignored and target is separately sanitized', /void body\.actorId/.test(routes.follows) && /void body\.userId/.test(routes.follows) && /sanitizeTargetUserId\(body\.targetUserId, auth\.userId\)/.test(routes.follows) && /p_follower_id:\s*auth\.userId/.test(routes.follows)],
  ['post attention actor aliases are ignored and actor is the authenticated session', /actorId\s*=\s*auth\.userId/.test(routes.attention) && /never body\.userId \/ body\.actorId/.test(routes.attention)],
  ['community creation requires authenticated actor before bounded body processing', routes.communities.indexOf('if (!auth)') < routes.communities.indexOf('readBoundedJson(request')],
  ['spend requires authenticated actor before parsing request body', routes.spend.indexOf('if (!auth)') < routes.spend.indexOf('readBoundedJson(request')],
  ['transfer requires authenticated actor before parsing request body', routes.transfers.indexOf('if (!auth)') < routes.transfers.indexOf('readBoundedJson(request')],
  ['listing mutation requires authenticated actor before body ownership fields are consumed', routes.listings.indexOf('if (!auth)') < routes.listings.indexOf('const body')],
  ['message mutation requires authenticated actor before message body is accepted', routes.messages.indexOf('if (!auth)') < routes.messages.indexOf('const body = parsed.value')],
  ['profile mutation derives profile owner from authenticated actor', /upsertServerProfile\(auth\.userId, input\)/.test(routes.profile)],
  ['follow write binds database actor to authenticated account', /p_follower_id:\s*auth\.userId/.test(routes.follows)],
  ['attention event binds database actor to authenticated account', /p_actor_id:\s*actorId/.test(routes.attention)],
]
let failed = 0
for (const [name, pass] of checks) {
  console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`)
  if (!pass) failed++
}
console.log(`RUN435 Phase 3 identity input classification: ${checks.length - failed}/${checks.length} passed`)
if (failed) process.exitCode = 1
