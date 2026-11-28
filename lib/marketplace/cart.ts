/**
 * Local cart cache — convenience only.
 * Signed-in carts are isolated by verified canonical account identity.
 * Server remains authoritative at order create / pay (inventory, price, seller).
 */
import { IdentityService } from "../identity/identity-service.ts"

export interface MarketplaceCartItem {
  listingId: string
  variantId?: string
  variantSku?: string
  variantLabel?: string
  quantity: number
  addedAt: number
  title: string
  price: number
  currency: string
  sellerId: string
  /** Optional display name captured at add-time (never trusted for settlement). */
  sellerName?: string
  media?: string
  availability?: number
}

const CART_KEY = "gh_marketplace_cart_v1"

/**
 * Keep the legacy key only for anonymous / local-studio browsing. A verified
 * canonical account gets a private namespace; Pi provider UIDs and unverified
 * identities are never used as storage principals. No legacy guest cart is
 * silently assigned to a newly authenticated account.
 */
function storageKey(): string {
  const identity = IdentityService.getIdentity()
  const canonicalId = String(identity.userId || "").trim()
  const verified = identity.authState === "authenticated" &&
    identity.verificationState === "server_verified" &&
    !identity.isLocalStudioId &&
    Boolean(canonicalId)
  return verified ? `${CART_KEY}:account:${encodeURIComponent(canonicalId)}` : CART_KEY
}

/** Stable identifier for the active cart namespace during async checkout work. */
export function getMarketplaceCartNamespace(): string {
  return storageKey()
}
const MAX_CART_LINES = 100
const MAX_QUANTITY = 99

function boundedText(value: unknown, max: number): string | undefined {
  if (typeof value !== "string") return undefined
  const text = value.trim()
  if (!text || text.length > max || /[\u0000-\u001f\u007f]/.test(text)) return undefined
  return text
}

function normalizeCartItem(value: unknown): MarketplaceCartItem | null {
  if (!value || typeof value !== "object") return null
  const item = value as Record<string, unknown>
  const listingId = boundedText(item.listingId, 160)
  const title = boundedText(item.title, 300)
  const sellerId = boundedText(item.sellerId, 160)
  const currency = boundedText(item.currency, 8)?.toUpperCase()
  const price = item.price
  const quantity = item.quantity
  if (!listingId || !title || !sellerId || !currency || !/^[A-Z0-9]{2,8}$/.test(currency)) return null
  if (typeof price !== "number" || !Number.isFinite(price) || price < 0 || price > 1_000_000_000_000) return null
  if (typeof quantity !== "number" || !Number.isSafeInteger(quantity) || quantity < 1) return null

  const availabilityValue = item.availability
  const availability = typeof availabilityValue === "number" && Number.isFinite(availabilityValue) && availabilityValue >= 0
    ? Math.min(1_000_000, Math.floor(availabilityValue))
    : undefined
  const maxQuantity = availability && availability > 0 ? Math.min(MAX_QUANTITY, availability) : MAX_QUANTITY
  const addedAtValue = item.addedAt
  const addedAt = typeof addedAtValue === "number" && Number.isFinite(addedAtValue) && addedAtValue > 0 ? addedAtValue : Date.now()
  const sellerName = boundedText(item.sellerName, 120)
  const media = boundedText(item.media, 2048)

  return {
    listingId,
    ...(boundedText(item.variantId, 80) ? { variantId: boundedText(item.variantId, 80) } : {}),
    ...(boundedText(item.variantSku, 64) ? { variantSku: boundedText(item.variantSku, 64) } : {}),
    ...(boundedText(item.variantLabel, 120) ? { variantLabel: boundedText(item.variantLabel, 120) } : {}),
    quantity: Math.min(MAX_QUANTITY, maxQuantity, Math.max(1, Math.floor(quantity))),
    addedAt,
    title,
    price,
    currency,
    sellerId,
    ...(sellerName ? { sellerName } : {}),
    ...(media ? { media } : {}),
    ...(availability !== undefined ? { availability } : {}),
  }
}

function normalizeCart(value: unknown): MarketplaceCartItem[] {
  if (!Array.isArray(value)) return []
  const unique = new Map<string, MarketplaceCartItem>()
  for (const raw of value.slice(0, MAX_CART_LINES * 2)) {
    const item = normalizeCartItem(raw)
    if (!item) continue
    const lineKey = `${item.listingId}:${item.variantId || "legacy"}`
    const existing = unique.get(lineKey)
    if (!existing) unique.set(lineKey, item)
    else {
      const max = item.availability && item.availability > 0
        ? Math.min(MAX_QUANTITY, item.availability)
        : MAX_QUANTITY
      existing.quantity = Math.min(max, existing.quantity + item.quantity)
    }
    if (unique.size >= MAX_CART_LINES) break
  }
  return Array.from(unique.values())
}

function read(): MarketplaceCartItem[] {
  try {
    if (typeof window === "undefined") return []
    const raw = window.localStorage.getItem(storageKey())
    const parsed = raw ? JSON.parse(raw) : []
    const normalized = normalizeCart(parsed)
    // Repair malformed/legacy cache once so every consumer sees the same contract.
    if (raw && JSON.stringify(parsed) !== JSON.stringify(normalized)) {
      window.localStorage.setItem(storageKey(), JSON.stringify(normalized))
    }
    return normalized
  } catch {
    return []
  }
}

