# RUN455 — Events and Services directory visibility/navigation unblock

Package: `gh-connect@0.338.167`  
Parent working candidate: RUN454 / `0.338.166`  
Baseline lineage: user-uploaded RUN453 / `0.338.165`

## Finding

A second prepared workflow was found: Services Directory. It already queried canonical Marketplace service listings, required durable server-backed results, filtered active service listings and supported currencies, and handed listing details back to Marketplace. The screen was not mounted and the registry entry remained Coming Soon.

The project already contained an Events discovery screen, authenticated and rate-limited Events API, privacy-aware projection of community events, pagination/search/category filters, and RSVP writes through the existing authenticated community platform route. However, the Ecosystem registry still marked Events `COMING_SOON`, supplied no destination, and the discovery screen was not mounted by the Ecosystem directory. The server-side release gate correctly prevented access while the registry was closed.

## Change

- Marked Events `ACTIVE` and routed it to the canonical Ecosystem focus destination.
- Marked Services (`services-ip`) `ACTIVE`, routed it through the canonical Ecosystem focus destination, and mounted the existing Services Directory screen.
- Services listing details hand off to the existing Marketplace listing detail route; no new checkout or payment behavior was added.
- Mounted the existing `EventsDiscoveryScreen` from the Ecosystem directory and added an in-place back action.
- Selecting Events from the directory opens the screen directly; canonical `openService("events")` deep links resolve to the same focus.
- Preserved the server release gate, authenticated viewer requirement, durable rate limit, server-side reads, private/invite-only membership filtering, and durable RSVP write path.
- Left Charity, donations and other incomplete services gated. The existing Charity screen is a read-only personal contribution summary and does not implement a donation flow.
- Added RUN455 regression coverage and updated the existing Events release contract to assert the now-active, wired state.

## Verification boundary

- RUN455 combined Events/Services focused source contract: 13/13.
- Services release-boundary contract: 10/10.
- Events release-boundary contract: 14/14.
- Existing Events discovery runtime contract, Seller Centre contract and shell contract are included in the full static suite.
- No database migration or live database change was made.
- No Pi/GHC payment, donation, payout, refund or other financial operation was invoked.
- No Git push, Vercel deployment, or live browser/device test was performed.
- Full Node 24.15.x dependency-backed typecheck, lint and Next.js build remain required. This workspace currently exposes Node 22.16.0 and has no installed project dependencies.

## Release status

RUN455 is a source-level visibility and navigation unblock for the existing Events and Services Directory workflows only. It does not certify that production/Testnet currently contains upcoming events or active service listings, or that live RSVP/listing reads succeed against the deployed database. Production remains NOT APPROVED pending supported-runtime build and environment/device acceptance.
