- [RUN515 Media upload CSP fetch failure](RUN515-MEDIA-UPLOAD-CSP-FETCH-FAILURE-2026-11-28.md) — uploads failed with "Failed to fetch" because data:/blob: fetches were blocked by connect-src; now decoded locally and CSP corrected.
- [RUN514 One-line post actions and compact stories](RUN514-ONE-LINE-POST-ACTIONS-AND-COMPACT-STORIES-2026-11-28.md) — vote button: tap = like/reactions, hold = Community curation; vote, quality, comment, save and share on one line; smaller story cards.
- [RUN513 Testnet A2U gate and referral defaults](RUN513-TESTNET-A2U-GATE-AND-REFERRAL-DEFAULTS-2026-11-28.md) — one shared Testnet gate for every A2U/withdrawal/referral flag (default on in Testnet only, names the missing setting).
- [RUN512 Testnet Profile Parity](RUN512-TESTNET-PROFILE-PARITY-2026-11-28.md) — Testnet env profile now enables the earnings adapters and operator ids; a guard keeps the profile and the code's gate flags in sync.
- [RUN511 Marketplace Positive Price](RUN511-MARKETPLACE-POSITIVE-PRICE-2026-11-28.md) — published products must have a price greater than zero on the seller form and the listings API.
- [RUN510 RPC Source Drift](RUN510-RPC-SOURCE-DRIFT-2026-11-28.md) — inventories 20 RPCs called by live routes with no migration source, adds a drift guard and an operator verification query.
- [RUN509 Secure Random Sweep and Notification Bell Crashes](RUN509-SECURE-RANDOM-SWEEP-AND-NOTIFICATION-BELL-CRASHES-2026-11-28.md) — replaces Math.random() IDs/tokens with fail-closed secure IDs, fixes two notification-bell runtime crashes, removes a fabricated match.
- [RUN508 Secure Idempotency and Comment Reactions](RUN508-SECURE-IDEMPOTENCY-AND-COMMENT-REACTIONS-2026-11-28.md) — removes Math.random() idempotency fallbacks on money/publish paths and replaces the random comment reaction with a real picker.
- [RUN506 Direct-call Control State and Accessibility](RUN506-DIRECT-CALL-CONTROL-STATE-2026-11-28.md) — resets local microphone/camera UI state per call and announces call status accessibly.
- [RUN503 Durable Discovery and RSVP](RUN503-DURABLE-DISCOVERY-RSVP-2026-11-28.md) — Discover Events and Services use authenticated durable directories; RSVP supports Going, Maybe and Can't go with server-confirmed state.
- [RUN497 No Contradictory Success Toasts](RUN497-NO-CONTRADICTORY-SUCCESS-TOASTS-2026-11-28.md) — unblock, comment report and community mute no longer show a success toast after a failure.
- [RUN496 Voice Note Delivery](RUN496-VOICE-NOTE-DELIVERY-2026-11-28.md) — recorded voice notes are now actually sent as attachments instead of showing a success toast and stopping.
- [RUN495 Messaging Toast and Retry Draft](RUN495-MESSAGING-TOAST-AND-RETRY-DRAFT-2026-11-28.md) — messaging failures show as errors; retrying a failed message no longer overwrites the draft being typed.
- [RUN494 Notification Mark-All Truth](RUN494-NOTIFICATION-MARK-ALL-TRUTH-2026-11-28.md) — Mark all read is single-flight and only clears the app badge after the server confirms.
- [RUN493 Community Mute Truth](RUN493-COMMUNITY-MUTE-TRUTH-2026-11-28.md) — community Mute chat reflects the real server state; mute failures are reported; membership badge survives a server error.
- [RUN492 GHC and SKU Comma Price](RUN492-GHC-AND-SKU-COMMA-PRICE-2026-11-28.md) — Withdraw GHC no longer turns 1,5 into 15; SKU variant prices accept comma decimals and reject ambiguous 1,000.
- [RUN491 Marketplace Price Input](RUN491-MARKETPLACE-PRICE-INPUT-2026-11-28.md) — listing price and price filters accept comma decimals instead of turning 1,5 into 15.
- [RUN490 Lightbox Arrow Keys](RUN490-LIGHTBOX-ARROW-KEYS-2026-11-28.md) — gallery arrows no longer hijack video seeking, sliders or text fields.
- [RUN489 Story Viewer Keys](RUN489-STORY-VIEWER-KEYS-2026-11-28.md) — story viewer arrow keys no longer fire while typing; Escape closes the viewers sheet first.
- [RUN488 Notification Bell I18n](RUN488-NOTIFICATION-BELL-I18N-2026-11-28.md) — notification bell status text and accessible names are localisable.
- [RUN487 Exam and Preview Labels](RUN487-EXAM-AND-PREVIEW-LABELS-2026-11-28.md) — timed-examination questions, options and clock, and the studio preview now have accessible names.
- [RUN486 Research Form Labels](RUN486-RESEARCH-FORM-LABELS-2026-11-28.md) — public survey questions and election panel controls now have accessible names.
- [RUN485 Server-Side Audit](RUN485-SERVER-SIDE-AUDIT-2026-11-28.md) — documentation-only audit of API authorization, body bounds, upstream handling and security headers.
- [RUN484 Static Audit and Identity Scan Label](RUN484-STATIC-AUDIT-AND-IDENTITY-SCAN-LABEL-2026-11-28.md) — accessible name for the GH ID paste field; audit of failure branches, controls and listeners.
- [RUN483 List Failure Truth](RUN483-LIST-FAILURE-TRUTH-2026-11-28.md) — failed loads no longer read as "no achievements", an empty community directory or "no listings".
- [RUN482 Passkeys and Recovery Load Truth](RUN482-PASSKEYS-AND-RECOVERY-LOAD-TRUTH-2026-11-28.md) — failed loads no longer read as "no passkeys" or hide pending payment recoveries.
- [RUN481 Search Status Truth](RUN481-SEARCH-STATUS-TRUTH-2026-11-28.md) — global search shows loading and failure states instead of a false "No results".
- [RUN480 Saved List Visibility](RUN480-SAVED-LIST-VISIBILITY-2026-11-28.md) — saved-post list and count hide posts the member can no longer open.
- [RUN479 Community Role Truth](RUN479-COMMUNITY-ROLE-TRUTH-2026-11-28.md) — role changes are server-first and no longer report success when the server rejects them.
- [RUN478 Conversation Preference Truth](RUN478-CONVERSATION-PREFS-TRUTH-2026-11-28.md) — pin/archive/mute saves roll back and report when the server rejects them; restrict failures raise a toast.
- [RUN477 Notification Outage Truth](RUN477-NOTIFICATION-OUTAGE-TRUTH-AND-POST-WRITE-AUDIT-2026-11-28.md) — economy notification list/unread-count answer 503 on outage and count exactly; post media-attach rollback and quote link verified; match signal calls timeout-bounded.
- [RUN476 Messaging Send Receipts](RUN476-MESSAGING-SEND-RECEIPTS-2026-11-28.md) — send receipts retried; send and mark-read no longer report false success; relative-URL Supabase fetches (economy notifications, history lists, passkeys, revenue append, health probe) repaired.
- [RUN475 Messaging Store Writes](RUN475-MESSAGING-STORE-WRITES-2026-11-28.md) — messaging and verification `rest()` helpers sent every write as a GET; fixed, plus delete false-success and 404-for-503 statuses.
- [RUN474 Comments and Saves Audit](RUN474-COMMENTS-AND-SAVES-AUDIT-2026-11-28.md) — unsave of unreachable posts, mention notice visibility and wildcard fix, comment route validation and background guards.
- [RUN473 Post and Curation Audit](RUN473-POST-CURATION-AUDIT-2026-11-28.md) — fixes dead author lookups (placeholder host), delete false-success, edit media/rate-limit, reward/review visibility, curation error mapping.
- [RUN472 Membership Attempt Reference](RUN472-MEMBERSHIP-ATTEMPT-REFERENCE-2026-11-28.md) — GHC membership purchase reuses one reference across retries; unconfirmed purchases no longer claim GHC was not spent.
- [RUN471 Comma-Decimal Amount Input](RUN471-COMMA-DECIMAL-AMOUNT-INPUT-2026-11-28.md) — comma keypads no longer turn 1,5 into 15 in Withdraw Pi, Send GHC and Request GHC.
- [RUN470 Money-Action Single-Flight](RUN470-MONEY-ACTION-SINGLE-FLIGHT-2026-11-28.md) — premium purchase idempotency and confirmation; synchronous guards on withdrawal, claim, recovery and authorization actions.
- [RUN469 Overlay Hook and Search Input](RUN469-OVERLAY-HOOK-AND-SEARCH-INPUT-2026-11-28.md) — three more overlays on the shared dialog hook; message-search Escape; search enter key on all search fields.
- [RUN468 Touch Target Expansion](RUN468-TOUCH-TARGET-EXPANSION-2026-11-28.md) — invisible 44px hit areas for 45 small icon buttons.
- [RUN467 Keyboard Cards and Notification Sections](RUN467-KEYBOARD-CARDS-AND-NOTIFICATION-SECTIONS-2026-11-28.md) — keyboard-reachable discovery cards, named controls, bell date sections and progressive rendering.
- [RUN466 Search, Notification and Filter Keyboard Model](RUN466-SEARCH-NOTIFICATION-KEYBOARD-2026-11-28.md) — shared tabs keyboard helper, search combobox, announced results, count pluralisation.
- [RUN465 Overlay Semantics and Control Labels](RUN465-OVERLAY-SEMANTICS-AND-CONTROL-LABELS-2026-11-28.md) — stack-aware dialog hook, more overlays on the hook, duplicate-JSX fix, control labels, 10px text floor.
- [RUN464 Sheet Accessibility and Action Guards](RUN464-SHEET-A11Y-AND-ACTION-GUARDS-2026-11-27.md) — money-flow sheets on the shared dialog hook, request/release double-tap guards.
- [RUN463 Dialog and Money UX Baseline](RUN463-DIALOG-AND-MONEY-UX-BASELINE-2026-11-27.md) — shared dialog accessibility hook, withdrawal/Get GHC/membership double-submit and form hardening.
- [RUN462 Production-Grade Audit](RUN462-PRODUCTION-GRADE-AUDIT-2026-11-27.md) — client request bounds, chunk-load recovery and touch-target fixes.
- [RUN461 Reward Claim Response Integrity](RUN461-REWARD-CLAIM-RESPONSE-INTEGRITY-2026-11-27.md) — strict claim RPC response validation and matured-hold owner/data validation.
- [RUN460 Referral Read/Attribution Hardening](RUN460-REFERRAL-READ-HARDENING-2026-11-27.md) — durable rate limits, no-store reads, fail-closed permanent attribution and RPC response validation.
- [RUN460 upgrade worklog](UPGRADE-WORKLOG-0.338.172.md) — coordinated changes and verification boundaries.
- [RUN451 Testnet economy activation](RUN451-TESTNET-ECONOMY-ACTIVATION-2026-11-26.md) — explicit Testnet Preview flags for rewards, registration bonus, referral, curation, commerce, withdrawals and payout rails.
- [RUN459 Marketplace order transparency](RUN459-MARKETPLACE-ORDER-TRANSPARENCY-2026-11-27.md) — buyer/seller delivery evidence, issue windows and dispute reason integrity.
- [RUN459 upgrade worklog](UPGRADE-WORKLOG-0.338.171.md) — implementation sequence and verification boundaries.
- [RUN448 Discovery toast and operational hash repair](RUN448-DISCOVERY-TOAST-AND-OPERATIONAL-HASH-REPAIR-2026-11-26.md) — resolves duplicate toast property and missing Node crypto import.
- [RUN448 upgrade worklog](UPGRADE-WORKLOG-0.338.160.md) — implementation and verification boundary.