function write(items: MarketplaceCartItem[]) {
  try {
    if (typeof window === "undefined") return
    window.localStorage.setItem(storageKey(), JSON.stringify(normalizeCart(items)))
    window.dispatchEvent(new CustomEvent("ghc:marketplace-cart-changed"))
  } catch {
    /* Best-effort local persistence. Server remains authoritative at checkout. */
  }
}

export function getMarketplaceCart(): MarketplaceCartItem[] {
  return read()
}

/** Unit count for bottom-nav badge (sum of quantities). */
export function getMarketplaceCartUnitCount(items?: MarketplaceCartItem[]): number {
  const list = items || read()
  return list.reduce((n, it) => n + Math.max(0, Number(it.quantity) || 0), 0)
}

export function addMarketplaceCartItem(item: Omit<MarketplaceCartItem, "addedAt">): MarketplaceCartItem[] {
  const items = read()
  const candidate = normalizeCartItem({ ...item, addedAt: Date.now() })
  if (!candidate) return items
  const index = items.findIndex((existing) => existing.listingId === candidate.listingId && (existing.variantId || "") === (candidate.variantId || ""))
  if (index >= 0) {
    const existing = items[index]
    const max = candidate.availability && candidate.availability > 0
      ? Math.min(MAX_QUANTITY, candidate.availability)
      : MAX_QUANTITY
    items[index] = {
      ...existing,
      ...candidate,
      sellerName: candidate.sellerName || existing.sellerName,
      quantity: Math.min(max, existing.quantity + candidate.quantity),
    }
  } else if (items.length < MAX_CART_LINES) {
    items.unshift(candidate)
  }
  write(items)
  return read()
}

export function updateMarketplaceCartQuantity(listingId: string, quantity: number, variantId?: string): MarketplaceCartItem[] {
  const id = boundedText(listingId, 160)
  if (!id || !Number.isFinite(quantity)) return read()
  const items = read()
  const next = items.map((item) => {
    if (item.listingId !== id || (item.variantId || "") !== (variantId || "")) return item
    const max = item.availability && item.availability > 0
      ? Math.min(MAX_QUANTITY, item.availability)
      : MAX_QUANTITY
    return { ...item, quantity: Math.min(max, Math.max(1, Math.floor(quantity))) }
  })
  write(next)
  return read()
}

export function removeMarketplaceCartItem(listingId: string, variantId?: string): MarketplaceCartItem[] {
  const next = read().filter((item) => {
    if (item.listingId !== listingId) return true
    // A selected SKU is its own cart line; removing it must not erase sibling variants.
    if (variantId !== undefined) return (item.variantId || "") !== variantId
    return false
  })
  write(next)
  return next
}

/**
 * Remove only cart lines that are byte-for-byte the same purchase intent that was
 * successfully reserved/paid. If a buyer edits quantity or adds the same SKU while
 * checkout is in flight, preserve that newer intent rather than deleting it.
 */
export function removeMarketplaceCartItemsBySnapshots(snapshots: MarketplaceCartItem[]): MarketplaceCartItem[] {
  if (!snapshots.length) return read()
  const lineKey = (item: MarketplaceCartItem) => JSON.stringify([item.listingId, item.variantId || "legacy", item.sellerId])
  const snapshotByKey = new Map(snapshots.map((item) => [lineKey(item), item]))
  const next = read().filter((current) => {
    const key = lineKey(current)
    const snapshot = snapshotByKey.get(key)
    if (!snapshot) return true
    return current.quantity !== snapshot.quantity || current.addedAt !== snapshot.addedAt ||
      current.price !== snapshot.price || current.currency !== snapshot.currency
  })
  write(next)
  return read()
}

/** Remove only lines that were successfully reserved; preserve unrelated/new cart edits. */
export function removeMarketplaceCartItemsByIds(listingIds: string[]): MarketplaceCartItem[] {
  const ids = new Set(listingIds.map((id) => boundedText(id, 160)).filter((id): id is string => Boolean(id)))
  if (!ids.size) return read()
  const next = read().filter((item) => !ids.has(item.listingId))
  write(next)
  return read()
}

export function clearMarketplaceCart(): void {
  write([])
}

/** Drop lines that belong to the given seller (e.g. own listings before checkout). */
export function removeMarketplaceCartItemsBySeller(sellerId: string): MarketplaceCartItem[] {
  const id = String(sellerId || "").trim()
  if (!id) return read()
  const next = read().filter((item) => item.sellerId !== id)
  write(next)
  return next
}

/** Phase 7: drop cart lines where the viewer is the seller (never checkout own inventory). */
export function removeOwnSellerCartItems(viewerId: string): MarketplaceCartItem[] {
  const uid = String(viewerId || "").trim()
  if (!uid) return getMarketplaceCart()
  const next = getMarketplaceCart().filter((item) => String(item.sellerId || "").trim() !== uid)
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(storageKey(), JSON.stringify(next))
    } catch {
      /* ignore quota */
    }
  }
  return next
}
