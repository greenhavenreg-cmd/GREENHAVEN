# RUN511 — Published products must have a positive price

Status: source change only. Production NOT APPROVED. No SQL, ledger, fee or payment logic changed.

## Problem
`Number("")` and `Number(null)` are `0`. The seller form accepted an empty price as 0 and the listings API accepted `0`, `""` and `null` for an active product, although the seller checklist marks "Price greater than zero" as required. The result was a published product with no price that could be ordered without a charge.

## Fix
- Seller form: an empty price is invalid and the price must be greater than zero ("Enter a price greater than zero").
- `POST /api/marketplace/listings`: an `active` product with a missing, empty or non-positive price returns `400 PRICE_REQUIRED`. Drafts, pause, remove, sold-out, services and opportunities are unchanged. Upper bound and decimal precision rules are unchanged.

## Note
Existing active products already stored with price 0 are not modified; they will be rejected the next time they are edited and re-published with 0. Review them with `select id, title from gh_marketplace_listings where status='active' and kind='product' and price <= 0;` (verify the table name against your live schema first).
