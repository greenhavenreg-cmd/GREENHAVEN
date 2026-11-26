/**
 * IdentityService — single source of truth for session identity.
 *
 * Production chain:
 *   Pi UID (verified access token on server)
 *     → immutable gh_pi_identities mapping
 *       → canonical GreenHaven user ID (independent internal UUID)
 *         → Profile / GHC account / Wallet
 *
 * Studio/local may use "current-user" only when no Pi UID is available.
 * Never treat "current-user" as a production wallet or transfer party.
 */

export const LOCAL_STUDIO_USER_ID = "current-user" as const

export type AuthState =
  | "unknown"
  | "anonymous"
  | "authenticated"
  | "error"

export type VerificationState =
  | "unverified"
  | "pi_linked"
  | "server_verified"

export type AccountStatus =
  | "setup"
  | "active"
  | "restricted"
  | "suspended"

export interface SessionIdentity {
  /** Canonical internal GreenHaven user id from the durable identity mapping. */
  userId: string
  /** Pi authentication-provider subject; never a GreenHaven account ID. */
  piUserId: string | null
  username: string | null
  displayName: string | null
  accessToken: string | null
  authState: AuthState
  verificationState: VerificationState
  accountStatus: AccountStatus
  /** true when userId is only a local studio placeholder */
  isLocalStudioId: boolean
  /**
   * GreenHaven onboarding (interests / intent / first profile) still required.
   * Set from POST /api/auth/pi response. Returning Pioneers should be false.
   */
  needsOnboarding: boolean
  /** Last successful server /me verification timestamp (client clock) */
  serverVerifiedAt: number | null
  updatedAt: number
}

type Listener = (identity: SessionIdentity) => void

const defaultIdentity = (): SessionIdentity => ({
  userId: LOCAL_STUDIO_USER_ID,
  piUserId: null,
  username: null,
  displayName: null,
  accessToken: null,
  authState: "unknown",
  verificationState: "unverified",
  accountStatus: "setup",
  isLocalStudioId: true,
  needsOnboarding: true,
  serverVerifiedAt: null,
  updatedAt: Date.now(),
})

let identity: SessionIdentity = defaultIdentity()
const listeners = new Set<Listener>()

function emit() {
  const snap = { ...identity }
  listeners.forEach((l) => {
    try {
      l(snap)
    } catch {
      /* */
    }
  })
}

/**
 * Resolve the canonical GreenHaven account id from trusted application signals.
 * Pi UID is an authentication-provider subject, never an application account id.
 * It is intentionally excluded from this resolver; only the server-side verified
 * Pi→GH mapping may supply canonicalUserId.
 */
export function resolveCanonicalUserId(input?: {
  profileUserId?: string | null
  explicitUserId?: string | null
  canonicalUserId?: string | null
}): string {
  const candidates = [
    input?.canonicalUserId,
    input?.explicitUserId,
    input?.profileUserId,
  ]
  for (const c of candidates) {
    const id = String(c || "").trim()
    if (id && id !== LOCAL_STUDIO_USER_ID && id !== "preview-user" && id !== "app-studio-user") {
      return id
    }
  }
  return LOCAL_STUDIO_USER_ID
}

export function isStudioPlaceholderId(userId: string | null | undefined): boolean {
  const id = String(userId || "").trim()
  return (
    !id ||
    id === LOCAL_STUDIO_USER_ID ||
    id === "preview-user" ||
    id === "app-studio-user"
  )
}

