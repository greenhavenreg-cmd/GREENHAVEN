import { createHash } from "node:crypto"

/**
 * Derive the legacy schema-compatible 128-bit field-session scope identifier
 * from a canonical Pioneer identity and an already verified GreenHaven session.
 * This value is not an authentication token and cannot be supplied by clients.
 */
export function fieldSessionScopeId(userId: string, sessionId: string): string {
  return createHash("sha256")
    .update(`greenhaven-field-v1:${userId}:${sessionId}`)
    .digest("hex")
    .slice(0, 32)
}
