# RUN426 — Phase 0: Social Experience Research, Architecture and Quality Foundation

**Date:** 26 November 2026  
**Candidate:** `gh-connect@0.338.139`  
**Parent:** `gh-connect@0.338.138` (RUN424/RUN425)  
**Scope:** Community, Messages, Discovery and their shared notification/navigation contracts  
**Network:** Pi Testnet only; this phase does not change Pi or financial systems.

## 1. Phase 0 objective

Establish an evidence-backed design and engineering foundation before Phase 1 feature implementation. Phase 0 is deliberately additive and low-risk: it records the existing architecture, research-derived product principles, integration contracts, measurable quality targets and regression requirements. It does not replace existing screens, introduce mock data, create a parallel social graph, or modify database schema.

## 2. External research and applied decisions

### W3C — WCAG 2.2 mobile guidance

Source: https://www.w3.org/TR/wcag2mobile-22/

Applied decisions:
- Design for visible keyboard focus, predictable focus order and meaningful control labels.
- Meet text and non-text contrast requirements; do not use colour as the only state indicator.
- Support reflow on narrow screens and zoom without losing essential functionality.
- Keep controls operable without drag-only or gesture-only interactions.
- Provide status announcements for loading, success and failure states.
- Avoid asking users to enter the same information repeatedly across community creation and profile/connection journeys.

### Android Developers — messaging progression

Source: https://developer.android.com/social-and-messaging/guides/communication/basic-better-best

Applied decisions:
- Treat offline queueing, retry, explicit sending/failed states and durable message history as baseline reliability, not optional polish.
- Notification actions must deep-link to the exact conversation or request.
- Read receipts should respect user preferences.
- Permission prompts should appear in context, after the user understands the benefit.
- Attachments, voice and calls must be capability-gated and show clear unavailable/error states rather than dead controls.

### Android Developers — conversation notifications

Source: https://developer.android.com/social-and-messaging/guides/communication/notifications-conversations

Applied decisions:
- Keep notification targets stable and resolve them through authenticated server-side access checks.
- Provide meaningful conversation grouping and unread state without exposing private content to unauthorized viewers.
- Notification deep links must re-check membership and permissions when opened.

### Apple — notification design

Source: https://developer.apple.com/design/human-interface-guidelines/notifications

Applied decisions:
- Notifications are concise, relevant and deduplicated.
- Avoid repeated reminders for the same unresolved event.
- Do not expose sensitive message content or private profile details in notification previews by default.
- In-app updates should be subtle when the user is already viewing the relevant conversation or surface.

### Community onboarding research

Source: https://community.inc/frameworks-reports/state-of-community-onboarding

Applied decisions:
- A community preview should communicate purpose, intended audience, participation expectations and concrete member value.
- First-session onboarding should lead to a meaningful first action: introduce yourself, follow a topic, join a discussion, view an event or meet members.
- Avoid onboarding walls and repeated explanatory copy; show context at the moment it is useful.

### European Commission Joint Research Centre — community platform checklist

Source: https://publications.jrc.ec.europa.eu/repository/bitstream/JRC141251/JRC141251_01.pdf

Applied decisions:
- Treat discussions, events, member directory, resources, roles, moderation, notifications and feedback as connected community capabilities.
- Seed or highlight genuine content only; never fabricate activity, members or engagement counts.

### Google Android accessibility guidance

Source: https://developer.android.com/design/ui/mobile/guides/foundations/accessibility

Applied decisions:
- Use scalable typography, clear labels, sufficient contrast and screen-reader descriptions.
- Ensure primary touch targets are at least 48dp where practical.
- Do not make swipe gestures the only way to perform important actions.

## 3. Source-derived architecture inventory

The source already contains the following foundations. Their presence in source is not proof of live end-to-end operation; each journey remains subject to Phase 1 acceptance.

| Domain | Existing source foundations | Phase 1 direction |
|---|---|---|
| Community UI | `premium-community-hub.tsx`, `community-features-ui.tsx`, member welcome, governance, board and participation adapters | Consolidate information architecture and complete create/join/member/event/resource journeys |
| Community domain | `community-domain.ts`, `community-persistence.ts`, `community-registry.ts`, governance stores and membership adapters | Preserve canonical ownership and permissions; avoid parallel community records |
| Messaging UI | `message-screen.tsx`, `message-components.tsx`, group invite panel, voice-note and call bridges | Complete inbox, requests, conversation controls, offline recovery and capability-tested media/calls |
| Messaging server | `lib/server/messaging/message-store.ts`, `/api/messaging/conversations/[conversationId]/messages` | Preserve conversation membership authorization, durable storage and idempotency |
| Discovery UI | `discovery-grid-screen.tsx`, `discovery-sections.tsx`, connection cards and intent picker | Improve search, filters, profile actions and useful empty states without exposing private data |
| Discovery domain | `discovery-domain.ts`, `discovery-ranking.ts`, `candidate-filter.ts`, connection graph and intent adapters | Keep ranking explainable and based only on permitted, non-sensitive signals |
| Notifications | notification routes, push architecture, notification targets and RUN289 deep-link checks | Deduplicate, deep-link to exact authorized targets and synchronize unread state |
| Performance | `lib/performance-budgets.ts`, privacy-safe RUM and Phase 6 performance/accessibility gate | Measure by surface and device class; do not claim improvements without sufficient samples |

