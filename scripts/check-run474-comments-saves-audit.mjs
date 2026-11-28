import { readFileSync } from "node:fs"
let failures = 0
const assert = (ok, msg) => { if (!ok) { failures += 1; console.error(`FAIL: ${msg}`) } else console.log(`PASS ${msg}`) }
const read = (p) => readFileSync(p, "utf8")

const c = read("app/api/social/posts/[id]/comments/route.ts")
assert(/POST_ID_SHAPE\.test\(postId\)/.test(c) && (c.match(/POST_ID_SHAPE\.test/g) || []).length === 2, "comment GET and POST validate the post id shape")
assert(/\}\)\(\)\.catch\(\(\) => undefined\)/.test(c), "comment side effects cannot raise an unhandled rejection")
assert(/canViewSocialPost\(uid, postId\)\) !== true/.test(c), "mention notices go only to members who can open the post")
assert(/replace\(\/_\/g/.test(c), "mention lookup escapes the LIKE underscore wildcard")
assert(/AbortSignal\.timeout\(8_000\)/.test(c) && /if \(!r\.ok\) return/.test(c), "mention lookup is bounded and checks the response")
assert(/INVALID_COMMENT_TEXT/.test(c) && /INVALID_BODY/.test(c), "comment create rejects non-object bodies and non-string text")
assert(!/rpcReadSucceeded/.test(c), "dead comment read flag removed")

const ci = read("app/api/social/posts/[id]/comments/[commentId]/route.ts")
assert((ci.match(/ID_SHAPE\.test\(cid\)/g) || []).length === 2, "comment edit/delete validate id shape")
assert(/INVALID_BODY/.test(ci), "comment edit rejects non-object bodies")

const sv = read("app/api/social/saves/route.ts")
assert(/ownSaveExists/.test(sv) && /SAVES_UNAVAILABLE/.test(sv), "a saved post that became unreachable can still be unsaved")
assert(sv.indexOf("socialDbConfigured()", sv.indexOf("export async function POST")) < sv.indexOf("canViewSocialPost(auth.userId, postId)"), "save toggle checks durability before visibility")

if (failures) process.exit(1)
console.log("RUN474 comments and saves audit contract passed")
