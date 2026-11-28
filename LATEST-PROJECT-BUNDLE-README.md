# GreenHaven — Current Project Bundle

**Package:** `gh-connect@0.338.173`  
**Candidate:** RUN461 — Reward Claim Response Integrity  
**Baseline archive:** `GREENHAVEN-0.338.172-RUN460-REFERRAL-READ-HARDENING-2026-11-27-2.zip`  
**Working archive:** `GREENHAVEN-0.338.173-RUN461-REWARD-CLAIM-RESPONSE-INTEGRITY-2026-11-27.zip`  
**Date:** 27 November 2026  
**Status:** Source candidate only; production NOT APPROVED.

RUN461 hardens the authoritative GHC reward-claim response parser, matured Daily Claim hold ownership and row integrity, and the GHC membership purchase RPC response boundary. It does not change reward formulas, qualification, 48-hour maturity, settlement, ledger authority, membership/referral economics or SQL migrations. RUN460 referral read/attribution hardening and earlier RUN454–RUN459 changes remain preserved.

The network/DB-independent static verification suite passed 63/63 suites. RUN461 passed 21/21 focused assertions; RUN460 passed 8/8; RUN450 passed 17/17; Phase 11 reconciliation passed 32/32. Prebuild checks stop because the TypeScript dependency is absent. Node.js 24.15.0 and installed dependencies are required for supported-runtime typecheck, lint and production build. Browser/device and live Testnet acceptance remain outstanding.

No migration, live database mutation, provider transaction, Git push or Vercel deployment was performed. This bundle is not a production release.


**RUN470 (2026-11-28):** money-action single-flight guards and messaging-premium purchase idempotency, confirmation and no-dismiss-in-flight. See `docs/RUN470-MONEY-ACTION-SINGLE-FLIGHT-2026-11-28.md`. Static suite passes; typecheck, build, browser and Testnet acceptance still outstanding. Production NOT APPROVED.

**RUN471 (2026-11-28):** comma-decimal amount input for Withdraw Pi, Send GHC and Request GHC (`1,5` no longer becomes `15`). RUN470 doc registration fixed so `verify:static` passes. See `docs/RUN471-COMMA-DECIMAL-AMOUNT-INPUT-2026-11-28.md`. Production NOT APPROVED.

**RUN472 (2026-11-28):** stable GHC membership purchase reference across retries; truthful unconfirmed-purchase message. See `docs/RUN472-MEMBERSHIP-ATTEMPT-REFERENCE-2026-11-28.md`. Production NOT APPROVED.

**RUN473 (2026-11-28):** post and curation audit — dead author lookups (placeholder host) fixed, delete/edit/reward-read/curation hardening, client curation error mapping. See `docs/RUN473-POST-CURATION-AUDIT-2026-11-28.md`. Production NOT APPROVED.


**RUN474 (2026-11-28):** comments and saved-posts audit — unsave of unreachable posts, mention visibility and wildcard fix, comment route validation. See `docs/RUN474-COMMENTS-AND-SAVES-AUDIT-2026-11-28.md`. Production NOT APPROVED.

**RUN475 (2026-11-28):** messaging and verification store `rest()` helpers forwarded no method or body (every write was a GET); fixed, plus message-delete false success. See `docs/RUN475-MESSAGING-STORE-WRITES-2026-11-28.md`. Review on Testnet before release. Production NOT APPROVED.

**RUN476 (2026-11-28):** messaging send receipts retried and backfilled on replay; send and mark-read no longer report success after a failed write; server fetches that used relative Supabase paths (economy notifications, withdrawal and payment history, passkeys, revenue append, curation reads, health probe) now use the shared REST client. See `docs/RUN476-MESSAGING-SEND-RECEIPTS-2026-11-28.md`. Production NOT APPROVED.

**RUN477 (2026-11-28):** economy notification list and unread count answer 503 on a store outage instead of an empty/zero 200, and the unread count is exact; post media-attach rollback and quote link results verified; match-signal calls timeout-bounded. See `docs/RUN477-NOTIFICATION-OUTAGE-TRUTH-AND-POST-WRITE-AUDIT-2026-11-28.md`. Production NOT APPROVED.

**RUN478 (2026-11-28):** conversation pin/archive/mute saves roll back and report when the server rejects them; restrict failures raise a toast. See `docs/RUN478-CONVERSATION-PREFS-TRUTH-2026-11-28.md`. Production NOT APPROVED.

**RUN479 (2026-11-28):** community role changes are server-first; a rejected, non-durable or unreachable write no longer shows "Role updated". See `docs/RUN479-COMMUNITY-ROLE-TRUTH-2026-11-28.md`. Production NOT APPROVED.

**RUN480 (2026-11-28):** saved-post list and count hide deleted, archived, private and blocked posts via the batched visibility filter. See `docs/RUN480-SAVED-LIST-VISIBILITY-2026-11-28.md`. Production NOT APPROVED.

**RUN481 (2026-11-28):** global search no longer shows "No results" while the server search is in flight or after it fails; adds searching, unavailable and retry states. See `docs/RUN481-SEARCH-STATUS-TRUTH-2026-11-28.md`. Production NOT APPROVED.

