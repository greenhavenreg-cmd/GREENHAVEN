# RUN459 — Marketplace Order Transparency and Dispute Integrity

**Package:** `gh-connect@0.338.171`  
**Parent:** RUN458 / `0.338.170`  
**Date:** 27 November 2026  
**Status:** Source candidate; not deployed or production-approved.

## Defects addressed

The buyer issue-window UI passed `fulfilledAt` (when the seller began fulfilment) into a helper whose seven-day clock is supposed to start at delivery. The shared durable order mapper also omitted `deliveredAt`, despite the server order store and database RPC returning it. As a result, the UI could show an inaccurate issue deadline or lack the correct timestamp. The completed-order guide could also imply a standard dispute was available even though the commerce RPC only accepts disputes for confirmed/fulfilling orders. Finally, the UI opened disputes without collecting a useful reason.

## Implementation

1. Extended `MarketplaceOrder` to retain `deliveredAt`, buyer/seller confirmation timestamps, dispute/cancellation reasons and seller notes.
2. Extended `mapMarketplaceOrderRecord` to normalize both camelCase API and snake_case database fields without fabricating missing timestamps.
3. Changed buyer issue guidance to use only the recorded `deliveredAt`; it no longer substitutes fulfilment start, completion time or a generic update time. Missing delivery evidence fails closed.
4. Completed orders now direct participants to the existing order conversation for follow-up and do not promise a standard dispute transition that the database rejects.
5. Added a server-side dispute eligibility check to the authenticated commerce route. A dispute is available before delivery or for seven days after a server-recorded delivery while the order remains unconfirmed. The check is not delegated to client UI state.
6. Dispute submissions now require a reason of at least eight characters, bounded to 500 characters. The buyer/seller order card collects the reason and displays recorded dispute/cancellation context.
7. The order card now displays the actual delivered timestamp.
8. Added RUN459 static and runtime regression checks and registered them in `verify:static`, `prebuild:checks` and `pretypecheck`.

## Verification

- RUN459 static contract: 12/12.
- RUN459 runtime mapper, ISO/epoch timestamp, dispute-window boundary and reason-validation tests: passed.
- Marketplace Phase B commerce: 9/9.
- Marketplace Phase C trust: 13/13.
- Phase 9.4 fulfilment contract: 28/28; parser: 15/15.
- Phase 10 Marketplace integrity: 30/30.
- RUN410 Marketplace maturity: 10/10.
- RUN411 Marketplace commerce reliability: 12/12.
- Phase 18 payment binding: 17/17.
- Phase 19 RPC transport: 12/12.
- Pass 41 resilience: 12/12; Pass 42 mapper boundary: 14/14 and runtime mapper assertions passed.
- Full static suite is run separately and recorded in the current project truth after the final source changes.

## Boundaries

No migration was added. No payment, refund, escrow, payout, seller-proceeds, inventory or order settlement state is changed by this release. The dispute action only records a case reason and changes the existing order status through the existing transactional RPC. Existing payout and dispute-review controls remain authoritative. No database was modified, no provider transaction was made, and no Git push or Vercel deployment occurred. Production remains **NOT APPROVED** pending Node.js 24.15.0 dependency-backed typecheck/lint/build and live Testnet/browser acceptance.
