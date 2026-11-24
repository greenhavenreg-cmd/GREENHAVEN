# Upgrade worklog — 0.338.109 / RUN388

RUN388 continues the Research & Field Research global-readiness programme on the RUN385 source archive, retaining RUN384's cross-system audit baseline.

## Implemented increments

- RUN386: stable keyset pagination for response inboxes using `(submitted_at DESC, id DESC)`, validated cursors, 50-row initial pages, load-more, total metadata when available, and complete cursor-traversing CSV export with a 20,000-row browser safety cap. Export fails closed on any page retrieval error and preserves spreadsheet formula-injection neutralization.
- RUN387: owner-only, rate-limited descriptive analytics for review states, numeric distributions, choice frequencies and valid date ranges. Categories with fewer than five observations are suppressed; free-text content is never returned. Analytics are bounded at 20,000 rows and explicitly label coverage.
- RUN388: study start/end windows and response quotas in project settings; the public submission path calls a row-locked, idempotent, service-role-only RPC that enforces the quota atomically.

## Coordinated implementation steps

1. Preserve RUN385 as the working source baseline and RUN384 as the cross-system audit record.
2. Replace the fixed response limit with validated timestamp-plus-ID keyset pagination.
3. Add cursor validation, bounded page sizes, no-store responses and project-owner checks.
4. Add a 50-row inbox page and duplicate-safe load-more behavior.
5. Traverse all response pages before creating a CSV; abort on any page failure.
6. Retain CSV quoting and spreadsheet formula-injection neutralization.
7. Add owner-only descriptive analytics with numeric, categorical, date and review-state summaries.
8. Suppress small categorical groups and exclude free-text values from analytics output.
9. Add optional study windows and quotas, enforced by a row-locked idempotent service-role RPC.
10. Hold the RUN388 migration for disposable-database review and Testnet history reconciliation; register focused gates in static and prebuild checks.

## Verification

- RUN385 regression: 19/19.
- RUN386 pagination/export contract: 17/17.
- RUN387 analytics contract: 14/14.
- RUN388 schedule/quota contract: 16/16.
- Migration source inventory: 238 files; new RUN388 migration is REVIEW_REQUIRED.

**Source-only verification scope:** the focused RUN385–RUN388 checks validate source contracts; they do not certify a full production build or live database behavior.

## Release limits

The RUN388 migration is not applied and must precede deployment of the caller. No GitHub push, Vercel Preview deployment, Supabase migration, database write, financial operation, Production or Mainnet action occurred. Current runtime is Node 22.16.0; project requires Node 24.15.0 (`^24.15.0`); dependencies are not installed. Full static verification passes 63/63; production-safety checks pass 21/21; secret-pattern scan reports zero potential secret values across 2,800 text files. Node 24.15.0 dependency-backed typecheck/lint/build, SQL disposable-database/concurrency validation, live Pi Browser, Testnet API, two-account/IDOR, evidence, accessibility, performance, load and recovery acceptance remain outstanding. Production remains NOT APPROVED.
