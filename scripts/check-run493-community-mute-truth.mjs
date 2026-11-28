import fs from "node:fs"
const hub = fs.readFileSync("components/ghc/premium-community-hub.tsx", "utf8")
const scr = fs.readFileSync("components/ghc/communities-screen.tsx", "utf8")
const prof = fs.readFileSync("components/ghc/profile-screen.tsx", "utf8")
const checks = [
  ["hub has no local chatMuted flag", !/chatMuted/.test(hub)],
  ["mute button reflects server community.isMuted and shows a busy state", /aria-pressed=\{!!community\.isMuted\}/.test(hub) && /muteBusy \? "Saving…"/.test(hub)],
  ["mute button is disabled without a handler and while saving", /disabled=\{muteBusy \|\| !onMute\}/.test(hub)],
  ["mute handler may be async", /onMute\?: \(\) => void \| Promise<void>/.test(hub)],
  ["screen mute handler reports failures instead of leaving an unhandled rejection", /Could not mute this community/.test(scr) && /Could not unmute this community/.test(scr)],
  ["membership re-check ignores non-ok responses", /\(r\.ok \? r\.json\(\) : null\)/.test(prof) && /if \(!data\) return/.test(prof)],
]
let failed = 0
for (const [n, ok] of checks) { console.log(`${ok ? "PASS" : "FAIL"} ${n}`); if (!ok) failed++ }
console.log(`RUN493 community mute truth: ${checks.length - failed}/${checks.length} passed`)
if (failed) process.exit(1)
