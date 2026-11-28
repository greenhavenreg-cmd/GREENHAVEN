#!/usr/bin/env node
/**
 * RUN508: money/publish idempotency keys never fall back to Math.random(), and
 * the comment "add reaction" control lets the person choose the reaction.
 */
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const read = (p) => readFileSync(p, "utf8")
const code = (p) => read(p).replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "")
const keyFiles = [
  "components/ghc/pi-withdraw-sheet.tsx",
  "components/ghc/marketplace-screen.tsx",
  "components/ghc/messaging-premium-sheet.tsx",
  "components/ghc/ghc-utility-panel.tsx",
  "components/ghc/account-data-controls.tsx",
  "components/ghc/unified-compose.tsx",
  "components/ghc/profile-story-section.tsx",
  "components/ghc/message-screen.tsx",
  "features/wallet/withdraw-ghc-panel.tsx",
]
const checks = []
for (const file of keyFiles) {
  const src = read(file)
  checks.push([`${file}: no Math.random() fallback`, !/Math\.random\(\)/.test(src)])
  checks.push([`${file}: uses fail-closed secureUUID`, /import \{ secureUUID \} from "@\/lib\/secure-id"/.test(src) && /secureUUID\(\)/.test(src)])
}
const secure = code("lib/secure-id.ts")
checks.push(["secure-id fails closed when Web Crypto is unavailable", /SECURE_RANDOM_UNAVAILABLE/.test(secure) && !/Math\.random/.test(secure)])

const reactions = read("components/ghc/feed-enhancements.tsx")
const start = reactions.indexOf("export function CommentReactions(")
const body = reactions.slice(start, reactions.indexOf("// Enhanced Comment Component", start))
checks.push(["comment reaction button no longer picks a random emoji", !/Math\.random/.test(body)])
checks.push(["comment reaction picker is an accessible disclosure", /aria-expanded=\{pickerOpen\}/.test(body) && /aria-haspopup="true"/.test(body)])
checks.push(["comment reaction choices are individually labelled", /aria-label=\{`React with \$\{emoji\}`\}/.test(body)])
checks.push(["comment reaction picker closes on Escape", /event\.key === "Escape"/.test(body)])
checks.push(["first reaction can be added when a handler exists", /\(onAddReaction \|\| \(comment\.reactions && Object\.keys\(comment\.reactions\)\.length > 0\)\)/.test(reactions)])

for (const [label, pass] of checks) {
  assert.ok(pass, label)
  console.log(`PASS ${label}`)
}
console.log(`RUN508 secure idempotency and comment reactions: ${checks.length}/${checks.length} passed`)
