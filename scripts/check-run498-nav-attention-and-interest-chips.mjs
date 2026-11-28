import fs from "node:fs"
const app = fs.readFileSync("components/ghc/app.tsx", "utf8")
const helper = fs.readFileSync("lib/messaging/unread-attention.ts", "utf8")
const prov = fs.readFileSync("contexts/domains/messaging-provider.tsx", "utf8")
const prof = fs.readFileSync("components/ghc/profile-components.tsx", "utf8")
const checks = [
  ["app shell derives message badge from the shared attention helper", /messagesAttentionCount\(conversations\)/.test(app) && /from "@\/lib\/messaging\/unread-attention"/.test(app)],
  ["app shell derives community badge from the shared attention helper", /groupsAttentionCount\(conversations\)/.test(app)],
  ["app shell no longer sums raw unread fields inline", !/count \+ \(typeof \(conversation as \{ unreadCount\?: number \}\)\.unreadCount/.test(app)],
  ["helper excludes archived and muted conversations", /c\.isArchived \|\| isConversationMutedNow/.test(helper)],
  ["helper honours expired timed mutes", /until > 0 && until <= now/.test(helper)],
  ["helper has no app-path imports (unit-testable)", !/from "@\//.test(helper)],
  ["messaging provider shares the same attention helper (no divergent copy)", /messagesAttentionCount\(conversations\)/.test(prov) && !/c\.unread \? 1 : 0/.test(prov)],
  ["both interest chip remove buttons have accessible names", (prof.match(/aria-label=\{`Remove interest \$\{interest\}`\}/g) || []).length === 2],
  ["interest chip icons are hidden from assistive tech", !/<X size=\{14\} \/>/.test(prof) && !/<X size=\{12\} \/>\n\s+<\/button>/.test(prof)],
]
let failed = 0
for (const [n, ok] of checks) { console.log(`${ok ? "PASS" : "FAIL"} ${n}`); if (!ok) failed++ }
console.log(`RUN498 nav attention and interest chips: ${checks.length - failed}/${checks.length} passed`)
if (failed) process.exit(1)
