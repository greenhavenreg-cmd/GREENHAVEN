import fs from "node:fs"
const form = fs.readFileSync("components/field/public-research-form.tsx", "utf8")
const studio = fs.readFileSync("components/field/research-studio-client.tsx", "utf8")
const exam = form.slice(form.indexOf("function ExamRunner"))
const checks = [
  ["exam question text has an id and each exam section is labelled by it", /<section key=\{q\.id\} aria-labelledby=\{`\$\{questionDomId\(q\.id\)\}-label`\}/.test(exam) && /<p id=\{`\$\{questionDomId\(q\.id\)\}-label`\}/.test(exam)],
  ["exam short and long text controls are named by the question", /<input id=\{questionDomId\(q\.id\)\} aria-labelledby=/.test(exam) && /<textarea id=\{questionDomId\(q\.id\)\} aria-labelledby=/.test(exam)],
  ["exam options are a labelled radiogroup", /role="radiogroup" aria-labelledby=\{`\$\{questionDomId\(q\.id\)\}-label`\}/.test(exam)],
  ["exam required marker is announced as text", /sr-only"> \(required\)/.test(exam)],
  ["exam clock is a timer that does not announce every second", /role="timer" aria-live="off"/.test(exam) && !/aria-live="polite">\{clock\}/.test(exam)],
  ["exam threshold announcements exist for five minutes and one minute", /Less than five minutes remaining/.test(exam) && /Less than one minute remaining/.test(exam)],
  ["exam answer state, save, submit and disabled handling are unchanged", /setAnswers\(p=>\(\{\.\.\.p,\[q\.id\]:option\}\)\)/.test(exam) && /disabled=\{busy\|\|remaining<=0\}/.test(exam) && /Submit examination/.test(exam)],
  ["studio preview questions are labelled and grouped", /id=\{`preview-\$\{q\.id\}-label`\}/.test(studio) && (studio.match(/aria-labelledby=\{`preview-\$\{q\.id\}-label`\}/g) || []).length === 4],
  ["studio preview answers state is unchanged", /setPreviewAnswers\(p=>\(\{\.\.\.p,\[q\.id\]:e\.target\.value\}\)\)/.test(studio)],
]
let failed = 0
for (const [name, ok] of checks) { console.log(`${ok ? "PASS" : "FAIL"} ${name}`); if (!ok) failed++ }
console.log(`RUN487 exam and preview labels: ${checks.length - failed}/${checks.length} passed`)
if (failed) process.exit(1)
