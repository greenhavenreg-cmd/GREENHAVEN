import { readFileSync, readdirSync, statSync } from "node:fs"
import { join } from "node:path"
let failures = 0
const assert = (ok, msg) => { if (!ok) { failures += 1; console.error(`FAIL: ${msg}`) } else console.log(`PASS ${msg}`) }
const read = (p) => readFileSync(p, "utf8")

// Server code must never call fetch() with a relative PostgREST path: Node cannot resolve it and the call throws.
const RELATIVE = /\bfetch\(\s*(?:"(?:rpc\/|ghc_|gh_)[^"]*"|`(?:rpc\/|ghc_|gh_)[^`]*`|""\s*\/\*)/
const RELATIVE_VAR = /(?:const|let)\s+(url|endpoint)\s*=\s*(?:"(?:rpc\/|ghc_|gh_)|`(?:rpc\/|ghc_|gh_))/
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (/\.(ts|tsx)$/.test(name)) out.push(p)
  }
  return out
}
const offenders = []
for (const file of [...walk("lib/server"), ...walk("app/api")]) {
  const src = read(file)
  if (RELATIVE.test(src) || (RELATIVE_VAR.test(src) && /\bfetch\(\s*(?:url|endpoint)\b/.test(src))) offenders.push(file)
  if (/(?:const|let)\s+\w+\s*=\s*"[^"`\n]*\$\{[^"`\n]*"/.test(src) && /ghc_|gh_|rpc\//.test(src.match(/(?:const|let)\s+\w+\s*=\s*"[^"`\n]*\$\{[^"`\n]*"/)[0])) offenders.push(`${file} (interpolation inside a plain string)`)
}
assert(offenders.length === 0, `no server fetch() uses a relative or non-template PostgREST path${offenders.length ? `: ${offenders.join(", ")}` : ""}`)

const n = read("lib/server/economy/notifications.ts")
assert(!/\bfetch\(/.test(n), "economy notification store has no direct fetch calls")
assert(/supabaseRpc<Record<string, unknown>>\("ghc_record_notification_event"/.test(n), "economy notification record goes through supabaseRpc")
assert(/read_at=is\.null&select=id/.test(n) && /return=representation/.test(n), "mark-read reads back the rows it changed")
assert(/"marked" \| "not_found" \| "unavailable"/.test(n), "mark-read distinguishes changed, missing and outage")
assert(/Promise<number \| null>/.test(n), "mark-all reports null on a store failure")
const one = read("app/api/economy/notifications/[id]/read/route.ts")
assert(/unavailable[\s\S]*503/.test(one) && /not_found[\s\S]*404/.test(one), "read route maps outage to 503 and missing to 404")
assert(/n === null[\s\S]*503/.test(read("app/api/economy/notifications/read-all/route.ts")), "read-all route maps a store failure to 503")

for (const [file, needle, label] of [
  ["lib/server/economy/withdrawal.ts", /listWithdrawalsForUser[\s\S]*supabaseRest<unknown>\(url/, "withdrawal history"],
  ["lib/server/payments/intent-store.ts", /supabaseRest<Array<Record<string, unknown>>>\(`\$\{base\}\?\$\{params\}`/, "payment intent history"],
  ["lib/server/identity/webauthn-store.ts", /dbListCredentials[\s\S]*supabaseRest<Array<Record<string, unknown>>>\(url/, "passkey credential list"],
  ["lib/server/ghpv/vote-weight.ts", /supabaseRest<Array<\{ curation_power/, "curation intelligence read"],
  ["lib/server/ghpv/settle-service.ts", /supabaseRest<Array<Record<string, unknown>>>\(url/, "curator calibration map"],
]) assert(needle.test(read(file)), `${label} uses the shared REST client`)
const rev = read("lib/server/revenue/revenue-event.ts")
assert(/supabaseRpc<CompanyRevenueAppendResult>\(rpcName, body/.test(rev) && !/\bfetch\(/.test(rev), "company revenue append uses supabaseRpc and keeps its single concurrent-retry")
assert(/fetch\(`\$\{base\}\/rest\/v1\/`/.test(read("lib/server/health/withdrawals-health.ts")), "database health probe targets the PostgREST root")

if (failures) process.exit(1)
console.log("RUN476 relative Supabase fetch contract passed")