# GreenHaven documentation index

## Current authority

- [RUN457 Creator Studio account integrity](RUN457-CREATOR-STUDIO-ACCOUNT-INTEGRITY-2026-11-27.md) — account-switch isolation, stale request fencing and truthful unavailable metrics.
- [RUN457 upgrade worklog](UPGRADE-WORKLOG-0.338.169.md) — source changes and verification boundaries.

- [RUN454 Seller Centre visibility and navigation unblock](RUN454-SELLER-CENTRE-UNBLOCK-2026-11-27.md) — exposes the existing owner-scoped Seller Centre through the Ecosystem directory and canonical Marketplace navigation.
- [RUN454 product readiness scorecard](RUN454-PRODUCT-READINESS-SCORECARD-2026-11-27.md) — source-level ratings, justified unblocks and remaining release blockers.
- [RUN455 Events service unblock](RUN455-EVENTS-SERVICE-UNBLOCK-2026-11-27.md) — implementation, release gates and verification boundary.
- [RUN456 read-only Impact History release](RUN456-IMPACT-HISTORY-RELEASE-2026-11-27.md) — separate active, authenticated read-only charity history while donation workflows remain gated.
- [RUN454 upgrade worklog](UPGRADE-WORKLOG-0.338.166.md) — implementation sequence, static verification and remaining release boundaries.
- [Current source of truth — 27 November 2026](CURRENT-SOURCE-OF-TRUTH-2026-11-27.md) — latest user-uploaded baseline and RUN454 working candidate.

