#!/usr/bin/env node
/** RUN428: cross-domain Phase 1 social/connections source-contract gate. */
import { readFileSync } from "node:fs"
const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8")
const community = read("components/ghc/communities-screen.tsx")
const hub = read("components/ghc/premium-community-hub.tsx")
const communityPlatform = read("app/api/communities/[id]/platform/route.ts")
const communityMembers = read("app/api/communities/[id]/members/route.ts")
const communityRequests = read("app/api/communities/[id]/requests/route.ts")
const messagesUi = read("components/ghc/message-screen.tsx")
const messagesApi = read("app/api/messaging/conversations/[conversationId]/messages/route.ts")
const messageStore = read("lib/server/messaging/message-store.ts")
const context = read("contexts/ghc-context.tsx")
const discoveryUi = read("components/ghc/discovery-grid-screen.tsx")
const discoveryApi = read("app/api/social/people/discover/route.ts")
const connectionRequest = read("app/api/connections/request/route.ts")
const connectionAccept = read("app/api/connections/accept/route.ts")
const connectionDecline = read("app/api/connections/decline/route.ts")
const targets = read("lib/notification-targets.ts")
let passed = 0, failed = 0
const check = (name, ok) => { if (ok) { passed++; console.log(`PASS ${name}`) } else { failed++; console.error(`FAIL ${name}`) } }
// Community workspace + server boundary.
check("Community directory separates My, Managed, Invitations and Discover", /"my" \| "managed" \| "invitations" \| "discover"/.test(community))
check("Community workspace has Board, Chat, Members, Events, Resources and About", ["board", "chat", "members", "events", "resources", "about"].every((tab) => new RegExp(`id: "${tab}"`).test(hub)))
check("Community resources are loaded from the existing platform projection", /gh_community_platform_get/.test(communityPlatform) && /'resources'/.test(read("supabase/migrations/20261023030001_gh_community_platform_v2.sql")))
check("Community member directory is authenticated and server-paginated", /resolveAuthenticatedUser/.test(communityMembers) && /gh_community_member_directory/.test(communityMembers) && /auth\.source !== "gh_session"/.test(communityMembers))
check("Join-request decisions use authenticated actor and server RPC", /resolveAuthenticatedUser/.test(communityRequests) && /gh_community_join_decide/.test(communityRequests))
check("Community mutations remain gated by durable store availability", /socialDbConfigured\(\)/.test(communityPlatform) && /nonDurableWriteResponse/.test(communityPlatform))
// Messages: inbox, requests, durability, idempotency and offline recovery.
check("Inbox retains All, DMs, Unread, Requests, Communities and Archived filters", /type InboxFilter = "all" \| "dms" \| "unread" \| "requests" \| "communities" \| "archived"/.test(messagesUi))
check("Message reads and writes require authenticated session", /resolveAuthenticatedUser/.test(messagesApi))
check("Message reads and writes re-check conversation membership", /isMember\(cid, uid\)/.test(messageStore))
check("Message writes preserve client-message idempotency", /client_message_id/.test(messageStore) && /clientMessageId/.test(messagesApi))
check("Message API validates owned attachments and durable store response", /validateOwnedMediaAttachments/.test(messagesApi) && /isMessagingStoreDurable/.test(messagesApi))
check("Offline message queue is flushed on reconnect by the canonical context", /flushQueuedMessages/.test(context) && /apiSendMessageWithRetry/.test(context))
check("Message UI restores unsent draft and exposes failed-message retry", /setDraft\(text\)/.test(messagesUi) && /msg\.status === "failed"/.test(messagesUi))
// Discovery and connections.
check("Discovery uses the server candidate RPC rather than fabricating profiles", /gh_discovery_candidates/.test(discoveryApi) && /SOCIAL_DB_UNAVAILABLE/.test(discoveryApi))
check("Discovery applies block and privacy projection before returning people", /publicIdentityPayload/.test(discoveryApi) && /profileVisibility/.test(discoveryApi) && /whoCanDiscover/.test(discoveryApi))
check("Discovery exposes People, Friends, Professionals and Collaborators categories", ["people", "friends", "professionals", "collaborators"].every((id) => new RegExp(`id: "${id}"`).test(discoveryUi)))
check("Discovery excludes self, connected, pending and blocked identities client-side", /blockedUsers/.test(discoveryUi) && /outgoingFriendRequestIds/.test(discoveryUi) && /incomingFriendRequestIds/.test(discoveryUi) && /isSameIdentity\(id\)/.test(discoveryUi))
check("Connection request actor is session-derived and requests are rate-limited", /resolveAuthenticatedUser/.test(connectionRequest) && /enforceUserMutationRateLimit/.test(connectionRequest))
check("Connection accept and decline are authenticated server mutations", /resolveAuthenticatedUser/.test(connectionAccept) && /resolveAuthenticatedUser/.test(connectionDecline))
// Shared notifications / navigation.
check("Notification targets use canonical typed resolver and sanitization", /resolveNotificationDeepLinkFromRecord/.test(targets) && /sanitizeNotificationDeepLink/.test(targets))
console.log(`${passed}/${passed + failed} passed`)
process.exit(failed ? 1 : 0)
