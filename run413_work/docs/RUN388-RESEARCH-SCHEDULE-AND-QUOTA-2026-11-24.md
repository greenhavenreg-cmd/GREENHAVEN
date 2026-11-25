# RUN388 — Research study scheduling and atomic quotas

**Package:** `gh-connect@0.338.109`  
**Baseline:** RUN387  
**Status:** Source-only; migration held for review; not deployed.

## Delivered

- Research creation supports an optional opening time, closing time and maximum response count.
- Local date/time input is normalized to UTC before persistence; server validates timestamps, ordering and quota bounds.
- Public form metadata checks whether a published study is currently open and whether its response quota is exhausted.
- Final response submission now calls `gh_research_submit_response` instead of directly inserting a response.
- The new RPC locks the project row, checks the lifecycle window and quota inside the transaction, preserves idempotent retries, and serializes concurrent submissions so the response limit cannot be exceeded by concurrent calls.
- The RPC is `SECURITY DEFINER`, pins `search_path`, validates the JSON payload and is executable only by `service_role`.
- Migration inventory classifies the new migration as `REVIEW_REQUIRED`.

## Critical rollout dependency

Migration `20261124150000_run388_research_atomic_schedule_quota.sql` is not applied. The new public submission route depends on this RPC. Do not deploy the route before the migration is reviewed, tested on disposable PostgreSQL, reconciled against exact Testnet history, explicitly approved, applied to Testnet and postflight-verified. If the RPC is absent, the route fails closed with a storage error; it does not fall back to the previous direct insert path.

## Verification and limits

The focused RUN388 source contract checks the row lock, quota count, idempotency ordering, schedule validation, payload bound, security-definer ACL, API integration and held migration classification. Static source checks do not prove SQL runtime correctness. PostgreSQL concurrency, quota boundary, retry, expired/future window, evidence attachment and end-to-end Pi Browser tests remain required. No database migration, database write, GitHub push, Vercel deployment or Mainnet change occurred.
