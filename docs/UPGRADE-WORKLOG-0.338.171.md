# Upgrade worklog — 0.338.171 / RUN459

1. Started from the latest candidate RUN458 / `0.338.170`; preserved account-scoped Marketplace cart isolation and earlier release work.
2. Audited the full Marketplace buyer/seller order card, shared order mapper, return/dispute helper, commerce route, server order store and existing fulfillment/dispute RPC contract.
3. Identified a concrete timestamp mismatch: UI passed `fulfilledAt` as `deliveredAt`, and the shared API mapper omitted the real `deliveredAt` field.
4. Extended the domain order contract and mapper to preserve delivered, buyer-confirmed and seller-confirmed timestamps, dispute/cancellation reasons and seller notes.
5. Repaired the delivery issue-window calculation to use only the server-recorded delivery timestamp; missing evidence fails closed. Completed orders are directed to the existing order conversation instead of being offered an unavailable dispute transition.
6. Enforced dispute eligibility again in the authenticated commerce API: before delivery or within seven days after verified delivery while unconfirmed. The database transaction remains responsible for validating current order state under lock.
7. Added a bounded dispute reason contract (minimum eight, maximum 500 characters), an inline form and case-reason display.
8. Added RUN459 static/runtime tests and registered them in the static, prebuild and pretypecheck verification chains.
9. Focused RUN459 contract: 12/12. Runtime timestamp, dispute-window boundary, fail-closed and reason-validation assertions passed.
10. Marketplace Phase B/C, Phase 9.4 fulfilment, Phase 10 integrity, Phase 18/19, RUN410/411, Pass 41 and Pass 42 regression checks passed. Dependency-lock integrity, migration inventory (246 canonical migrations), project-truth and documentation hygiene checks passed.
11. Full `npm run verify:static` passed 5,625 PASS checks with zero FAIL checks. RUN459 contract passed 12/12; runtime mapper/dispute-window/reason tests passed. Release integrity RUN300 passed 22/22 and RUN301 passed 20/20. The final archive SHA-256 is recorded in the implementation report.

No migration, database write, provider transaction, Git push or Vercel deployment was performed.

12. Verification remains source-only verification scope in this environment. The project requires Node.js 24.15.0; only Node.js 24.11.1 is available, and dependencies are absent. Supported-runtime typecheck, lint, production build and live Testnet/browser acceptance therefore remain outstanding.
