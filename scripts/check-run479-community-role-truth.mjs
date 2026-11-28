import fs from "node:fs"
import assert from "node:assert/strict"
const src = fs.readFileSync("contexts/ghc-context.tsx", "utf8")
const start = src.indexOf("const setGroupRole = useCallback(")
const end = src.indexOf("const updateGroupName = useCallback(", start)
const fn = src.slice(start, end)
const rolesIdx = fn.indexOf("/roles`")
const domainIdx = fn.indexOf("domains.community.setRole(")
const stateIdx = fn.indexOf("setState((s)")
const checks = [
  ["setGroupRole handler found", start > 0 && end > start],
  ["server roles request is sent before any local role change", rolesIdx > 0 && domainIdx > rolesIdx && stateIdx > rolesIdx],
  ["response is read and must be ok and durable", /const response = await fetch\(`\/api\/communities\/\$\{encodeURIComponent\(conversationId\)\}\/roles`/.test(fn) && /!response\.ok \|\| payload\?\.ok === false \|\| payload\?\.durable !== true/.test(fn)],
  ["rejected or non-durable write returns before the local mirror and success toast", /Role could not be updated/.test(fn) && fn.indexOf("return", fn.indexOf("Role could not be updated")) < domainIdx],
  ["permission rejection has its own message", /don't have permission to change this role/.test(fn)],
  ["network failure reports instead of silently succeeding", /Could not reach the community server/.test(fn)],
  ["request is time-bounded and sends the session", /AbortSignal\.timeout\(10_000\)/.test(fn) && /credentials: "include"/.test(fn)],
  ["local mirror uses the server-confirmed role", /confirmedRole/.test(fn) && /domains\.community\.setRole\(conversationId, userId, confirmedRole/.test(fn)],
  ["owner request is still sent as admin (no client owner injection)", /normalized === "owner" \? "admin" : normalized/.test(fn)],
  ["the old swallowed fire-and-forget request is gone", !/offline \/ studio/.test(fn)],
]
for (const [n, p] of checks) { console.log(`${p ? "PASS" : "FAIL"} ${n}`); assert.ok(p, n) }
console.log(`RUN479 community role truth: ${checks.length}/${checks.length} passed`)
