#!/usr/bin/env node
/**
 * RUN509: no Math.random() anywhere in application source except explicitly
 * allowed non-security uses; security tokens/IDs fail closed; the notification
 * bell no longer reads values before declaration; no fabricated matches.
 */
import assert from "node:assert/strict"
import { readFileSync, readdirSync, statSync } from "node:fs"
import { join } from "node:path"

const read = (p) => readFileSync(p, "utf8")
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "")
const walk = (dir, out = []) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (/\.(ts|tsx)$/.test(name) && !/\.d\.ts$/.test(name)) out.push(p)
  }
  return out
}
// Non-identifier uses that are intentionally probabilistic.
const allowed = new Set(["lib/web-vitals-collector.ts", "lib/accessibility.ts"])
const checks = []
const offenders = []
for (const root of ["app", "lib", "components", "features", "hooks", "contexts"]) {
  for (const file of walk(root)) {
    if (allowed.has(file)) continue
    if (/Math\.random/.test(strip(read(file)))) offenders.push(file)
  }
}
checks.push([`no Math.random() in app source (offenders: ${offenders.join(", ") || "none"})`, offenders.length === 0])

for (const [file, token] of [
  ["lib/session-security.ts", "secureHex(16)"],
  ["lib/csrf-protection.ts", "secureHex(TOKEN_BYTES)"],
  ["lib/pi-oauth-client.ts", "secureUUID()"],
  ["lib/calls/direct-call-controller.ts", "secureHex(16)"],
  ["lib/domains/send-ghc-helpers.ts", "secureHex(4)"],
  ["lib/social/client.ts", "securePrefixedId("],
  ["lib/gh-pay/order-store.ts", "securePrefixedId(\"gho\")"],
  ["lib/domains/membership-domain.ts", "secureUUID()"],
  ["lib/domains/community-registry.ts", "secureHex(4).toUpperCase()"],
]) {
  const src = strip(read(file))
  checks.push([`${file}: uses ${token}`, src.includes(token) && /from "(?:@\/lib|(?:\.\.?\/)+)(?:\.\.\/)*(?:lib\/)?secure-id(?:\.ts)?"/.test(src)])
}

const client = strip(read("lib/backend/client-services.ts"))
checks.push(["local matching service never fabricates a match", !/matched:\s*true/.test(client)])

const bell = read("components/ghc/notification-bell.tsx")
const firstUse = bell.indexOf("setDurableOk(unifiedAvailable")
const decl = bell.indexOf("const unifiedAvailable")
checks.push(["notification bell declares availability flags before use", decl > -1 && decl < firstUse])
const refreshAt = bell.indexOf("const refresh = useCallback")
const priorDecl = bell.indexOf("const priorDurableItems")
const priorUse = bell.indexOf("priorDurableItems.filter")
checks.push(["notification bell hoists priorDurableItems above its async use", priorDecl > refreshAt && priorDecl < priorUse])

for (const [label, pass] of checks) {
  assert.ok(pass, label)
  console.log(`PASS ${label}`)
}
console.log(`RUN509 secure random sweep: ${checks.length}/${checks.length} passed`)
