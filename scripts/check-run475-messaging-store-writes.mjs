import { readFileSync } from "node:fs"
let failures = 0
const assert = (ok, msg) => { if (!ok) { failures += 1; console.error(`FAIL: ${msg}`) } else console.log(`PASS ${msg}`) }
const read = (p) => readFileSync(p, "utf8")

const ms = read("lib/server/messaging/message-store.ts")
const restFn = ms.slice(ms.indexOf("async function rest<T>("), ms.indexOf("export function isMessagingStoreDurable"))
assert(/method: init\?\.method \|\| "GET"/.test(restFn), "message store rest() forwards the caller method")
assert(/body: init\?\.body/.test(restFn) && /headers\.Prefer = init\.prefer/.test(restFn), "message store rest() forwards body and Prefer")
assert(!/method: "GET", timeoutMs: 8000/.test(restFn), "message store rest() no longer hard-codes GET")

const del = ms.slice(ms.indexOf("export async function softDeleteMessage"), ms.indexOf("async function markMessagesDelivered"))
assert(/return=representation/.test(del) && /select=id/.test(del), "message delete reads back the rows it changed")
assert(/res\.data\.length > 0/.test(del) && /error: "NOT_FOUND"/.test(del) && /error: "FORBIDDEN"/.test(del), "message delete distinguishes changed, missing and not-yours")
assert(!/if \(!res\.ok && isProd\(\)\) return/.test(del), "message delete no longer reports success after a failed write outside production")

const vs = read("lib/server/verification/request-store.ts")
const vrest = vs.slice(vs.indexOf("async function rest<T>("), vs.indexOf("async function rest<T>(") + 1500)
assert(/method: init\.method \|\| "GET"/.test(vrest) && /body: init\.body/.test(vrest), "verification store rest() forwards method and body")

const route = read("app/api/messaging/conversations/[conversationId]/messages/route.ts")
assert((route.match(/result\.error === "NOT_FOUND" \? 404 : 503/g) || []).length === 2, "pin and delete map store failures to 503, not 404")

if (failures) process.exit(1)
console.log("RUN475 messaging store write contract passed")
