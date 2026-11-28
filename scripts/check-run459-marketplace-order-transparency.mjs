#!/usr/bin/env node
import { readFileSync } from "node:fs"
import { join } from "node:path"
const root = process.cwd()
const read = (file) => readFileSync(join(root, file), "utf8")
const domain = read("lib/domains/marketplace-domain.ts")
const mapper = read("lib/marketplace/record-mappers.ts")
const returns = read("lib/marketplace/returns.ts")
const route = read("app/api/marketplace/orders/[orderId]/commerce/route.ts")
const parser = read("lib/marketplace/fulfilment.ts")
const screen = read("components/ghc/marketplace-screen.tsx")
const pkg = JSON.parse(read("package.json"))
const checks = [
  ["domain order contract carries server delivery and resolution evidence", ["deliveredAt", "buyerConfirmedAt", "sellerConfirmedAt", "disputeReason", "cancellationReason", "sellerNote"].every((field) => domain.includes(`${field}?: string`) || domain.includes(`${field}?: number`))],
  ["durable mapper normalizes camelCase and snake_case delivery timestamps", /deliveredAt: row\.deliveredAt == null && row\.delivered_at == null/.test(mapper) && /buyerConfirmedAt: row\.buyerConfirmedAt/.test(mapper)],
  ["durable mapper preserves dispute, cancellation and seller notes", mapper.includes("disputeReason: text(row.disputeReason ?? row.dispute_reason)") && mapper.includes("cancellationReason: text(row.cancellationReason ?? row.cancellation_reason)") && mapper.includes("sellerNote: text(row.sellerNote ?? row.seller_note)")],
  ["return guide uses verified delivery time rather than fulfilment or generic update time", /const start = ms\(input\.deliveredAt\)/.test(returns) && !/ms\(input\.deliveredAt\) \|\| ms\(input\.completedAt\)/.test(returns)],
  ["completed orders cannot display a misleading open-dispute promise", /status === "completed"[\s\S]*?canOpenDispute: false/.test(returns)],
  ["missing delivery evidence fails closed for post-delivery disputes", /Delivery date could not be verified[\s\S]*?canOpenDispute: false/.test(returns)],
  ["commerce API enforces dispute eligibility on the server", route.includes("returnGuideFor") && route.includes("DISPUTE_WINDOW_CLOSED") && route.includes('if (input.value.action === "dispute")')],
  ["dispute submissions require a bounded meaningful reason", parser.includes('action === "dispute" && note.length < 8') && screen.includes("Describe the problem (at least 8 characters)") && screen.includes("maxLength={500}")],
  ["buyer order card uses deliveredAt, not fulfilledAt, for issue window", /deliveredAt: o\.deliveredAt/.test(screen) && !/deliveredAt: o\.fulfilledAt/.test(screen)],
  ["buyer and seller can inspect delivered timestamp and case reasons", screen.includes("Delivered:") && screen.includes("Dispute reason:") && screen.includes("Cancellation reason:") && screen.includes("Buyer update:") && screen.includes("Buyer confirmed receipt:")],
  ["dispute form submits the recorded reason through the commerce API", screen.includes('runOrderAction(o.id, "dispute", { note: disputeReason.trim() })') && screen.includes("Submit dispute")],
  ["RUN459 static gate is part of static, prebuild and pretypecheck", ["verify:static", "prebuild:checks", "pretypecheck"].every((key) => pkg.scripts[key]?.includes("check-run459-marketplace-order-transparency.mjs"))],
]
let failures = 0
for (const [label, ok] of checks) { console.log(`${ok ? "PASS" : "FAIL"} ${label}`); if (!ok) failures++ }
console.log(`RUN459 Marketplace order transparency: ${checks.length - failures}/${checks.length}`)
if (failures) process.exit(1)
