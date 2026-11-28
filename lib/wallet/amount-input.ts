/**
 * Typed-amount sanitiser shared by every money input (withdraw Pi, send GHC, request GHC).
 *
 * Mobile numeric keypads in many locales (German, French, Spanish, Portuguese, …) show a comma, not a
 * dot, as the decimal key. Stripping everything except digits and "." silently turned "1,5" into "15"
 * (a 10× error) and made decimals impossible to type. Display/input only: the server and the
 * ledger remain the sole authority and re-validate every amount.
 *
 * Rules:
 * - Digits only, plus one decimal separator.
 * - A "," or "." both act as the decimal separator. When both appear and the earlier one is proper
 *   digit grouping, the LAST one is the decimal ("1,234.5" -> "1234.5", "1.234,5" -> "1234.5");
 *   otherwise the first one stays the decimal and the extra is ignored ("1.5," -> "1.5").
 * - Several of the same separator are grouping ("1,000,000" -> "1000000"); a single one is decimal.
 * - Fraction digits are capped at `maxDecimals`; further digits are dropped, never rounded.
 */
export function sanitizeAmountInput(raw: string, maxDecimals: number): string {
  const cleaned = String(raw ?? "").replace(/[^\d.,]/g, "")
  if (!cleaned) return ""
  const lastDot = cleaned.lastIndexOf(".")
  const lastComma = cleaned.lastIndexOf(",")
  const dots = (cleaned.match(/\./g) ?? []).length
  const commas = (cleaned.match(/,/g) ?? []).length
  let decimalAt = -1
  if (lastDot >= 0 && lastComma >= 0) {
    // Both kinds present. The last one is the decimal separator only when everything before it is
    // well-formed digit grouping (one repeated separator type, groups of exactly three digits).
    // Otherwise the person typed a second separator into a decimal ("1.5," or "1,5."): keep the
    // first separator as the decimal and ignore the extra, so the value never jumps by 10x.
    const last = Math.max(lastDot, lastComma)
    const head = cleaned.slice(0, last)
    const groupSep = cleaned[last] === "." ? "," : "."
    const groups = head.split(groupSep)
    const wellFormed = !/[.,]/.test(head.replace(new RegExp(`\\${groupSep}`, "g"), "")) &&
      groups.length > 1 && groups.slice(1).every((g) => /^\d{3}$/.test(g))
    decimalAt = wellFormed ? last : cleaned.search(/[.,]/)
  } else if (lastDot >= 0) decimalAt = dots === 1 ? lastDot : -1
  else if (lastComma >= 0) decimalAt = commas === 1 ? lastComma : -1
  // Repeated same-type separators with no other type are grouping, except a trailing one the person
  // is still typing after a grouped number (e.g. "1,000," keeps that trailing separator as decimal).
  if (decimalAt < 0 && (dots > 1 || commas > 1)) {
    const sep = dots > 1 ? "." : ","
    if (cleaned.endsWith(sep)) decimalAt = cleaned.length - 1
  }
  const digits = (s: string) => s.replace(/\D/g, "")
  if (decimalAt < 0) return digits(cleaned)
  const whole = digits(cleaned.slice(0, decimalAt))
  const frac = digits(cleaned.slice(decimalAt + 1)).slice(0, Math.max(0, maxDecimals))
  return `${whole}.${frac}`
}
