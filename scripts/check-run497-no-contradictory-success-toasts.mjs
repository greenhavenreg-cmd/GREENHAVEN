import fs from "node:fs"
const settings = fs.readFileSync("components/ghc/settings.tsx", "utf8")
const comment = fs.readFileSync("components/ghc/comment-sheet.tsx", "utf8")
const comm = fs.readFileSync("components/ghc/communities-screen.tsx", "utf8")
const ctx = fs.readFileSync("contexts/ghc-context.tsx", "utf8")
const checks = [
  ["context unblock/report/mute actions toast their own outcome", /addToast\("User unblocked", "success"\)/.test(ctx) && /Thank you\. We'll review this/.test(ctx) && /Could not mute this conversation/.test(ctx)],
  ["settings unblock adds no second success toast", !/message: "User unblocked", type: "success"/.test(settings)],
  ["comment report adds no second success toast", !/addToast\("Report submitted for review", "success"\)/.test(comment)],
  ["community mute/unmute adds no second success toast", !/addToast\("Community unmuted", "success"\)/.test(comm) && !/Community muted — you remain a member/.test(comm)],
  ["failure paths still report errors", /Could not unblock/.test(settings) && /Could not submit report/.test(comment) && /Could not mute this community/.test(comm)],
]
let failed = 0
for (const [n, ok] of checks) { console.log(`${ok ? "PASS" : "FAIL"} ${n}`); if (!ok) failed++ }
console.log(`RUN497 no contradictory success toasts: ${checks.length - failed}/${checks.length} passed`)
if (failed) process.exit(1)