**RUN482 (2026-11-28):** passkeys list and payment recovery banner keep the last known state and show an explicit error when a load fails, instead of reading as empty. See `docs/RUN482-PASSKEYS-AND-RECOVERY-LOAD-TRUTH-2026-11-28.md`. Production NOT APPROVED.

**RUN483 (2026-11-28):** rewards achievements, the community directory refresh and profile listings keep the last known state and show an explicit error with retry when a load fails, instead of reading as empty. See `docs/RUN483-LIST-FAILURE-TRUTH-2026-11-28.md`.

**RUN484 (2026-11-28):** the GH ID paste field gained an accessible name; static audit of failure branches, controls and listeners found no other defects. See `docs/RUN484-STATIC-AUDIT-AND-IDENTITY-SCAN-LABEL-2026-11-28.md`.

**RUN485 (2026-11-28):** documentation-only server-side audit (API authorization, body bounds, upstream handling, headers); no source change. See `docs/RUN485-SERVER-SIDE-AUDIT-2026-11-28.md`.

**RUN486 (2026-11-28):** public survey questions and election-panel controls gained accessible names and label associations. See `docs/RUN486-RESEARCH-FORM-LABELS-2026-11-28.md`.

**RUN487 (2026-11-28):** timed-examination questions, options and clock, and the studio preview, gained accessible names, grouping and a non-chatty timer; toasts no longer show raw server codes and error toasts now stay up for the intended 6.5s. See `docs/RUN487-EXAM-AND-PREVIEW-LABELS-2026-11-28.md`. Production NOT APPROVED.

**RUN488 (2026-11-28):** notification bell status text, toast and accessible names moved to the localisation catalogue; actions container is a named group. See `docs/RUN488-NOTIFICATION-BELL-I18N-2026-11-28.md`. Production NOT APPROVED.

**RUN489 (2026-11-28):** story viewer arrow keys ignored while typing in the reply box; Escape closes the viewers sheet before the story. See `docs/RUN489-STORY-VIEWER-KEYS-2026-11-28.md`. Production NOT APPROVED.

**RUN490 (2026-11-28):** media lightbox arrow keys no longer fire inside video/audio controls, sliders or text fields; global key-handler audit. See `docs/RUN490-LIGHTBOX-ARROW-KEYS-2026-11-28.md`. Production NOT APPROVED.

**RUN491 (2026-11-28):** marketplace listing price and min/max price filters accept comma decimals (1,5 no longer becomes 15). See `docs/RUN491-MARKETPLACE-PRICE-INPUT-2026-11-28.md`. Production NOT APPROVED.

**RUN492 (2026-11-28):** Withdraw GHC comma-decimal 10x fix (`parseGhcInput` stripped commas); SKU variant prices accept comma decimals and reject ambiguous `1,000`. See `docs/RUN492-GHC-AND-SKU-COMMA-PRICE-2026-11-28.md`. Production NOT APPROVED.

**RUN493 (2026-11-28):** community Mute chat no longer flips a local flag ahead of the server; mute failures are reported; profile membership badge ignores error responses. See `docs/RUN493-COMMUNITY-MUTE-TRUTH-2026-11-28.md`. Production NOT APPROVED.

**RUN494 (2026-11-28):** notification bell Mark all read is single-flight and clears the app attention badge only after every store confirms. See `docs/RUN494-NOTIFICATION-MARK-ALL-TRUTH-2026-11-28.md`. Production NOT APPROVED.

**RUN495 (2026-11-28):** messaging failure toasts now render as errors (they sent an ignored `tone`); failed-message retry no longer overwrites the composer draft. See `docs/RUN495-MESSAGING-TOAST-AND-RETRY-DRAFT-2026-11-28.md`. Production NOT APPROVED.

**RUN496 (2026-11-28):** Messages voice notes were uploaded then never sent while a success toast was shown; they are now delivered as attachments. See `docs/RUN496-VOICE-NOTE-DELIVERY-2026-11-28.md`. Production NOT APPROVED.

**RUN497 (2026-11-28):** unblock, comment report and community mute/unmute no longer add a second, contradictory success toast after the context action already reported a failure. See `docs/RUN497-NO-CONTRADICTORY-SUCCESS-TOASTS-2026-11-28.md`. Production NOT APPROVED.

**RUN498 (2026-11-28):** bottom-navigation Messages/Communities badges no longer count archived or muted conversations (shared `lib/messaging/unread-attention.ts`); profile interest chips gained accessible remove labels. See `docs/RUN498-NAV-ATTENTION-AND-INTEREST-CHIPS-2026-11-28.md`. Production NOT APPROVED.

**RUN499 (2026-11-28):** close buttons on eleven sheets (send/receive/request GHC, payment and transaction details, requests panel, share, search, report, post sheets) enlarged from ~34px to a 44px touch target without shifting headers. See `docs/RUN499-CLOSE-BUTTON-TOUCH-TARGETS-2026-11-28.md`. Production NOT APPROVED.

**RUN500 (2026-11-28):** messaging read seam shares the single unread-attention rule. **RUN501 (2026-11-28):** Messages tab shows a numeric unread pill (archived and muted excluded); toasts are dismissible. See `docs/RUN501-MESSAGES-COUNT-BADGE-AND-TOAST-DISMISS-2026-11-28.md`. Production NOT APPROVED.
