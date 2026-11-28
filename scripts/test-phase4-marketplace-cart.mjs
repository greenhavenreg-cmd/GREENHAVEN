import assert from "node:assert/strict"
import {
  addMarketplaceCartItem,
  getMarketplaceCart,
  getMarketplaceCartUnitCount,
  removeMarketplaceCartItemsByIds,
  removeMarketplaceCartItem,
  removeMarketplaceCartItemsBySnapshots,
  updateMarketplaceCartQuantity,
} from "../lib/marketplace/cart.ts"
import { IdentityService } from "../lib/identity/identity-service.ts"

const store = new Map()
globalThis.CustomEvent = class CustomEvent {
  constructor(type, init = {}) { this.type = type; this.detail = init.detail }
}
globalThis.window = {
  localStorage: {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, String(value)),
  },
  dispatchEvent: () => true,
}

const item = (listingId, overrides = {}) => ({
  listingId, quantity: 1, title: `Listing ${listingId}`, price: 12.5,
  currency: "GHC", sellerId: `seller-${listingId}`, availability: 8, ...overrides,
})

store.set("gh_marketplace_cart_v1", JSON.stringify([
  item("a", { quantity: 2 }),
  item("a", { quantity: 3 }),
  { listingId: "broken" },
  item("bad-price", { price: Infinity }),
  item("bad-qty", { quantity: -2 }),
]))
let cart = getMarketplaceCart()
assert.equal(cart.length, 1, "invalid lines are removed and duplicate listing ids are merged")
assert.equal(cart[0].quantity, 5, "duplicate quantities merge within stock and quantity caps")
assert.equal(getMarketplaceCartUnitCount(cart), 5, "unit count uses normalized quantities")

addMarketplaceCartItem(item("b", { quantity: 3, availability: 2 }))
cart = getMarketplaceCart()
assert.equal(cart.find((line) => line.listingId === "b")?.quantity, 2, "add quantity is capped by known stock")

updateMarketplaceCartQuantity("b", 50)
cart = getMarketplaceCart()
assert.equal(cart.find((line) => line.listingId === "b")?.quantity, 2, "quantity updates remain stock bounded")

// Same listing can now hold separate SKU lines without merging quantities.
addMarketplaceCartItem(item("sku-listing", { variantId: "sku-small", variantSku: "TEE-S", variantLabel: "Small", availability: 4 }))
addMarketplaceCartItem(item("sku-listing", { variantId: "sku-large", variantSku: "TEE-L", variantLabel: "Large", availability: 6 }))
addMarketplaceCartItem(item("sku-listing", { variantId: "sku-small", variantSku: "TEE-S", variantLabel: "Small", quantity: 2, availability: 4 }))
cart = getMarketplaceCart()
assert.equal(cart.filter((line) => line.listingId === "sku-listing").length, 2, "different SKU variants remain separate cart lines")
assert.equal(cart.find((line) => line.variantId === "sku-small")?.quantity, 3, "same SKU variant quantities consolidate")
updateMarketplaceCartQuantity("sku-listing", 5, "sku-large")
cart = getMarketplaceCart()
assert.equal(cart.find((line) => line.variantId === "sku-large")?.quantity, 5, "quantity edits target only the selected SKU")
assert.equal(cart.find((line) => line.variantId === "sku-small")?.quantity, 3, "other SKU quantity is unchanged")
// Variant-aware removal must preserve sibling SKUs for the same listing.
removeMarketplaceCartItem("sku-listing", "sku-large")
cart = getMarketplaceCart()
assert.equal(cart.some((line) => line.listingId === "sku-listing" && line.variantId === "sku-large"), false, "removing one SKU removes only that variant")
assert.equal(cart.some((line) => line.listingId === "sku-listing" && line.variantId === "sku-small"), true, "sibling SKU remains in the cart")

// Checkout cleanup must preserve edits made while a request is in flight.
const beforeCheckout = cart.find((line) => line.listingId === "sku-listing" && line.variantId === "sku-small")
assert.ok(beforeCheckout, "small SKU exists before checkout cleanup")
updateMarketplaceCartQuantity("sku-listing", 4, "sku-small")
removeMarketplaceCartItemsBySnapshots([beforeCheckout])
cart = getMarketplaceCart()
assert.equal(cart.find((line) => line.listingId === "sku-listing" && line.variantId === "sku-small")?.quantity, 4, "checkout cleanup preserves a quantity edit made in flight")

// An unchanged successfully reserved line is removed by its exact snapshot.
const unchanged = cart.find((line) => line.listingId === "sku-listing" && line.variantId === "sku-small")
assert.ok(unchanged, "updated small SKU remains before exact cleanup")
removeMarketplaceCartItemsBySnapshots([unchanged])
cart = getMarketplaceCart()
assert.equal(cart.some((line) => line.listingId === "sku-listing" && line.variantId === "sku-small"), false, "exact reserved snapshot is removed after success")


addMarketplaceCartItem(item("c"))
removeMarketplaceCartItemsByIds(["a", "c", "sku-listing"])
cart = getMarketplaceCart()
assert.deepEqual(cart.map((line) => line.listingId), ["b"], "checkout cleanup removes only reserved ids")

store.set("gh_marketplace_cart_v1", JSON.stringify(Array.from({ length: 140 }, (_, i) => item(`line-${i}`))))
cart = getMarketplaceCart()
assert.equal(cart.length, 100, "cart storage is bounded to 100 unique lines")

// Verified canonical identities must never share a browser-local cart namespace.
IdentityService.setFromPi({ uid: "pi-account-a", canonicalUserId: "canonical-account-a", verifiedByServer: true })
assert.equal(getMarketplaceCart().length, 0, "a verified account does not inherit anonymous cart contents")
addMarketplaceCartItem(item("private-a"))
assert.equal(store.has("gh_marketplace_cart_v1:account:canonical-account-a"), true, "verified account cart uses canonical account namespace")
IdentityService.setFromPi({ uid: "pi-account-b", canonicalUserId: "canonical-account-b", verifiedByServer: true })
assert.equal(getMarketplaceCart().length, 0, "switching accounts does not expose the previous account cart")
addMarketplaceCartItem(item("private-b"))
IdentityService.setFromPi({ uid: "pi-account-a", canonicalUserId: "canonical-account-a", verifiedByServer: true })
assert.deepEqual(getMarketplaceCart().map((line) => line.listingId), ["private-a"], "returning to an account restores only that account cart")
IdentityService.clear()
assert.equal(getMarketplaceCart().length, 100, "anonymous cart remains separate and intact after account switching")

console.log("Phase 4 marketplace cart runtime: baseline + account isolation + race-safety assertions PASS")

