/**
 * Buyer-facing delivery and issue-resolution guidance. This is display logic;
 * the authenticated commerce route independently enforces dispute eligibility.
 */
export const RETURN_WINDOW_DAYS = 7

export type ReturnStage = "not_eligible" | "before_delivery" | "return_window" | "window_closed" | "completed_support" | "resolved"

export interface ReturnGuide {
  stage: ReturnStage
  headline: string
  steps: string[]
  daysLeft: number | null
  canOpenDispute: boolean
}

const DAY = 86_400_000
const ms = (ts?: number | string) => {
  if (typeof ts === "string" && ts.trim()) {
    const numeric = Number(ts)
    if (Number.isFinite(numeric)) return numeric > 0 && numeric < 100_000_000_000 ? numeric * 1000 : numeric
    const parsed = Date.parse(ts)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
  }
  const n = Number(ts)
  return Number.isFinite(n) && n > 0 ? (n < 100_000_000_000 ? n * 1000 : n) : 0
}

export function returnGuideFor(input: {
  status?: string
  paymentStatus?: string
  deliveryStatus?: string
  fulfilmentMethod?: string
  deliveredAt?: number | string
  completedAt?: number | string
  updatedAt?: number | string
  now?: number
}): ReturnGuide {
  const now = input.now ?? Date.now()
  const status = String(input.status || "").toLowerCase()
  const delivery = String(input.deliveryStatus || "").toLowerCase()
  const paid = ["verified", "captured", "held"].includes(String(input.paymentStatus || "").toLowerCase())
  if (["cancelled", "refunded"].includes(status)) {
    return { stage: "resolved", headline: status === "refunded" ? "This order was refunded." : "This order was cancelled.", steps: [], daysLeft: null, canOpenDispute: false }
  }
  if (status === "disputed") {
    return { stage: "resolved", headline: "A dispute is open for this order.", steps: ["Keep all messages inside GreenHaven.", "Add any photos or tracking details the seller or reviewer asks for."], daysLeft: null, canOpenDispute: false }
  }
  if (!paid) {
    return { stage: "not_eligible", headline: "Issue reporting is available after payment is verified.", steps: [], daysLeft: null, canOpenDispute: false }
  }
  if (status === "completed") {
    return { stage: "window_closed", headline: "Order completed. Contact the seller if you need follow-up support.", steps: ["Open the order chat to contact the seller.", "Keep any agreed follow-up or evidence in the GreenHaven conversation.", "The standard dispute action is no longer available after completion."], daysLeft: null, canOpenDispute: false }
  }
  const delivered = ["delivered", "service_active", "completed"].includes(delivery)
  if (!delivered) {
    return {
      stage: "before_delivery",
      headline: "Not delivered yet.",
      steps: ["Check the tracking timeline for the latest update.", "Message the seller if the delivery date has passed.", "If there is no response, open a dispute from this order."],
      daysLeft: null,
      canOpenDispute: true,
    }
  }
  const start = ms(input.deliveredAt)
  if (!start) {
    return { stage: "window_closed", headline: "Delivery date could not be verified. Contact the seller before confirming receipt.", steps: ["Use the order chat to ask the seller to confirm the delivery date.", "Keep tracking details and delivery evidence in the conversation."], daysLeft: null, canOpenDispute: false }
  }
  const daysLeft = Math.ceil((start + RETURN_WINDOW_DAYS * DAY - now) / DAY)
  if (daysLeft <= 0) {
    return { stage: "window_closed", headline: `The ${RETURN_WINDOW_DAYS}-day issue-reporting window has closed.`, steps: ["You can still message the seller about an issue."], daysLeft: 0, canOpenDispute: false }
  }
  return { stage: "return_window", headline: `${daysLeft} day${daysLeft === 1 ? "" : "s"} left to report a problem.`, steps: DELIVERED_STEPS, daysLeft, canOpenDispute: true }
}

const DELIVERED_STEPS = [
  "Inspect the order before confirming receipt.",
  "Message the seller with the problem and any photo or delivery evidence.",
  "If you cannot resolve it, open a dispute before confirming receipt and within the displayed window.",
]
