import fs from "node:fs"

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8")
const collectionStore = read("../lib/feed-profile-experience.ts")
const collectionSheet = read("../components/ghc/save-to-collection.tsx")
const feed = read("../components/ghc/enhanced-feed-screen.tsx")
const comments = read("../app/api/social/posts/[id]/comments/route.ts")
const reactions = read("../app/api/social/posts/[id]/reactions/route.ts")
const saves = read("../app/api/social/saves/route.ts")
const shares = read("../app/api/social/posts/[id]/share/route.ts")
const stories = read("../components/ghc/profile-story-section.tsx")
const storyReaction = read("../app/api/social/stories/[id]/reactions/route.ts")
const notificationTargets = read("../lib/notification-targets.ts")

const checks = [
  ["collection writes return an explicit persistence result", /savePostToCollectionWithStatus[\s\S]{0,500}persisted: persistCollections/.test(collectionStore)],
  ["storage failures are not swallowed as successful collection writes", /function persistCollections[\s\S]{0,280}localStorage\.setItem[\s\S]{0,140}return true[\s\S]{0,100}catch[\s\S]{0,80}return false/.test(collectionStore)],
  ["collection creation reports persistence status", /createCollectionWithStatus[\s\S]{0,900}persisted: persistCollections/.test(collectionStore)],
  ["legacy collection helpers retain their return contracts", /function savePostToCollection\([\s\S]{0,180}\.collections/.test(collectionStore) && /function createCollection\([\s\S]{0,160}\.collection/.test(collectionStore)],
  ["collection picker only confirms after successful local persistence", /savePostToCollectionWithStatus\([\s\S]{0,240}if \(!result\.persisted\)[\s\S]{0,300}onSaved\?\.\(c\.name\)/.test(collectionSheet)],
  ["collection creation surfaces storage failure and preserves the sheet", /createCollectionWithStatus\([\s\S]{0,600}if \(!created\.persisted\)[\s\S]{0,250}return[\s\S]{0,300}savePostToCollectionWithStatus/.test(collectionSheet)],
  ["collection storage failure is announced accessibly", /storageError \? <p role="alert"/.test(collectionSheet)],
  ["bookmarks remain server-authoritative and roll back optimistic state on failure", /const saved = savePost \? await savePost\(postId\) : false[\s\S]{0,160}if \(!saved\)[\s\S]{0,100}setBookmarkedPostIds\(previous\)/.test(feed)],
  ["comment reads and writes enforce authenticated post visibility", /resolveAuthenticatedUser[\s\S]{0,900}canViewSocialPost/.test(comments)],
  ["comment writes validate owned media and use the canonical v3 list path", /validateOwnedMediaAttachments/.test(comments) && /gh_comment_list_v3/.test(comments)],
  ["post reactions are bounded, authenticated and server-backed", /resolveAuthenticatedUser/.test(reactions) && /isDurableReactionType/.test(reactions) && /socialRpc\("gh_reaction_toggle"/.test(reactions)],
  ["saved-post reads are session-scoped and writes check visibility", /user_id: `eq\.\$\{auth\.userId\}`/.test(saves) && /canViewSocialPost\(auth\.userId, postId\)/.test(saves)],
  ["post shares require the canonical authenticated durable route", /resolveAuthenticatedUser/.test(shares) && /durable: true/.test(shares)],
  ["story replies remain private messages and retain text on failure", /sendMessage\(convId, `📷 Story reply/.test(stories) && /setReplyText\(""\)[\s\S]{0,200}setViewing\(null\)/.test(stories)],
  ["story reactions use the canonical durable RPC", /gh_story_reaction_toggle/.test(storyReaction) && /durable: true/.test(storyReaction)],
  ["social notification targets retain typed content deep links", /story_reply/.test(notificationTargets) && /post_comment/.test(notificationTargets) && /sanitize/.test(notificationTargets)],
]

let failed = 0
for (const [name, pass] of checks) {
  console.log(`${pass ? "PASS" : "FAIL"} ${name}`)
  if (!pass) failed += 1
}
console.log(`RUN430 Phase 2 social engagement contract: ${checks.length - failed}/${checks.length} passed`)
if (failed) process.exitCode = 1
