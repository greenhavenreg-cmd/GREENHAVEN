import fs from "node:fs"
const src = fs.readFileSync("components/ghc/profile-story-section.tsx", "utf8")
const checks = [
  ["arrow keys are ignored while typing in inputs, textareas, selects and contenteditable", /target\.isContentEditable \|\| \/\^\(INPUT\|TEXTAREA\|SELECT\)\$\/\.test\(target\.tagName\)/.test(src) && /if \(editing \|\| event\.altKey \|\| event\.ctrlKey \|\| event\.metaKey\) return/.test(src)],
  ["Escape closes the viewers sheet before the story", /if \(viewersOpenRef\.current\) setViewersOpen\(false\)\s*else setViewing\(null\)/.test(src)],
  ["viewers-open state is mirrored into a ref by an effect, not during render", /useEffect\(\(\) => \{ viewersOpenRef\.current = viewersOpen \}, \[viewersOpen\]\)/.test(src)],
  ["arrow navigation, focus trap and scroll lock are preserved", /navigateStory\(1\)/.test(src) && /navigateStory\(-1\)/.test(src) && /a11y\.createFocusTrap\(root\)/.test(src) && /document\.body\.style\.overflow = "hidden"/.test(src)],
  ["story strip is a named region", /role="region" aria-label="Stories"/.test(src)],
  ["auto-advance still respects pause, video and reduced motion", /viewerPaused \|\| viewing\.media\?\.type === "video" \|\| prefersReducedMotion\(\)/.test(src)],
]
let failed = 0
for (const [n, ok] of checks) { console.log(`${ok ? "PASS" : "FAIL"} ${n}`); if (!ok) failed++ }
console.log(`RUN489 story viewer keys: ${checks.length - failed}/${checks.length} passed`)
if (failed) process.exit(1)
