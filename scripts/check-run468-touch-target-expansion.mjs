import { readFileSync, readdirSync, statSync } from "node:fs"
import { join } from "node:path"
let failures = 0
const assert = (ok, msg) => { if (!ok) { failures += 1; console.error(`FAIL: ${msg}`) } }
const walk = (dir) => readdirSync(dir).flatMap((n) => { const p = join(dir, n); return statSync(p).isDirectory() ? walk(p) : p.endsWith(".tsx") ? [p] : [] })

const css = readFileSync("app/globals.css", "utf8")
assert(/\.gh-hit-44::after/.test(css) && /max\(100%, 44px\)/.test(css), "touch-target expansion CSS exists")
assert(/\.gh-hit-44:not\(\.absolute\):not\(\.fixed\):not\(\.sticky\):not\(\.relative\)/.test(css), "expansion never overrides explicit positioning")

// Every <button> whose only size is a fixed 36px-or-smaller square must expand its hit area.
// The opening tag is read with brace/quote tracking so `=>` inside handlers does not end it early.
function openingTags(src) {
  const tags = []
  for (const m of src.matchAll(/<button\b/g)) {
    let i = m.index + m[0].length, depth = 0, q = null
    for (; i < src.length; i += 1) {
      const c = src[i]
      if (q) { if (c === q && src[i - 1] !== "\\") q = null }
      else if (depth === 0 && (c === '"' || c === "'" || c === "`")) q = c
      else if (c === "{") depth += 1
      else if (c === "}") depth -= 1
      else if (c === ">" && depth === 0 && src[i - 1] !== "=") break
    }
    tags.push(src.slice(m.index, i))
  }
  return tags
}
let small = 0
for (const file of [...walk("components"), ...walk("features")]) {
  const s = readFileSync(file, "utf8")
  for (const tag of openingTags(s)) {
    const cm = tag.match(/className=(?:"([^"]*)"|\{`([^`]*)`\})/s)
    if (!cm) continue
    const k = cm[1] ?? cm[2] ?? ""
    if (/min-h-(11|12)|min-w-11|h-(11|12|14)\b|size-(11|12)|gh-hit-44/.test(k)) continue
    const h = k.match(/\bh-(\d+(?:\.\d+)?)\b/), w = k.match(/\bw-(\d+(?:\.\d+)?)\b/)
    if (h && w && Number(h[1]) <= 9 && Number(w[1]) <= 9 && !/(^|\s)p-/.test(k)) { small += 1; console.error(`  small target: ${file}`) }
  }
}
assert(small === 0, `no undersized icon buttons without a 44px hit area (${small} found)`)

if (failures) { console.error(`RUN468 check failed: ${failures} assertion(s)`); process.exit(1) }
console.log("RUN468 touch-target expansion contract passed")
