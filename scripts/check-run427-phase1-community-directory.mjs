#!/usr/bin/env node
/** RUN427 Phase 1 community workspace contracts. */
import { readFileSync } from "node:fs"
const source = readFileSync(new URL("../components/ghc/communities-screen.tsx", import.meta.url), "utf8")
const api = readFileSync(new URL("../app/api/communities/route.ts", import.meta.url), "utf8")
const hub = readFileSync(new URL("../components/ghc/premium-community-hub.tsx", import.meta.url), "utf8")
let passed = 0, failed = 0
const check = (name, ok) => { if (ok) { passed++; console.log(`PASS ${name}`) } else { failed++; console.error(`FAIL ${name}`) } }
check("Directory exposes My, Managed, Invitations and Discover states", /type DirectoryTab = "my" \| "managed" \| "invitations" \| "discover"/.test(source))
check("Managed membership is derived from owner/admin/moderator roles", /\["owner", "admin", "moderator"\]\.includes\(role\)/.test(source))
check("Creator identity is recognized using identity alias matching", /community\.createdBy && isSameIdentity\(community\.createdBy\)/.test(source))
check("Management controls remain server-authorized", /every management action is re-authorized by its API/.test(source))
check("Directory role enrichment comes from authenticated membership RPC", /gh_community_list_memberships/.test(api) && /c\.viewerRole = m\.role/.test(api))
check("Invitation inbox derives from authenticated durable invitation RPC, not local membership cache", /invitationCommunities/.test(source) && /durableInvitations/.test(source) && /api\/communities\/invitations/.test(source) && /durableInvitations\.filter\(\(c\) => Boolean\(c\.invitationId\)\)/.test(source))
check("Discover excludes invitations and only shows discoverable or pending rows", /return state === "discoverable" \|\| state === "pending"/.test(source))
check("Existing invitation accept and decline actions are wired", /handleAcceptCommunityInvitation\(community\.id\)/.test(source) && /handleDeclineCommunityInvitation\(community\.id\)/.test(source))
check("Community workspace has a dedicated Resources destination", /id: "resources", label: "Resources"/.test(hub) && /tab === "resources"/.test(hub))
check("Resources use the existing community resource projection", /\(community as any\)\.resources/.test(hub) && /PinnedResourceCard/.test(hub))
check("Existing Discover and My directory states remain present", /directory === "discover"/.test(source) && /directory === "my"/.test(source))
console.log(`${passed}/${passed + failed} passed`)
process.exit(failed ? 1 : 0)
