import fs from "node:fs"
const app = fs.readFileSync("components/ghc/app.tsx", "utf8")
const checks = [
  ["Messages tab badge shows a count pill, other tabs keep the dot", /id === "messages"\s*\? "absolute -right-2\.5 -top-1\.5 flex h-4 min-w-4/.test(app) && /h-2\.5 w-2\.5 rounded-full bg-rose-500/.test(app)],
  ["badge count is capped and locale-formatted", /unreadMessageCount > 99 \? "99\+" : regional\.formatNumber\(unreadMessageCount\)/.test(app)],
  ["badge keeps its accessible name and hides while on Messages", /activeTab !== "messages"/.test(app) && /unread message\$\{unreadMessageCount === 1/.test(app)],
  ["toast accepts an optional dismiss handler", /onDismiss\?: \(\) => void/.test(app)],
  ["toast dismiss button has an accessible name and a 44px target", /aria-label="Dismiss message"/.test(app) && /h-11 w-11 shrink-0/.test(app)],
  ["toast host wires dismiss to the hidden-id set (timers still expire)", /onDismiss=\{\(\) => setHiddenToastIds\(\(current: Set<string>\) => new Set\(current\)\.add\(toast\.id\)\)\}/.test(app) && /duration = toast\.type === "error" \? 6500 : 3200/.test(app)],
  ["X icon is imported", /UserRound, Users, X \} from "lucide-react"/.test(app)],
]
let failed = 0
for (const [n, ok] of checks) { console.log(`${ok ? "PASS" : "FAIL"} ${n}`); if (!ok) failed++ }
console.log(`RUN501 messages count badge and toast dismiss: ${checks.length - failed}/${checks.length} passed`)
if (failed) process.exit(1)