- [RUN451 Testnet economy activation](RUN451-TESTNET-ECONOMY-ACTIVATION-2026-11-26.md) — explicitly enables Testnet Preview reward, referral, curation, commerce and payout feature flags while preserving secret separation.
- [RUN451 upgrade worklog](UPGRADE-WORKLOG-0.338.163.md) — implementation sequence and verification boundaries.

- [RUN450 wallet, withdrawal, membership, referral and missions repair](RUN450-WALLET-WITHDRAWAL-MEMBERSHIP-REFERRAL-MISSIONS-2026-11-26.md) — staged PI withdrawal, safe Testnet executor preflight, membership authority read repair, referral identity/landing repair and direct mission CTAs.
- [RUN450 upgrade worklog](UPGRADE-WORKLOG-0.338.162.md) — historical implementation and acceptance boundaries.

- [RUN449 root environment template restoration](RUN449-ENV-TEMPLATE-RESTORATION-2026-11-26.md) — restores the credential-free root `.env.example` required by Vercel prebuild and CI.
- [RUN449 upgrade worklog](UPGRADE-WORKLOG-0.338.161.md) — source changes, checks and unresolved dependency audit boundary.

- [RUN447 Community role type repair](RUN447-COMMUNITY-ROLE-TYPE-REPAIR-2026-11-26.md) — canonical membership-role normalization for the community directory card contract.
- [RUN447 upgrade worklog](UPGRADE-WORKLOG-0.338.159.md) — implementation and verification boundary.

