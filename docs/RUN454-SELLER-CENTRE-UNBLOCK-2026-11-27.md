# RUN454 — Seller Centre visibility and navigation unblock

Package: `gh-connect@0.338.166`  
Parent candidate: `0.338.165 / RUN453`  
Date: 27 November 2026

## Finding

The Marketplace already contained a complete Seller Command Centre in its owner-scoped `mine` bucket, including durable seller listing/order data states, inventory quality indicators, order attention, seller insights, listing creation, and order navigation. The Ecosystem registry nevertheless marked `seller-centre` as `COMING_SOON` with no destination. That contradicted the implemented surface and prevented directory users from opening it.

## Change

- Released the existing Seller Centre entry as `ACTIVE`.
- Routed it through the canonical Marketplace overlay to the existing `mine` bucket.
- Reused the existing seller listing/order loaders and command centre; no duplicate seller implementation or new financial behavior was introduced.
- Added a focused regression gate to `verify:static` and `prebuild:checks`.
- Bumped release identity to `0.338.166`.

## Verification

- RUN454 focused source contract: pending execution.
- Full static suite: pending rerun.
- Prebuild, TypeScript, lint and production build: blocked in this workspace because Node is `22.16.0`; project requires Node `^24.15.0`.
- Browser/device, live Supabase, seller multi-account and Vercel Preview acceptance: not performed.
- No database migrations, provider transactions, GitHub pushes or Vercel deployments performed.

## Release boundary

This unblocks the already implemented Seller Centre UI only. It does not certify checkout, payout, fulfilment or the broader marketplace as production-ready.
