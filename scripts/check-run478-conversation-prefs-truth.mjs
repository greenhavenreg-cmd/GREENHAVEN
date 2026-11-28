import fs from "node:fs"
import assert from "node:assert/strict"
const md = fs.readFileSync("lib/domains/messaging-domain.ts", "utf8")
const cd = fs.readFileSync("lib/domains/create-domains.ts", "utf8")
const helper = md.slice(md.indexOf("async function persistConversationPrefs"))
const checks = [
  ["pin, archive and mute all persist through one checked helper", (md.match(/await persistConversationPrefs\(/g) || []).length === 3],
  ["no unchecked prefs PATCH remains in the messaging domain", !/\/prefs`,\s*\{\s*method: "PATCH"[\s\S]{0,400}\/\* local prefs already applied \*\//.test(md.slice(0, md.indexOf("async function persistConversationPrefs")))],
  ["rejected write rolls back the local change", /if \(response\.ok\) return\s*\n\s*rollback\(\)/.test(helper)],
  ["rejected write fails the mutation with a user-safe message", /throw new Error\(/.test(helper) && /Could not save this conversation setting/.test(helper)],
  ["offline or timeout keeps local-first behaviour", /catch \{\s*\n\s*return\s*\n\s*\}/.test(helper)],
  ["request is time-bounded and sends the session", /AbortSignal\.timeout\(10_000\)/.test(helper) && /credentials: "include"/.test(helper)],
  ["rollback restores the pre-change value for each preference", /isPinned: Boolean\(conv\.isPinned\)/.test(md) && /isArchived: Boolean\(conv\.isArchived\)/.test(md) && /isMuted: Boolean\(conv\.isMuted\)/.test(md)],
  ["restrict/unrestrict checks the response and toasts on rejection", /const restrictRes = await fetch\("\/api\/social\/restricts"/.test(cd) && /!restrictRes\.ok/.test(cd) && /GHC_APP_EVENTS\.TOAST/.test(cd)],
]
for (const [n, p] of checks) { console.log(`${p ? "PASS" : "FAIL"} ${n}`); assert.ok(p, n) }
console.log(`RUN478 conversation preference truth: ${checks.length}/${checks.length} passed`)