- [RUN444 Testnet payment and withdrawal rails](RUN444-TESTNET-PAYMENT-WITHDRAWAL-RAILS-2026-11-26.md) — Testnet activation profile, Paystack test-key isolation, GHC withdrawal network fences and outstanding provider acceptance.
- [RUN444 upgrade worklog](UPGRADE-WORKLOG-0.338.156.md) — implementation and verification boundaries.

- [RUN443 Testnet migration application closeout](RUN443-TESTNET-MIGRATION-APPLICATION-REPORT-2026-11-26.md) — four previously held migrations applied, corrected RUN429 lock ordering, RPC ACL/catalog postflight and remaining transaction/history gates.
- [RUN443 upgrade worklog](UPGRADE-WORKLOG-0.338.155.md) — controlled Testnet migration closeout and release boundary.
- [RUN442 Testnet migration application report](RUN442-TESTNET-MIGRATION-APPLICATION-REPORT-2026-11-26.md) — historical first three migration applications.

- [RUN441 Phase 4 transaction rehearsal plan](RUN441-PHASE4-COMMUNITY-MESSENGER-TRANSACTION-REHEARSAL.md) — held PostgreSQL 17 concurrency matrix and explicit unexecuted status.
- [Current source of truth](CURRENT-SOURCE-OF-TRUTH-2026-11-26.md) — active archive, connected GitHub/Vercel/Supabase state, migration boundaries and release status.
- [RUN426 Phase 0 social experience foundation](RUN426-PHASE0-SOCIAL-EXPERIENCE-FOUNDATION-2026-11-26.md) — external research, Community/Messages/Discovery architecture, accessibility, performance and Phase 1 acceptance criteria.
- [RUN427 Phase 1A Community directory](RUN427-PHASE1A-COMMUNITY-DIRECTORY-2026-11-26.md) — role-derived Managed directory and authorization boundary.
- [RUN428 Phase 1 Social & Connections](RUN428-PHASE1-SOCIAL-CONNECTIONS-IMPLEMENTATION-2026-11-26.md) — Resources workspace increment and cross-domain Community/Messages/Discovery/Connections checks.
- [RUN429 Phase 1 durable Community invitations](RUN429-PHASE1-DURABLE-COMMUNITY-INVITATIONS-2026-11-26.md) — canonical invitation persistence, authenticated lifecycle APIs, notification integration and migration hold.
- [RUN429 upgrade worklog](UPGRADE-WORKLOG-0.338.142.md) — implementation sequence, verification evidence and remaining acceptance gates.
- [Product UX and copy standard](PRODUCT-UX-COPY-STANDARD.md) — concise, production-ready customer-facing experience.
- [Source authority](SOURCE_OF_TRUTH.md) — architecture, release and security boundaries.
- [Project truth](PROJECT_TRUTH.md) — verified package and project state.
- [Project source-of-truth history](PROJECT-SOURCE-OF-TRUTH.md) — retained earlier context; the current override above takes precedence.

## Operations

- [Environment variables](ENVIRONMENT-VARIABLES.md)
- [Operator environment and status](OPERATOR_ENV_AND_STATUS.md)
- [Supabase Storage operations](SUPABASE-STORAGE-OPERATIONS.md)
- [Migration checklist](MIGRATION_CHECKLIST.md)
- [Migration readiness states](architecture/MIGRATION_READINESS_STATES.md)
- [Policy review checklist](POLICY_REVIEW_CHECKLIST.md)
- [Current build context](CURRENT_BUILD_CONTEXT.md)

