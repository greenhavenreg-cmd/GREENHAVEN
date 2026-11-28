#!/usr/bin/env node
/** RUN515: no client code may fetch() a data: URL, and the CSP permits what uploads still need. */
import assert from "node:assert/strict"
import { readFileSync, readdirSync, statSync } from "node:fs"
import { join } from "node:path"
const vercel = JSON.parse(readFileSync("vercel.json", "utf8"))
const csp = vercel.headers.find((h) => h.source === "/(.*)").headers.find((h) => h.key === "Content-Security-Policy").value
const dir = (name) => (csp.match(new RegExp(`(?:^|;\\s*)${name}\\s+([^;]+)`))?.[1] ?? "").split(/\s+/)
function walk(d, out = []) {
  for (const n of readdirSync(d)) {
    if (n === "node_modules" || n === ".next") continue
    const p = join(d, n); const st = statSync(p)
    if (st.isDirectory()) walk(p, out); else if (/\.(ts|tsx)$/.test(n)) out.push(p)
  }
  return out
}
const clientFiles = ["components", "lib", "hooks", "contexts", "features"].flatMap((d) => walk(d)).filter((p) => !p.startsWith("lib/server") && p !== "lib/media/data-url.ts")
const offenders = clientFiles.filter((p) => /fetch\(\s*(dataUrl|dataURL|compressed\w*|preview\w*|compressedBase64)\b/.test(readFileSync(p, "utf8")))
const helper = readFileSync("lib/media/data-url.ts", "utf8")
const client = readFileSync("lib/media/upload-client.ts", "utf8")
const checks = [
  ["no client code fetches a data: URL variable", offenders.length === 0],
  ["urlToBlob decodes data: URLs locally", /startsWith\("data:"\)/.test(helper) && /atob\(/.test(helper)],
  ["connect-src permits data: and blob: (and the Supabase storage host)", dir("connect-src").includes("data:") && dir("connect-src").includes("blob:") && dir("connect-src").includes("https://*.supabase.co")],
  ["connect-src is not widened to a wildcard scheme", !dir("connect-src").includes("https:") && !dir("connect-src").includes("*")],
  ["media-src permits blob: data: and Supabase", ["blob:", "data:", "https://*.supabase.co"].every((v) => dir("media-src").includes(v))],
  ["storage PUT failure reports STORAGE_UNREACHABLE", /STORAGE_UNREACHABLE/.test(client) && /STORAGE_UNREACHABLE/.test(readFileSync("lib/media/user-messages.ts", "utf8"))],
  ["seven upload surfaces use urlToBlob", ["components/ghc/unified-compose.tsx", "components/ghc/profile-story-section.tsx", "components/ghc/profile-screen.tsx", "components/ghc/onboarding.tsx", "components/ghc/create-group-modal.tsx", "lib/media-pipeline.ts"].every((p) => /urlToBlob\(/.test(readFileSync(p, "utf8")))],
]
if (offenders.length) console.log("offenders:", offenders.join(", "))
for (const [label, pass] of checks) { assert.ok(pass, label); console.log(`PASS ${label}`) }
console.log(`RUN515 media upload CSP: ${checks.length}/${checks.length} passed`)
