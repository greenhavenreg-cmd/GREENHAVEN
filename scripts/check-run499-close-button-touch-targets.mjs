import fs from "node:fs"
const files = ["post-insights","save-to-collection","ghc-transaction-detail","report-chooser","ghc-requests-panel","request-ghc-flow","receive-ghc-flow","global-search","pi-payment-detail","share-sheet","send-ghc-flow"].map((n) => [n, fs.readFileSync(`components/ghc/${n}.tsx`, "utf8")])
const checks = files.map(([n, s]) => [`${n}: close button is a 44px target and keeps header layout`, /-m-1\.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full/.test(s)])
checks.push(["no sheet close button is left at the old 34px size", files.every(([, s]) => !/aria-label="Close"[^>]*className="rounded-full p-2|className="rounded-full p-2[^"]*"[^>]*aria-label="Close"/.test(s))])
let failed = 0
for (const [n, ok] of checks) { console.log(`${ok ? "PASS" : "FAIL"} ${n}`); if (!ok) failed++ }
console.log(`RUN499 close-button touch targets: ${checks.length - failed}/${checks.length} passed`)
if (failed) process.exit(1)
