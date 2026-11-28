import fs from "node:fs"
import assert from "node:assert/strict"
const form = fs.readFileSync("components/field/public-research-form.tsx", "utf8")
const studio = fs.readFileSync("components/field/research-studio-client.tsx", "utf8")
const count = (re, s) => (s.match(re) || []).length
const checks = [
  ["question DOM id helper sanitizes ids", /const questionDomId = \(id: string\) => `rq-\$\{String\(id\)\.replace\(\/\[\^A-Za-z0-9_-\]\/g, "_"\)\}`/.test(form)],
  ["question label has an id and links to single controls with htmlFor", /<label id=\{`\$\{questionDomId\(q\.id\)\}-label`\} htmlFor=\{SINGLE_CONTROL_TYPES\.includes\(q\.type\)\?questionDomId\(q\.id\):undefined\}/.test(form)],
  ["all five single-control question inputs carry the matching id", count(/<(textarea|input|select) id=\{questionDomId\(q\.id\)\}/g, form) === 7],
  ["single-control types list covers the five control branches", /SINGLE_CONTROL_TYPES = \["long_text", "short_text", "date", "number", "rating", "dropdown"\]/.test(form)],
  ["choice questions are a labelled group/radiogroup", /role=\{q\.type==="multiple_choice"\?"group":"radiogroup"\} aria-labelledby=\{`\$\{questionDomId\(q\.id\)\}-label`\}/.test(form)],
  ["answer state, validation and submit payload are unchanged", /required=\{q\.required\}/.test(form) && /setAnswer\(q\.id,e\.target\.value\)/.test(form) && /JSON\.stringify\(\{answers:Object\.fromEntries\(visibleQuestions/.test(form)],
  ["election contest type, date and member role selects are named", /<select aria-label="Contest type"/.test(studio) && /<input aria-label="Election date" type="date"/.test(studio) && /<select aria-label="Member role"/.test(studio)],
  ["contest and member forms still submit through their handlers", /onSubmit=\{createContest\}/.test(studio) && /onSubmit=\{assignAgent\}/.test(studio)],
]
for (const [n, p] of checks) { console.log(`${p ? "PASS" : "FAIL"} ${n}`); assert.ok(p, n) }
console.log(`RUN486 research form labels: ${checks.length}/${checks.length} passed`)
