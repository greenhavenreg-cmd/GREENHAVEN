import { readFileSync } from "node:fs"
let failures = 0
const assert = (ok, msg) => { if (!ok) { failures += 1; console.error(`FAIL: ${msg}`) } else console.log(`PASS ${msg}`) }
const read = (p) => readFileSync(p, "utf8")

const notif = read("lib/server/social/notifications.ts")
assert(!/rest\.local/.test(notif), "notification lookups no longer fetch the placeholder rest.local host")
assert((notif.match(/restBase\(env\.supabaseUrl\)/g) || []).length === 4, "all four post/comment lookups use the real PostgREST base URL")

const del = read("app/api/social/posts/[id]/route.ts")
assert(/data\?\.ok === false \|\| \(data\?\.ok !== true && data\?\.error\)/.test(del), "delete never reports success for an ok:false RPC answer")

const edit = read("app/api/social/posts/[id]/edit/route.ts")
assert(/enforceUserMutationRateLimit/.test(edit), "edit is rate limited")
assert(/MEDIA_FACADE_PATH/.test(edit) && /existing\.has\(s\)/.test(edit), "edit round-trips existing first-party media but cannot attach new media")
assert(/select=author_id,deleted_at,archived_at,images,video,pdf/.test(edit), "edit reads current media before validating")
assert(/POST_UNAVAILABLE/.test(edit), "edit read failure is 503, not 404")
assert(/deleted_at=is\.null`/.test(edit), "edit write is guarded against a concurrent delete")
assert(/finalImageCount === 0 && !finalHasVideo && !rows\[0\]\.pdf/.test(edit), "media-only posts can be edited without text")

for (const r of ["ghpv", "reward"]) {
  const s = read(`app/api/social/posts/[id]/${r}/route.ts`)
  assert(/canViewSocialPost\(access\.auth\.userId, postId\)/.test(s), `${r} read follows post visibility`)
}

const cur = read("app/api/social/posts/[id]/curation/route.ts")
assert(/\.catch\(\(\) => undefined\)/.test(cur), "curation notification cannot raise an unhandled rejection")
assert(/REDISTRIBUTE_UNAVAILABLE/.test(cur), "redistribution failure does not fail a durable vote")
assert(/finalChoice === "upvote"/.test(cur) && !/isDown = choice/.test(cur), "curation notice uses the server-confirmed choice")
assert(/\^\[a-zA-Z0-9_-\]\{1,128\}\$/.test(cur), "curation validates the post id shape")

const list = read("app/api/social/posts/[id]/curation/list/route.ts")
assert(/INVALID_CHOICE/.test(list), "curation roster validates the choice filter")

const create = read("app/api/social/posts/route.ts")
assert(/canViewSocialPost\(auth\.userId, quoteOf\)/.test(create), "a quote is attached only when the author can see the original")
assert(/slice\(0, 120\)/.test(create) && /slice\(0, 180\)/.test(create), "create bounds client-supplied community and listing labels")
assert(create.indexOf("CONTENT_TOO_LONG") < create.indexOf("await resolveMediaAssets("), "create rejects oversize text before media work")

const guards = read("lib/curation/client-curation-guards.ts")
for (const code of ["SELF_CURATION_FORBIDDEN", "DAILY_CURATION_LIMIT", "CURATION_REVIEW_REQUIRED", "CURATION_INTELLIGENCE_UNAVAILABLE"]) {
  assert(guards.includes(`"${code}"`), `client maps server curation error ${code}`)
}

if (failures) process.exit(1)
console.log("RUN473 post and curation audit contract passed")