export const IdentityService = {
  getIdentity(): SessionIdentity {
    return { ...identity }
  },

  getCurrentUserId(): string {
    return identity.userId
  },

  /**
   * Phase 2: true if candidate equals canonical userId or linked Pi UID.
   * Prefer lib/identity/identity-match for multi-alias ownership checks.
   */
  matchesUserId(candidate: string | null | undefined): boolean {
    const id = String(candidate || "").trim()
    if (!id) return false
    if (id === identity.userId) return true
    if (identity.piUserId && id === identity.piUserId) return true
    return false
  },

  /**
   * Transitional lookup aliases for legacy rows written with Pi UIDs.
   * The first item is always the canonical GreenHaven account ID. This list is
   * a compatibility aid only and must never authorize server-side ownership,
   * wallet, payout, or financial operations.
   */
  getIdentityAliases(): string[] {
    const out: string[] = []
    const seen = new Set<string>()
    for (const r of [identity.userId, identity.piUserId]) {
      const id = String(r || "").trim()
      if (!id || seen.has(id)) continue
      seen.add(id)
      out.push(id)
    }
    return out
  },

  getPiUserId(): string | null {
    return identity.piUserId
  },

  getUsername(): string | null {
    return identity.username
  },

  getAccessToken(): string | null {
    return identity.accessToken
  },

  getAuthState(): AuthState {
    return identity.authState
  },

  getVerificationState(): VerificationState {
    return identity.verificationState
  },

  getAccountStatus(): AccountStatus {
    return identity.accountStatus
  },

  isProductionIdentity(): boolean {
    return !identity.isLocalStudioId &&
      Boolean(identity.piUserId) &&
      identity.verificationState === "server_verified"
  },

  /**
   * Apply identity from Pi login / App Studio / profile hydration.
   * Prefer Pi UID as the permanent userId when present.
   */
  setFromPi(input: {
    /** App-specific Pi UID returned by Pi.authenticate / verified /v2/me mapping. */
    uid?: string | null
    /** Canonical internal GH user ID returned by POST /api/auth/pi. */
    canonicalUserId?: string | null
    username?: string | null
    displayName?: string | null
    accessToken?: string | null
    verifiedByServer?: boolean
    /** From POST /api/auth/pi — false for returning Pioneers who finished GH onboarding */
    needsOnboarding?: boolean
  }): SessionIdentity {
    const hasUid = Object.prototype.hasOwnProperty.call(input, "uid")
    const piUid = String(input.uid || "").trim() || null
    const canonicalUserId = String(input.canonicalUserId || "").trim() || null
    const accountChanged =
      (hasUid && piUid !== identity.piUserId) ||
      Boolean(canonicalUserId && !isStudioPlaceholderId(identity.userId) && canonicalUserId !== identity.userId)
    // Never carry a previous account's bearer token, profile labels, onboarding
    // state or verification status across an account switch.
    const base = accountChanged ? defaultIdentity() : identity
    // A Pi SDK UID alone is not a GreenHaven account identifier. Until the
    // server returns the durable mapping, keep the local non-production
    // placeholder so no domain, wallet, or ownership operation can bind to it.
    const sameVerifiedAccount = Boolean(
      piUid && piUid === identity.piUserId &&
      identity.verificationState === "server_verified" &&
      !isStudioPlaceholderId(identity.userId)
    )
    const acceptedCanonicalUserId =
      input.verifiedByServer === true && Boolean(piUid) &&
      canonicalUserId && !isStudioPlaceholderId(canonicalUserId)
        ? canonicalUserId
        : null
    const userId = acceptedCanonicalUserId || (sameVerifiedAccount
      ? identity.userId
      : piUid
        ? LOCAL_STUDIO_USER_ID
        : resolveCanonicalUserId({
            explicitUserId: base.userId !== LOCAL_STUDIO_USER_ID ? base.userId : null,
          }))
    const hasTrustedCanonicalId = Boolean(piUid) && !isStudioPlaceholderId(userId)
    const serverVerified = input.verifiedByServer === true && hasTrustedCanonicalId
    const hasAccessToken = Object.prototype.hasOwnProperty.call(input, "accessToken")
    const nextAccessToken = hasAccessToken
      ? (typeof input.accessToken === "string" && input.accessToken.trim() ? input.accessToken.trim() : null)
      : base.accessToken

    identity = {
      ...base,
      userId,
      piUserId: piUid,
      username: input.username?.trim() || base.username,
      displayName: input.displayName?.trim() || base.displayName,
      accessToken: nextAccessToken,
      // Pi SDK completion is not GreenHaven server authentication. The auth
      // lifecycle may still show the provider as linked, but production identity
      // is established only after the durable server mapping is verified.
      authState: serverVerified ? "authenticated" : (piUid || nextAccessToken ? "unknown" : base.authState),
      verificationState: serverVerified
        ? "server_verified"
        : piUid
          ? "pi_linked"
          : base.verificationState,
      accountStatus: base.accountStatus === "setup" && serverVerified ? "active" : base.accountStatus,
      isLocalStudioId: isStudioPlaceholderId(userId),
      needsOnboarding:
        serverVerified && typeof input.needsOnboarding === "boolean"
          ? input.needsOnboarding
          : base.needsOnboarding,
      serverVerifiedAt: serverVerified ? Date.now() : (accountChanged ? null : base.serverVerifiedAt),
      updatedAt: Date.now(),
    }
    emit()
    return this.getIdentity()
  },

  /** Call after GreenHaven first-time onboarding finishes (server already marked via API). */
  setOnboardingCompleted() {
    identity = {
      ...identity,
      needsOnboarding: false,
      accountStatus: "active",
      updatedAt: Date.now(),
    }
    try {
      if (!isStudioPlaceholderId(identity.userId)) {
        void import("@/lib/onboarding-local").then((m) =>
          m.stampLocalOnboardingComplete({
            userId: identity.userId,
            username: identity.username,
            altUserIds: [identity.userId],
          })
        )
      }
    } catch {
      /* */
    }
    emit()
  },

  needsOnboarding(): boolean {
    return identity.needsOnboarding
  },

  /**
   * Soft merge from GH profile hydration. Verified identities accept metadata only from
   * their exact canonical profile row; stale account-switch responses are ignored.
   */
  setFromProfile(input: {
    userId?: string | null
    username?: string | null
    displayName?: string | null
  }) {
    const profileId = String(input.userId || "").trim()
    const isServerVerified =
      identity.verificationState === "server_verified" && Boolean(identity.piUserId)
    // Profile hydration is asynchronous and can finish after logout/account switch.
    // A verified principal accepts labels only from its exact canonical profile row;
    // missing IDs and stale rows are ignored rather than relabeling the new account.
    if (isServerVerified && (!profileId || profileId !== identity.userId)) {
      return this.getIdentity()
    }
    // An unverified provider UID cannot bind profile metadata to a GH account.
    if (identity.piUserId && !isServerVerified) {
      return this.getIdentity()
    }
    const keepPi = isServerVerified
    const nextUserId = keepPi
      ? identity.userId
      : identity.piUserId
        ? LOCAL_STUDIO_USER_ID
        : resolveCanonicalUserId({
            profileUserId: profileId || null,
            explicitUserId: identity.userId !== LOCAL_STUDIO_USER_ID ? identity.userId : null,
          })
    identity = {
      ...identity,
      userId: nextUserId,
      username: input.username?.trim() || identity.username,
      displayName: input.displayName?.trim() || identity.displayName,
      isLocalStudioId: isStudioPlaceholderId(nextUserId),
      updatedAt: Date.now(),
    }
    emit()
    return this.getIdentity()
  },

  setAuthState(authState: AuthState) {
    identity = { ...identity, authState, updatedAt: Date.now() }
    emit()
  },

  setAccountStatus(accountStatus: AccountStatus) {
    identity = { ...identity, accountStatus, updatedAt: Date.now() }
    emit()
  },

  /** Clear session identity (logout / hard reset) */
  clear() {
    identity = defaultIdentity()
    emit()
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },

  /** Headers for server economy / API calls */
  getAuthHeaders(): Record<string, string> {
    const token = identity.accessToken
    if (token) {
      return { Authorization: `Bearer ${token}` }
    }
    // Dev / memory-ledger path only. Never send synthetic user tokens from a
    // production browser: production requests must use the verified GH session
    // cookie or a real Pi access token.
    if (process.env.NODE_ENV !== "production" && identity.userId) {
      return { Authorization: `Bearer user:${identity.userId}` }
    }
    return {}
  },
}

export type IdentityServiceApi = typeof IdentityService
