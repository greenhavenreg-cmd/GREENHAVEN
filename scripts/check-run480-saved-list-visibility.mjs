import fs from "node:fs"
import assert from "node:assert/strict"
const src = fs.readFileSync("app/api/social/saves/route.ts", "utf8")
const get = src.slice(src.indexOf("export async function GET"), src.indexOf("export async function POST"))
const checks = [
  ["GET handler found", get.length > 200],
  ["saved list imports the batch visibility filter", /import \{ canViewSocialPost, filterVisibleSocialPosts \}/.test(src)],
  ["saved ids are filtered through one batched visibility call", (get.match(/filterVisibleSocialPosts\(/g) || []).length === 1 && !/canViewSocialPost\(/.test(get)],
  ["returned ids and count come from the filtered list", /const postIds = visibleIds \? savedIds\.filter/.test(get) && /count: postIds\.length/.test(get)],
  ["unverifiable policy data degrades to the member's own ids, flagged as unfiltered", /visible === null/.test(get) && /filtered: visibleIds !== null/.test(get)],
  ["response stays uncached and durable-only", /Cache-Control": "no-store"/.test(get) && /durable: true/.test(get)],
  ["save toggle still lets members remove an unreachable save", /alreadySaved/.test(src) && /ownSaveExists/.test(src)],
  ["unreachable saves are not re-addable (404 unless already saved)", /POST_NOT_FOUND/.test(src)],
]
for (const [n, p] of checks) { console.log(`${p ? "PASS" : "FAIL"} ${n}`); assert.ok(p, n) }
console.log(`RUN480 saved list visibility: ${checks.length}/${checks.length} passed`)
