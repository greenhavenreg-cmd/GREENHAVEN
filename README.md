# GreenHaven — Current Project Candidate

**Package:** `gh-connect@0.338.173`  
**Current source version:** `0.338.173`  
**Candidate:** RUN461 — Reward Claim Response Integrity  
**Candidate archive:** `GREENHAVEN-0.338.173-RUN461-REWARD-CLAIM-RESPONSE-INTEGRITY-2026-11-27.zip`  
**Status:** Source candidate only.
Production status: **NOT APPROVED**.

## RUN461 — Reward Claim Response Integrity

RUN461 tightens the authoritative GHC reward claim and GHC membership purchase boundaries, including strict nested spend and active-entitlement response validation. A claim RPC response is accepted only when it explicitly reports success and includes a valid idempotency flag, bounded transaction ID and positive finite amount. Incomplete or malformed success responses are treated as unavailable/ambiguous and can be safely retried through the existing database idempotency path. Matured Daily Claim candidates are validated for owner, ID, amount, timestamp and metadata before claim RPC invocation. No reward formula, eligibility, 48-hour maturity, settlement, ledger authority or SQL migration changed.

See `docs/RUN461-REWARD-CLAIM-RESPONSE-INTEGRITY-2026-11-27.md`, `docs/CURRENT-SOURCE-OF-TRUTH-2026-11-27.md` and `docs/UPGRADE-WORKLOG-0.338.173.md`.

## RUN462 / RUN463 — production-grade UX and money-action hardening

RUN462 bounded client requests and chunk-load recovery. RUN463 adds a shared dialog accessibility hook (Escape, focus trap/restore, scroll lock), dialog semantics for Creator Studio, profile preview, post options, Get GHC and stories, payload-bound withdrawal idempotency with inline address validation, double-start protection for GHC packs and cross-method membership purchases, assertive error toasts, `type="button"` on 100 form-free buttons and a 16px touch-input baseline. See `docs/RUN462-PRODUCTION-GRADE-AUDIT-2026-11-27.md` and `docs/RUN463-DIALOG-AND-MONEY-UX-BASELINE-2026-11-27.md`. No version bump, migration or economics change.

## RUN464 — sheet accessibility and money-action guards

The shared dialog hook now covers the Withdraw, Send/Receive/Request GHC, Share, Create, Confirmation, payment/transaction detail, Create group and Report sheets. GHC request Pay/Cancel and reserved-earnings release have synchronous double-tap guards. See `docs/RUN464-SHEET-A11Y-AND-ACTION-GUARDS-2026-11-27.md`. No version bump, migration or economics change.

## RUN465 — overlay semantics and control labels

Stack-aware dialog hook, 16 more overlays on it (including profile preview and the PIN sheet), a fix for duplicate JSX attributes in the story overlays, accessible names for 54 form controls and a 10px text floor. See `docs/RUN465-OVERLAY-SEMANTICS-AND-CONTROL-LABELS-2026-11-28.md`.

## RUN466 — search and notification keyboard model

Shared tabs keyboard helper for the notification bell and global search, a real combobox for the discovery search bar, announced search results and correct singular/plural count labels. See `docs/RUN466-SEARCH-NOTIFICATION-KEYBOARD-2026-11-28.md`.

## RUN467 — keyboard-reachable cards and notification sections

Discovery cards and the clickable image fallback are keyboard activatable through a shared helper, four unlabeled controls gained names, and the notification bell groups threads under Today / Yesterday / Earlier headers and renders them 30 at a time. See `docs/RUN467-KEYBOARD-CARDS-AND-NOTIFICATION-SECTIONS-2026-11-28.md`.

## RUN469 — overlay hook and search input polish

Join picker, intent picker and GHC spend confirmation use the shared dialog hook; message search handles Escape; all search fields show a Search key on mobile. See `docs/RUN469-OVERLAY-HOOK-AND-SEARCH-INPUT-2026-11-28.md`.

## RUN468 — touch-target expansion

45 small icon buttons keep their look but gain an invisible 44px hit area via `.gh-hit-44`. See `docs/RUN468-TOUCH-TARGET-EXPANSION-2026-11-28.md`.

## RUN470 — money-action single-flight and premium purchase idempotency

Messaging premium purchases sent no reference, so the server used a time-based one and a double tap or retry could debit twice. The client now reuses one stable reference per purchase, the server validates it before any spend, and purchases need a Confirm step and cannot be dismissed mid-flight. Pi withdrawal (submit, PIN verify, release), reward claims (wallet and Rewards Centre), payment recovery and Pi payout authorize/revoke gained synchronous ref guards. See `docs/RUN470-MONEY-ACTION-SINGLE-FLIGHT-2026-11-28.md`. No version bump, migration or economics change.

## RUN471 — comma-decimal amount input

Withdraw Pi, Send GHC and Request GHC dropped the comma that many mobile keypads show as the decimal key, so `1,5` became `15`. All three now share `sanitizeAmountInput`. See `docs/RUN471-COMMA-DECIMAL-AMOUNT-INPUT-2026-11-28.md`. No version bump, migration or economics change.

## RUN475 — messaging and verification store writes

The messaging store and verification-request store `rest()` helpers sent every insert, patch and receipt write as a GET, so those writes never reached the database while reporting success. Both now forward method, body and Prefer. Message delete also no longer reports success when nothing changed, and pin/delete store failures return 503. See `docs/RUN475-MESSAGING-STORE-WRITES-2026-11-28.md`. No version bump, migration or economics change.

## RUN474 — comments and saved-posts audit

Saved posts that were deleted, archived, made private or blocked can now be unsaved; mention notices only reach members who can open the post; the mention lookup no longer treats `_` as a wildcard; comment routes validate ids and bodies and cannot raise unhandled rejections. See `docs/RUN474-COMMENTS-AND-SAVES-AUDIT-2026-11-28.md`. No version bump, migration or economics change.

## RUN473 — post and curation audit

Fixes author lookups that targeted a placeholder host (author notifications and curation redistribution never ran), a delete that could report success on rejection, the edit route (media round-trip, rate limit, media-only posts), reward/review-status visibility, curation error mapping and create-route validation. See `docs/RUN473-POST-CURATION-AUDIT-2026-11-28.md`. No version bump, migration or economics change.

## RUN472 — membership attempt reference

The GHC membership purchase now reuses one spend reference per tier and period until the server answers, and an unconfirmed purchase no longer says GHC was not spent. See `docs/RUN472-MEMBERSHIP-ATTEMPT-REFERENCE-2026-11-28.md`. No version bump, migration or economics change.

## Verification and release boundary

The full network/DB-independent static suite passed 63/63 suites. RUN461 focused contract: 21/21. RUN460 referral hardening: 8/8. RUN450 economy journey: 17/17. Phase 11 wallet cross-feature reconciliation: 32/32. Prebuild checks stop because the `typescript` dependency is absent. The complete dependency-backed static suite, Node 24.15+ typecheck/lint/build, browser/device and live Testnet acceptance remain outstanding because the available runtime is Node 22.16.0 and dependencies are absent. No migrations, database writes, provider transactions, Git pushes or deployments were performed. Production remains NOT APPROVED.
