import { createHash, createHmac } from "node:crypto"

/** Server-derived per-Pioneer submission scope. A client-provided slug/key is
 * never an identity credential; this binds otherwise opaque submission keys
 * to the authenticated GreenHaven account. */
export function researchSubmissionKey(userId: string, clientKey: string): string {
  return createHash("sha256").update(`greenhaven-research-v1:${userId}:${clientKey}`).digest("hex")
}

export function researchRespondentHash(userId: string, secret: string | undefined): string | null {
  if (!secret || secret.length < 32 || !userId) return null
  return createHmac("sha256", secret).update(`greenhaven-exam-v1:${userId}`).digest("hex")
}
