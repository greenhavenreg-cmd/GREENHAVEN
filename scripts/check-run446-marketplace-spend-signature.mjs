import fs from 'node:fs'

const routePath = 'app/api/marketplace/orders/[orderId]/pay/route.ts'
const route = fs.readFileSync(routePath, 'utf8')
const storePath = 'lib/server/economy/store.ts'
const store = fs.readFileSync(storePath, 'utf8')
const call = route.match(/executeAuthoritativeSpend\(getProcessGhcStore\(\),\s*\{[\s\S]*?sourceEvent:\s*"MARKETPLACE_PURCHASE",\s*\n\s*\}\s*\)/)
const signature = store.match(/export async function executeAuthoritativeSpend\(\s*store:\s*GhcAuthoritativeStore,\s*input:\s*\{[\s\S]*?\}\s*\):\s*Promise/)
if (!call || !signature) {
  console.error('FAIL: marketplace memory spend call must match the authoritative two-argument store signature')
  process.exit(1)
}
if (/executeAuthoritativeSpend\(getProcessGhcStore\(\),[\s\S]{0,500}transportError/.test(route)) {
  console.error('FAIL: transportError option must not be passed to the in-memory ledger implementation')
  process.exit(1)
}
console.log('PASS: marketplace memory spend call matches executeAuthoritativeSpend signature')
