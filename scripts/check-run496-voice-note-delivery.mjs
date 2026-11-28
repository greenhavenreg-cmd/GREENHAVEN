import fs from "node:fs"
const src = fs.readFileSync("components/ghc/message-screen.tsx", "utf8")
const i = src.indexOf("recordVoiceNote({ maxMs")
const body = src.slice(i, i + 3500)
const checks = [
  ["uploaded voice note is actually sent via sendMediaMessage", /await sendMediaMessage\(selectedId, up\.url, "file", file\.name\)/.test(body)],
  ["no success toast is claimed for a voice note that was not sent", !/Voice note recorded\. Delivery follows/.test(src)],
  ["missing sender or url is reported as an error", /Voice note uploaded but could not be sent/.test(body) && /"url" in up && up\.url/.test(body)],
  ["no messaging toast uses the ignored tone field", !/ghc:toast[\s\S]{0,200}tone:/.test(src)],
]
let failed = 0
for (const [n, ok] of checks) { console.log(`${ok ? "PASS" : "FAIL"} ${n}`); if (!ok) failed++ }
console.log(`RUN496 voice note delivery: ${checks.length - failed}/${checks.length} passed`)
if (failed) process.exit(1)
