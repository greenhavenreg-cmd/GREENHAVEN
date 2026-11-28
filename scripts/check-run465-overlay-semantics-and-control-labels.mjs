import { readFileSync, readdirSync, statSync } from "node:fs"
import { join } from "node:path"

const read = (p) => readFileSync(p, "utf8")
let failures = 0
const assert = (ok, msg) => { if (!ok) { failures += 1; console.error(`FAIL: ${msg}`) } }

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".next") continue
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (p.endsWith(".tsx")) out.push(p)
  }
  return out
}

// Parse JSX opening tags, honouring quotes and {} nesting so `=>` and `>` inside props are safe.
function* openingTags(src, name) {
  const re = new RegExp(`<${name}(?=[\\s/>])`, "g")
  let m
  while ((m = re.exec(src))) {
    let i = m.index + m[0].length, depth = 0, quote = null
    for (; i < src.length; i++) {
      const c = src[i]
      if (quote) { if (c === quote && src[i - 1] !== "\\") quote = null }
      else if (depth === 0 && (c === '"' || c === "'")) quote = c
      else if (c === "{") depth++
      else if (c === "}") depth--
      else if (c === ">" && depth === 0 && src[i - 1] !== "=") break
    }
    yield { index: m.index, text: src.slice(m.index, i + 1) }
  }
}
function attrNames(tag) {
  const names = []
  let depth = 0, quote = null
  for (let i = 1; i < tag.length; i++) {
    const c = tag[i]
    if (quote) { if (c === quote && tag[i - 1] !== "\\") quote = null; continue }
    if (c === "{") { depth++; continue }
    if (c === "}") { depth--; continue }
    if (depth > 0) continue
    if (c === "/" && tag[i + 1] === "/") { const nl = tag.indexOf("\n", i); if (nl < 0) break; i = nl; continue }
    if (c === '"' || c === "'") { quote = c; continue }
    if (/\s/.test(tag[i - 1]) && /[A-Za-z_]/.test(c)) {
      const m = /^[A-Za-z_][\w:-]*/.exec(tag.slice(i))
      if (m) { names.push(m[0]); i += m[0].length - 1 }
    }
  }
  return names
}

const files = [...walk("components"), ...walk("app"), ...walk("features")]
let dup = 0, tiny = 0, unlabeledPlaceholder = 0, imgNoAlt = 0
for (const f of files) {
  const src = read(f)
  for (const tag of ["div", "section", "aside", "form", "button", "input", "textarea", "select", "img", "a"]) {
    for (const t of openingTags(src, tag)) {
      const names = attrNames(t.text)
      const seen = new Set()
      for (const n of names) {
        if (seen.has(n)) { dup++; console.error(`duplicate JSX attribute '${n}' in ${f}:${src.slice(0, t.index).split("\n").length}`); break }
        seen.add(n)
      }
      if (tag === "img" && !seen.has("alt") && !/\{\.\.\./.test(t.text)) { imgNoAlt++; console.error(`img without alt in ${f}`) }
      if ((tag === "input" || tag === "textarea") && /placeholder=/.test(t.text) && !/aria-label|aria-labelledby|\bid=|\{\.\.\./.test(t.text)) {
        const before = src.slice(Math.max(0, t.index - 400), t.index)
        if (!(before.lastIndexOf("<label") > before.lastIndexOf("</label>"))) { unlabeledPlaceholder++; console.error(`placeholder-only control in ${f}:${src.slice(0, t.index).split("\n").length}`) }
      }
    }
  }
  tiny += (src.match(/text-\[(8|9)px\]/g) || []).length
}
assert(dup === 0, `no duplicate JSX attributes (${dup})`)
assert(imgNoAlt === 0, `every img has alt (${imgNoAlt})`)
assert(unlabeledPlaceholder === 0, `placeholder-only inputs carry an accessible name (${unlabeledPlaceholder})`)
assert(tiny === 0, `no 8px/9px text remains (${tiny})`)

// Hook: stack-aware, so only the topmost dialog handles Escape/Tab.
const hook = read("hooks/use-dialog-a11y.ts")
assert(/dialogStack/.test(hook) && /dialogStack\[dialogStack\.length - 1\] !== token/.test(hook), "dialog hook only lets the topmost dialog react to keys")
assert(/dialogStack\.splice/.test(hook), "dialog hook removes closed dialogs from the stack")

// Overlays wired to the hook.
const wired = [
  "poll-composer", "challenge-composer", "match-celebration", "save-to-collection", "post-insights",
  "post-detail-sheet", "global-search", "engagement-roster-sheet", "short-video-screen",
  "daily-reward-experience", "messaging-premium-sheet", "action-sheet", "ghc-requests-panel",
  "global-interaction-dialog", "profile-preview-page", "session-lock-screen",
]
for (const n of wired) {
  const src = read(`components/ghc/${n}.tsx`)
  assert(/useDialogA11y<HTML\w*Element>\(/.test(src) && /ref=\{dialogRef\}/.test(src), `${n} uses the shared dialog hook`)
  assert(/role="dialog"/.test(src) && /aria-modal="true"/.test(src), `${n} exposes dialog semantics`)
}
const lock = read("components/ghc/session-lock-screen.tsx")
assert(/aria-labelledby="gh-pin-sheet-title"/.test(lock) && /id="gh-pin-sheet-title"/.test(lock), "PIN sheet is labelled by its heading")
const prompt = read("components/ghc/global-interaction-dialog.tsx")
assert(/htmlFor="gh-global-dialog-input"/.test(prompt) && /id="gh-global-dialog-input"/.test(prompt), "prompt dialog label is bound to its input")

if (failures) { console.error(`RUN465 check failed: ${failures} assertion(s)`); process.exit(1) }
console.log("RUN465 overlay semantics and control label contract passed")