## Historical material

Older RUN, PHASE, PASS and worklog records are historical evidence, not current implementation instructions. Use them only when a current source file or the current source-of-truth document explicitly requires them. Do not restore historical application snapshots or bulk-merge old project trees.

- [RUN430 Phase 2 Social Engagement](RUN430-PHASE2-SOCIAL-ENGAGEMENT-2026-11-26.md) — saved-collection persistence failure handling and cross-feature social interaction contract.
- [RUN430 upgrade worklog](archive/upgrade-worklogs/UPGRADE-WORKLOG-0.338.143.md) — implementation, checks and release boundaries.
- [RUN431 Phase 2 Discovery preferences](RUN431-PHASE2-DISCOVERY-PREFERENCES-2026-11-26.md) — server-authoritative connection-intent persistence and Discover context integration.
- [RUN431 upgrade worklog](archive/upgrade-worklogs/UPGRADE-WORKLOG-0.338.144.md) — implementation, checks and release boundaries.

- [RUN432 Phase 2 Community creation draft recovery](RUN432-PHASE2-COMMUNITY-CREATE-DRAFT-2026-11-26.md) — account-scoped resumable creation wizard, safe draft storage and stable create identity.
- [RUN432 upgrade worklog](archive/upgrade-worklogs/UPGRADE-WORKLOG-0.338.145.md) — implementation, checks and release boundaries.

- [RUN433 Phase 2 Integrated Social Transformation](RUN433-PHASE2-INTEGRATED-SOCIAL-TRANSFORMATION-2026-11-26.md) — five-stage source audit, canonical-domain mapping, call capability gate and release acceptance boundary.
- [RUN433 upgrade worklog](archive/upgrade-worklogs/UPGRADE-WORKLOG-0.338.146.md) — implementation, checks and release boundaries.
- [RUN434 Phase 3 authority audit](RUN434-PHASE3-AUTHORITY-AUDIT-2026-11-26.md) — 284-route inventory, canonical writer boundaries, identity/session model, Testnet read-only catalog evidence and transactional outbox decision.
- [RUN434 route/writer inventory](RUN434-PHASE3-ROUTE-WRITER-INVENTORY-2026-11-26.csv) — deterministic route-level RPC/table and security-signal inventory.
- [RUN434 upgrade worklog](UPGRADE-WORKLOG-0.338.147.md) — implementation, checks and release boundaries.
- [RUN435 identity input classification](RUN435-PHASE3-IDENTITY-INPUT-CLASSIFICATION-2026-11-26.md) — manual review of caller-supplied actor/owner aliases and target identifiers.
- [RUN435 upgrade worklog](archive/upgrade-worklogs/UPGRADE-WORKLOG-0.338.148.md) — implementation, verification and outstanding acceptance gates.

- [RUN437 Phase 3 read-only Testnet reconciliation pack](RUN437-PHASE3-READONLY-RECONCILIATION-PACK-2026-11-26.md) — reproducible catalog checks; SELECT-only and non-mutating.
- [RUN437 upgrade worklog](UPGRADE-WORKLOG-0.338.150.md) — reconciliation diagnostics and remaining operational gates.
- [RUN439 Phase 4 worklog](UPGRADE-WORKLOG-0.338.151.md) — identity principal-boundary regression and Phase 4 kickoff.
- [RUN440 Phase 4 worklog](UPGRADE-WORKLOG-0.338.152.md) — durable compare-and-swap session rotation and concurrent replay/revocation race hardening.

- [RUN445 Earnings Dashboard Build Repair](RUN445-EARNINGS-DASHBOARD-BUILD-REPAIR-2026-11-26.md)

- [RUN446 Marketplace Spend Signature Repair](RUN446-MARKETPLACE-SPEND-SIGNATURE-REPAIR-2026-11-26.md)

- [RUN452 upgrade worklog](UPGRADE-WORKLOG-0.338.164.md) — Create Others menu, owner-scoped shortcuts and scroll refinement.

- [RUN453 upgrade worklog](UPGRADE-WORKLOG-0.338.165.md) — shared app-shell viewport fallback and navigation touch-target reliability.

- RUN505 conversation inbox outage integrity: `RUN505-CONVERSATION-INBOX-OUTAGE-INTEGRITY-2026-11-28.md` and `UPGRADE-WORKLOG-0.338.176.md`.
