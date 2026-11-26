/** Account-scoped, device-local draft for the multi-step community creation flow. */
export type CommunityCreateDraftForm = {
  id?: string
  name: string
  description: string
  category: string
  privacy: "public" | "private" | "invite-only"
  coverImage?: string
  welcomeMessage: string
  rules: string[]
  invitedMembers: string[]
  feeCurrency?: "GHC" | "PI"
}

export type CommunityCreateDraft = {
  step: number
  feeRail: "GHC" | "PI"
  formData: CommunityCreateDraftForm
  updatedAt: number
}

type DraftStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">
const DRAFT_PREFIX = "ghc.community.createDraft.v1"
const DRAFT_TTL_MS = 30 * 24 * 60 * 60 * 1000
const CATEGORIES = new Set(["General", "Agriculture", "Sports", "Tech", "Music", "Art", "Business", "Education", "Faith", "Health", "Local", "Gaming", "Climate", "Other"])

function accountKey(userId: unknown): string | null {
  const id = String(userId ?? "").trim()
  if (!id || id.length > 128 || ["__proto__", "prototype", "constructor"].includes(id)) return null
  return `${DRAFT_PREFIX}:${id}`
}

function durableCover(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined
  const url = value.trim()
  if (!url || url.length > 2048 || /^(?:blob:|data:|javascript:)/i.test(url)) return undefined
  if (url.startsWith("/")) return url
  try {
    const parsed = new URL(url)
    return parsed.protocol === "https:" ? url : undefined
  } catch {
    return undefined
  }
}

export function normalizeCommunityCreateDraft(value: unknown, now = Date.now()): CommunityCreateDraft | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  const raw = value as Record<string, unknown>
  const form = raw.formData && typeof raw.formData === "object" && !Array.isArray(raw.formData)
    ? raw.formData as Record<string, unknown>
    : null
  if (!form) return null
  const updatedAt = Number(raw.updatedAt)
  if (!Number.isFinite(updatedAt) || updatedAt <= 0 || updatedAt > now + 60_000 || now - updatedAt > DRAFT_TTL_MS) return null
  const privacy = ["public", "private", "invite-only"].includes(String(form.privacy))
    ? String(form.privacy) as CommunityCreateDraftForm["privacy"]
    : "public"
  const id = typeof form.id === "string" && /^comm_[a-zA-Z0-9_-]{8,100}$/.test(form.id) ? form.id : undefined
  const feeRail = raw.feeRail === "PI" || form.feeCurrency === "PI" ? "PI" : "GHC"
  return {
    step: Math.max(1, Math.min(4, Math.floor(Number(raw.step) || 1))),
    feeRail,
    updatedAt,
    formData: {
      id,
      name: typeof form.name === "string" ? form.name.slice(0, 50) : "",
      description: typeof form.description === "string" ? form.description.slice(0, 500) : "",
      category: CATEGORIES.has(String(form.category)) ? String(form.category) : "General",
      privacy,
      coverImage: durableCover(form.coverImage),
      welcomeMessage: typeof form.welcomeMessage === "string" ? form.welcomeMessage.slice(0, 500) : "",
      rules: Array.isArray(form.rules) ? form.rules.filter((item): item is string => typeof item === "string").map((item) => item.slice(0, 240)).slice(0, 5) : [],
      invitedMembers: Array.isArray(form.invitedMembers) ? form.invitedMembers.filter((item): item is string => typeof item === "string").map((item) => item.trim().slice(0, 80)).filter(Boolean).slice(0, 10) : [],
      feeCurrency: feeRail,
    },
  }
}

export function loadCommunityCreateDraft(storage: DraftStorage, userId: unknown, now = Date.now()): CommunityCreateDraft | null {
  try {
    const key = accountKey(userId)
    if (!key) return null
    const raw = storage.getItem(key)
    if (!raw) return null
    const parsed = normalizeCommunityCreateDraft(JSON.parse(raw), now)
    if (!parsed) storage.removeItem(key)
    return parsed
  } catch {
    return null
  }
}

export function saveCommunityCreateDraft(storage: DraftStorage, userId: unknown, draft: CommunityCreateDraft): boolean {
  try {
    const key = accountKey(userId)
    if (!key) return false
    const normalized = normalizeCommunityCreateDraft({ ...draft, updatedAt: Date.now() })
    if (!normalized) return false
    const serialized = JSON.stringify(normalized)
    if (serialized.length > 12_000) return false
    storage.setItem(key, serialized)
    return true
  } catch {
    return false
  }
}

export function clearCommunityCreateDraft(storage: DraftStorage, userId: unknown): boolean {
  try {
    const key = accountKey(userId)
    if (!key) return false
    storage.removeItem(key)
    return true
  } catch {
    return false
  }
}
