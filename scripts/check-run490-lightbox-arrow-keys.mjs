import fs from "node:fs"
const src = fs.readFileSync("components/ghc/media-lightbox.tsx", "utf8")
const checks = [
  ["gallery arrows are ignored inside inputs, video, audio, sliders and text boxes", /target\.closest\('input, textarea, select, video, audio, \[role="slider"\], \[role="textbox"\]'\)/.test(src)],
  ["modifier combinations are ignored", /if \(ownsArrows \|\| e\.altKey \|\| e\.ctrlKey \|\| e\.metaKey\) return/.test(src)],
  ["previous and next navigation are preserved", /e\.key === "ArrowLeft"\) goPrev\(\)/.test(src) && /e\.key === "ArrowRight"\) goNext\(\)/.test(src)],
  ["Escape, focus trap and scroll lock still come from useDialogA11y", /useDialogA11y/.test(src)],
]
let failed = 0
for (const [n, ok] of checks) { console.log(`${ok ? "PASS" : "FAIL"} ${n}`); if (!ok) failed++ }
console.log(`RUN490 lightbox arrow keys: ${checks.length - failed}/${checks.length} passed`)
if (failed) process.exit(1)
