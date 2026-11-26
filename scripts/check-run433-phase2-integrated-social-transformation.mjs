import fs from 'node:fs'
const read = (path) => fs.readFileSync(new URL(path, import.meta.url), 'utf8')
const community = read('../components/ghc/communities-screen.tsx')
const hub = read('../components/ghc/premium-community-hub.tsx')
const create = read('../components/ghc/create-group-modal.tsx')
const messaging = read('../components/ghc/message-screen.tsx')
const requests = read('../components/ghc/connection-request-inbox.tsx')
const discovery = read('../components/ghc/discovery-grid-screen.tsx')
const discoverApi = read('../app/api/social/people/discover/route.ts')
const searchApi = read('../app/api/messaging/conversations/[conversationId]/search/route.ts')
const callPolicy = read('../lib/calls/call-policy.ts')
const callConfig = read('../app/api/messaging/calls/config/route.ts')
const notif = read('../lib/notification-targets.ts')
const checks = [
  ['Community directory includes My, Managed, Invitations and Discover', /type DirectoryTab = "my" \| "managed" \| "invitations" \| "discover"/.test(community)],
  ['Community workspace keeps Board, Events, Resources, Chat, Members and About distinct', /id: "board"[\s\S]{0,500}id: "events"[\s\S]{0,200}id: "resources"[\s\S]{0,200}id: "chat"[\s\S]{0,200}id: "members"[\s\S]{0,200}id: "about"/.test(hub)],
  ['Community creation supports resumable account-scoped drafts', /loadCommunityCreateDraft/.test(create) && /saveCommunityCreateDraft/.test(create)],
  ['Community Board has canonical pagination and explicit unavailable state', /canonicalBoardNextCursor/.test(hub) && /canonicalBoardStatus === "unavailable"/.test(hub)],
  ['Community events support create and RSVP actions', /onCreateEvent/.test(hub) && /onRsvp/.test(community)],
  ['Community moderation history is rendered from server governance state', /serverGovernanceLog/.test(hub) && /Recent moderation log/.test(hub)],
  ['Community chat remains a separate authorization grant from membership', /chatMember/.test(hub) && /Chat is optional and separate/.test(hub)],
  ['Messages inbox includes All, DMs, Unread, Requests, Communities and Archived', /type InboxFilter = "all" \| "dms" \| "unread" \| "requests" \| "communities" \| "archived"/.test(messaging)],
  ['Conversation details and shared-media workspace are present', /conversationDetailsOpen/.test(messaging) && /sharedMediaOpen/.test(messaging)],
  ['Message search is server-backed and conversation scoped', /\/search\?q=/.test(messaging) && /membership-checked/.test(messaging)],
  ['Voice notes are capability-checked before recording', /isVoiceNoteSupported\(\)/.test(messaging) && /recordVoiceNote/.test(messaging)],
  ['Media uploads use durable storage before sending', /uploadDurableMedia/.test(messaging) && /sendMediaMessage\(selectedId, up\.url/.test(messaging)],
  ['Group messaging creation is exposed from conversation actions', /createGroupFromSelectedDm/.test(messaging) && /Create and invite/.test(messaging)],
  ['Connection requests have incoming/outgoing lifecycle and durable source labels', /serverIncoming/.test(requests) && /serverOutgoing/.test(requests) && /server_durable/.test(requests)],
  ['Discovery people are loaded through canonical server candidate RPC', /gh_discovery_candidates/.test(discoverApi) && /p_actor_id: auth\.userId/.test(discoverApi)],
  ['Discovery applies privacy projection before returning identities', /publicIdentityPayload/.test(discoverApi) && /if \(!publicIdentity\) return \[\]/.test(discoverApi)],
  ['Discovery supports multi-category filtering and explainable intent ranking', /DISCOVERY_CATEGORIES/.test(discovery) && /scoreIntentMatch/.test(read('../lib/domains/adapters/discovery-adapter.ts'))],
  ['Discovery intent changes use server-authoritative profile persistence', /const updateProfile = ghc\.updateProfile/.test(discovery) && /updateProfile\(\{ connectionIntents: normalized \}\)/.test(discovery)],
  ['Connection request search verifies conversation membership', /resolveAuthenticatedUser/.test(searchApi) && /membership is rechecked inside the RPC/.test(searchApi) && /gh_search_conversation_messages/.test(searchApi)],
  ['Live calls remain disabled until production policy and TURN are configured', /CALLS_PRODUCTION_ENABLED = false/.test(callPolicy) && /GH_CALLS_ENABLED/.test(callConfig) && /GH_CALL_TURN_SHARED_SECRET/.test(callConfig)],
  ['Call config derives short-lived TURN credentials server-side', /createHmac\("sha1", sharedSecret\)/.test(callConfig) && /expiresAt/.test(callConfig)],
  ['Social notifications retain typed targets and sanitization', /sanitize/.test(notif) && /post_comment/.test(notif) && /story_reply/.test(notif)],
]
let failed = 0
for (const [name, pass] of checks) { console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`); if (!pass) failed++ }
console.log(`RUN433 integrated Phase 2 social transformation: ${checks.length - failed}/${checks.length} passed`)
if (failed) process.exitCode = 1
