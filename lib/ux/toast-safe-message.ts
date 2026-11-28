import { humanizeClientErrorCode, toClientSafeErrorMessage } from "@/lib/client/safe-api-error"
import { userFacingError } from "@/lib/ux/user-facing-errors"

const CODE_LIKE = /^[A-Z][A-Z0-9_]{2,80}$/
const GENERIC_ERROR = "Something went wrong. Please try again."

/**
 * Last line of defence for toasts: a machine code or infrastructure text is replaced with plain
 * language. Ordinary sentences pass through unchanged (only whitespace is collapsed and very long
 * text is shortened).
 */
export function toastSafeMessage(raw: unknown, type: "success" | "error" | "info" = "error"): string {
  const text = String(raw ?? "").replace(/\s+/g, " ").trim()
  if (!text) return type === "error" ? GENERIC_ERROR : ""
  if (CODE_LIKE.test(text)) {
    const mapped = userFacingError(text, "")
    if (mapped) return mapped
    // An unmapped upper-case word in a success/info toast may be an ordinary label; only errors are masked.
    return type === "error" ? humanizeClientErrorCode(text, GENERIC_ERROR) : text
  }
  const safe = toClientSafeErrorMessage(text, GENERIC_ERROR)
  return safe.length > 160 ? `${safe.slice(0, 157)}…` : safe
}