## 4. Shared experience architecture decisions

### Community
- Distinguish community Board from community Chat; they are separate capabilities with shared community context.
- Community overview, members, events, resources, governance and chat must resolve against the same canonical community identity.
- Membership status and role are server-authoritative. Client state is presentation only.
- Public, private, request-to-join and invite-only rules must be visible before a user attempts to join.
- Creation must be resumable and validate name, category, purpose, visibility and governance settings before submission.

### Messages
- Inbox categories are views over canonical conversations and message requests, not separate stores.
- Every message mutation is authorized against authenticated conversation membership.
- Client-generated message IDs remain idempotency keys; retries must not create duplicate messages.
- Offline queue and retry states must distinguish queued, sending, sent, delivered, read and failed where supported by server evidence.
- Calls, voice and media controls must only appear enabled when their underlying capability is available and configured.
- Blocking and message-request decisions must be enforced server-side.

### Discovery
- Discovery is a read-only recommendation/search surface until the user explicitly performs a connection action.
- Ranking must not use wallet balances, exact coordinates, reports, inferred sensitive traits or private message content.
- Blocked, muted, self, already-connected and otherwise ineligible accounts must be filtered before presentation.
- Do not show raw recommendation scores or compatibility percentages as facts.
- Presence and location are optional, consent-aware signals; absence of consent means no disclosure.
- Phase 1 must ensure that teen accounts are not shown dating-oriented discovery or matching; keep discovery focused on age-appropriate friendship, learning, community and professional interests.

### Shared navigation and notifications
- Every cross-section action has a stable typed target and a safe fallback if the target is missing or access has changed.
- Deep-link resolution must authenticate and re-authorize on open; possession of a notification URL is not authorization.
- Unread badges are derived from canonical unread state, not independent client counters.
- Duplicate notifications for the same event are suppressed; sensitive content is not placed in push previews by default.

## 5. Performance and accessibility budgets

The existing `lib/performance-budgets.ts` defines Core Web Vitals good thresholds and per-surface p75 evaluation. Phase 0 adopts those existing thresholds rather than inventing a second measurement system:

- LCP p75: <= 2.5 seconds.
- INP p75: <= 200 milliseconds.
- CLS p75: <= 0.1.
- A surface is not declared passing until at least 30 valid samples exist; insufficient samples remain `NOT MEASURED`, never PASS.

Additional Phase 1 targets:
- Search/filter interactions should not block the main thread with unbounded client-side work.
- Lists must use bounded pages/cursors and stable ordering; avoid fetching all members/messages at once.
- Images/media use existing lazy/durable media primitives and must not shift layout while loading.
- Cache keys must include authenticated account scope where data is private; logout/account switch clears or invalidates scoped client state.
- Offline and degraded-network states must preserve user intent without duplicate writes.
- Avoid adding analytics that collect raw URLs, message text, exact location or user identifiers to performance telemetry.

## 6. Phase 1 delivery sequence

1. Community information architecture and complete community create/join/overview/member journeys.
2. Messaging inbox and conversation lifecycle, requests, privacy, offline/retry and attachment states.
3. Discovery search, filter and recommendation UX, connection lifecycle and profile deep links.
4. Shared notifications, navigation, unread state and cross-surface integration.
5. Mobile, accessibility, performance and two-account security acceptance.

## 7. Release acceptance matrix

| Test | Required evidence | Release condition |
|---|---|---|
| Community ownership | Two accounts, role changes, join/leave/invite outcomes | No cross-account or role escalation |
| Community creation | Draft, validation, successful create, interrupted retry | No duplicate community records |
| Community board/chat | Distinct destinations, correct membership gating | No Board/Chat identity confusion |
| Message delivery | Two-account send, retry, offline/reconnect, idempotency | No duplicate or cross-account message |
| Message requests | Accept, decline, block and report | Backend enforcement confirmed |
| Discovery | Search, filters, blocked/muted exclusions, consent settings | No private-signal leakage |
| Notifications | Duplicate suppression, unread consistency, deep-link authorization | Exact authorized target or safe fallback |
| Accessibility | Keyboard, screen reader labels, contrast, target size, 320px reflow, reduced motion | No critical blockers |
| Performance | p75 LCP/INP/CLS with >=30 samples per surface | Thresholds met or explicitly tracked as blockers |
| Data integrity | Migration diff and API contract review | No blind migration replay; no duplicate social graph |

## 8. Explicit non-goals and safety boundaries

- No database migration or schema change in Phase 0.
- No live Testnet data mutation, message sending, community creation or user notification from this source-only pass.
- No Pi, GHC, wallet, payout or financial settlement changes.
- No Mainnet configuration or activation.
- No fabricated demo data or simulated success states.
- No replacement of the current identity, community, messaging or connection domains.
- No exposure of precise location, private profile attributes, message content or sensitive moderation data in discovery or telemetry.

## 9. Phase 0 status

**Implemented:** research record, source architecture inventory, cross-domain design decisions, performance/accessibility budgets, teen-safe discovery constraint, and static regression gate.

**Not yet implemented:** user-facing redesigns and feature changes. Those belong to Phase 1 after this foundation is accepted and the relevant source journeys are traced in detail.

**Release status:** source-only candidate; no GitHub push, Vercel deployment, Supabase migration, or live data mutation in this phase.
