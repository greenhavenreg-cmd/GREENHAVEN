import assert from "node:assert/strict"
import { returnGuideFor, RETURN_WINDOW_DAYS } from "../lib/marketplace/returns.ts"
import { mapMarketplaceOrderRecord } from "../lib/marketplace/record-mappers.ts"
import { parseMarketplaceFulfilmentInput } from "../lib/marketplace/fulfilment.ts"

const DAY = 86_400_000
const NOW = 1_800_000_000_000

// Before delivery: dispute remains available after verified payment.
let guide = returnGuideFor({ status: "fulfilling", paymentStatus: "verified", deliveryStatus: "shipped", now: NOW })
assert.equal(guide.stage, "before_delivery")
assert.equal(guide.canOpenDispute, true)

// Delivery clock is based on delivered_at, not fulfilled_at or updated_at.
guide = returnGuideFor({ status: "fulfilling", paymentStatus: "verified", deliveryStatus: "delivered", deliveredAt: NOW - 2 * DAY, now: NOW })
assert.equal(guide.stage, "return_window")
assert.equal(guide.daysLeft, RETURN_WINDOW_DAYS - 2)
assert.equal(guide.canOpenDispute, true)

guide = returnGuideFor({ status: "fulfilling", paymentStatus: "verified", deliveryStatus: "delivered", deliveredAt: new Date(NOW - 7 * DAY).toISOString(), now: NOW })
assert.equal(guide.stage, "window_closed")
assert.equal(guide.canOpenDispute, false, "dispute window closes at the seven-day boundary")

guide = returnGuideFor({ status: "fulfilling", paymentStatus: "verified", deliveryStatus: "delivered", now: NOW })
assert.equal(guide.canOpenDispute, false, "missing delivery timestamp cannot create an indefinite dispute window")

guide = returnGuideFor({ status: "completed", paymentStatus: "verified", deliveryStatus: "completed", completedAt: NOW - DAY, now: NOW })
assert.equal(guide.canOpenDispute, false, "completed orders use seller follow-up rather than reversible dispute action")
assert.match(guide.headline, /Order completed/)

// Durable order mapper carries authoritative delivery/case fields from both API casing conventions.
const camel = mapMarketplaceOrderRecord({
  id: "mord_camel", deliveredAt: NOW - DAY, buyerConfirmedAt: NOW,
  disputeReason: "Item damaged", cancellationReason: "", sellerNote: "Courier dispatched",
}, NOW)
assert.equal(camel?.deliveredAt, NOW - DAY)
assert.equal(camel?.buyerConfirmedAt, NOW)
assert.equal(camel?.disputeReason, "Item damaged")
assert.equal(camel?.sellerNote, "Courier dispatched")

const snake = mapMarketplaceOrderRecord({
  id: "mord_snake", delivered_at: new Date(NOW - 3 * DAY).toISOString(),
  seller_confirmed_at: NOW - 3 * DAY, cancellation_reason: "Buyer requested cancellation",
}, NOW)
assert.equal(snake?.deliveredAt, NOW - 3 * DAY)
assert.equal(snake?.sellerConfirmedAt, NOW - 3 * DAY)
assert.equal(snake?.cancellationReason, "Buyer requested cancellation")

assert.equal(mapMarketplaceOrderRecord({ deliveredAt: NOW }, NOW), null, "malformed order without id is discarded")
assert.equal(parseMarketplaceFulfilmentInput({ action: "dispute", note: "short" }).error, "DISPUTE_REASON_REQUIRED")
assert.equal(parseMarketplaceFulfilmentInput({ action: "dispute", note: "Package arrived damaged" }).ok, true)
console.log("RUN459 Marketplace order transparency runtime tests passed")
