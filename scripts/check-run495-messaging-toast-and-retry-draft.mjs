import fs from "node:fs"
const src = fs.readFileSync("components/ghc/message-screen.tsx", "utf8")
const app = fs.readFileSync("components/ghc/app.tsx", "utf8")
const checks = [
  ["app toast listener reads `type`, not `tone`", /detail\?: ?\{|CustomEvent<\{ message\?: string; type\?: string \}>/.test(app) && !/d\.tone/.test(app)],
  ["no ghc:toast dispatch in messaging relies on the ignored `tone` field for failures", !/ghc:toast[^\n]*tone: "warning"/.test(src)],
  ["messaging failure toasts are errors", (src.match(/ghc:toast[^\n]*type: "error"/g) || []).length >= 6],
  ["failed-send retry never overwrites the draft being typed", (src.match(/setDraft\(\(current\) => \(current\.trim\(\) \? current : msg\.text\)\)/g) || []).length === 2],
  ["no retry path writes msg.text straight into the draft", !/setDraft\(msg\.text\)/.test(src)],
]
let failed = 0
for (const [n, ok] of checks) { console.log(`${ok ? "PASS" : "FAIL"} ${n}`); if (!ok) failed++ }
console.log(`RUN495 messaging toast and retry draft: ${checks.length - failed}/${checks.length} passed`)
if (failed) process.exit(1)
