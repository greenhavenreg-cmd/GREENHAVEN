import { readFileSync } from "node:fs"
let failures = 0
const assert = (ok, msg) => { if (!ok) { failures += 1; console.error(`FAIL: ${msg}`) } else console.log(`PASS ${msg}`) }
const ms = readFileSync("lib/server/messaging/message-store.ts", "utf8")

const helper = ms.slice(ms.indexOf("async function ensureSendReceipts("), ms.indexOf("async function markMessagesDelivered("))
assert(helper.length > 0 && /attempt < 2/.test(helper), "send receipts are retried once")
assert(/resolution=ignore-duplicates/.test(helper), "send receipts ignore duplicates so replays are safe")

const send = ms.slice(ms.indexOf("if (dbConfigured()) {\n    const ins = await rest"), ms.indexOf("const list = memMessages.get(cid) || []"))
assert(/ensureSendReceipts\(cid, msg\.id, uid\)/.test(send), "fresh sends write receipts through the shared helper")
assert(/ensureSendReceipts\(cid, prior\.id, uid\)/.test(send), "idempotent replays backfill missing receipts")
assert(!/if \(isProd\(\)\) return \{ ok: false, error: "PERSIST_FAILED" \}/.test(send) && /return \{ ok: false, error: "PERSIST_FAILED" \}/.test(send), "a rejected insert is PERSIST_FAILED in every environment")

const read = ms.slice(ms.indexOf("export async function markConversationRead"), ms.indexOf("export async function toggleMessageReaction"))
assert(/if \(!marked\.ok \|\| marked\.data !== true\) return \{ ok: false, error: "RECEIPT_UPDATE_FAILED" \}/.test(read), "mark-read failure is reported in every environment")

if (failures) process.exit(1)
console.log("RUN476 messaging send/receipt contract passed")
