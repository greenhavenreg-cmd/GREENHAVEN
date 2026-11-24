# RUN390 — Membership, Feed Privacy and Marketplace Read-Path Repair

**Package:** `gh-connect@0.338.111`  
**Scope:** Testnet/Preview source candidate only  
**Database action:** None; migration remains `REVIEW_REQUIRED`

## Live root-cause evidence

The supplied Preview screenshots showed three independent server-side read failures. Inspection of the exact RUN389 source and the connected Testnet PostgreSQL catalog identified the missing privilege contracts:

| Surface | Server read path | Live Testnet service-role SELECT | Client SELECT | Effect |
|---|---|---:|---:|---|
| Membership status | `ghc_membership_entitlements` | Missing | Denied | `/api/membership/status` returns `MEMBERSHIP_STORE_UNAVAILABLE`; purchase UI blocks before payment to prevent duplicate/uncertain charges |
| Feed privacy | `gh_user_mutes` | Missing | Denied | `/api/social/feed` returns `FEED_PRIVACY_FILTER_UNAVAILABLE` rather than risk exposing muted authors |
| Marketplace catalog | `gh_marketplace_listings` | Missing | Denied | Server-filtered listing query fails and catalog endpoint cannot provide a durable catalog |
| Marketplace variants | `gh_marketplace_variants` | Missing | Denied | Catalog cannot hydrate server-side SKU/stock details |

The same live catalog check confirmed the required membership and marketplace SECURITY DEFINER RPCs are executable by `service_role` and not by `anon` or `authenticated`:

- `ghc_membership_upsert`
- `ghc_purchase_membership`
- `ghc_membership_renew_from_verified_intent`
- `ghc_membership_get_lifecycle`
- `gh_marketplace_listing_get`
- `gh_marketplace_listing_upsert`
- `gh_marketplace_listing_upsert_with_variants`
- `gh_marketplace_release_expired_reservations`

Therefore the immediate repair is narrow server-side read access, not a client policy relaxation or rewrite of the payment flows.

## Source changes

Added `supabase/migrations/20261124143000_run390_marketplace_membership_feed_read_grants.sql`:

- Keeps RLS enabled on all four tables.
- Explicitly revokes all table privileges from `PUBLIC`, `anon` and `authenticated`.
- Grants only `SELECT` to `service_role`.
- Checks that all four tables exist and verifies the resulting grants/denials in the migration itself.
- Does not grant direct service-role INSERT/UPDATE/DELETE; writes remain behind existing server-only SECURITY DEFINER RPCs.
- Does not alter rows, balances, entitlements, listings, mute state, payment intents or ledger entries.

No UI bypass, client-side privacy filtering substitute, mock catalog, fake membership status or automatic payment was added. The existing GHC and Pi membership purchase flows remain guarded by authoritative status, completed provider payment, catalog-bound amount/product checks, atomic RPCs and idempotency.

## Required release sequence

1. Synchronize the source to GitHub `testnet` only.
2. Review and apply this exact versioned migration to the Testnet Supabase project, after checking the exact target migration history and validating on disposable PostgreSQL.
3. Verify service-role SELECT and client-role denial on all four tables.
4. Deploy Preview from `testnet` only.
5. In authenticated Pi Browser, verify Membership status and lifecycle; verify Pi payment intent creation/completion/reconciliation; verify GHC purchase against a funded Testnet balance; verify feed with muted/unmuted authors; verify Marketplace listing catalog, filters, pagination, variants and empty-state behavior.
6. Do not infer payment success from UI state. Do not retry a payment when the server reports a completed payment with pending entitlement reconciliation.

## Verification status

- RUN390 static contract: 11/11.
- Existing RUN385–RUN389 source contracts remain included in the static suite.
- Live PostgreSQL catalog inspection confirms the missing privileges that this migration addresses.
- Migration is not applied. No Testnet rows or financial state were changed.
- GitHub push, Vercel Preview deployment, authenticated Pi Browser acceptance and Node 24.15.x dependency-backed build/typecheck/lint remain outstanding.
- Production, Mainnet and all payment/balance records remain untouched.
