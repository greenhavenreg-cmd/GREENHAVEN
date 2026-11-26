# RUN433 — Phase 2 Integrated Social Transformation

**Date:** 26 November 2026  
**Candidate:** `gh-connect@0.338.146`  
**Parent candidate:** `0.338.145` / RUN432  
**Accepted source archive:** `GREENHAVEN-0.338.139-RUN426-PHASE0-SOCIAL-EXPERIENCE-FOUNDATION-2026-11-26.zip`

## Five-stage execution record

### Stage 1 — Source audit and architecture reconciliation

Traced the mounted Community directory and workspace (`communities-screen.tsx`, `premium-community-hub.tsx`), creation wizard (`create-group-modal.tsx`), Messages inbox/thread (`message-screen.tsx`), Discovery screen (`discovery-grid-screen.tsx`), request inbox, server routes, profile store, social RPC boundaries, call policy and Testnet schema catalog. The architecture already has canonical Community, Conversation/Message, Connection/Discovery, Notification and Call domains. No second community registry, message store, connection graph or notification router was introduced. The audit found two material gaps and corrected them: Discover connection-intent changes were not using the existing server profile update action (RUN431), and Community creation drafts were lost when the modal unmounted/reloaded (RUN432).

### Stage 2 — Community transformation

- Directory: My, Managed, Invitations and Discover; role-derived management presentation; privacy-aware discoverability; durable invitation inbox.
- Workspace: distinct Board, Events, Resources, Chat, Members and About areas; canonical Board pagination and explicit unavailable states.
- Member and governance journeys: server-authorized membership/role changes, join requests, reports, moderator audit history and distinct Chat membership grant.
- Creation: four-step wizard now restores account-scoped drafts and stable create idempotency identity; transient image previews and client-trusted payment confirmation are excluded. Fee rail defaults and restored fee currency are normalized consistently for Pi-only commerce clients.

### Stage 3 — Messaging transformation

- Inbox filters: All, DMs, Unread, Requests, Communities and Archived.
- Conversation details, shared-media view, indexed full-history search, durable media uploads, capability-checked voice notes and group creation/invitation flows.
- Authenticated conversation membership is rechecked in the server search RPC. Durable message sends retain client-message idempotency and retry/reconnect safeguards.
- Voice/video call UI and transport orchestration exist, but live calls remain deliberately disabled: `CALLS_PRODUCTION_ENABLED` is false and the server requires explicit `GH_CALLS_ENABLED`, TURN URLs and a shared TURN secret before issuing short-lived credentials. No media call is claimed as available until those capabilities are operator-configured and verified.

### Stage 4 — Discovery transformation

- People are sourced from the authenticated `gh_discovery_candidates` RPC, which applies block, pending-connection, profile-visibility and discovery-preference filtering before profile projection.
- Client ranking uses explainable interest, intent, community and location signals; it does not expose a fabricated percentage score. Categories, search, filters, profile actions, block/report, connection requests and request acceptance are wired to canonical actions.
- RUN431 exposes the existing server profile update and toast actions in `GHCDiscoveryContext`; connection-intent changes now use the authenticated profile store rather than browser storage as the authority.

### Stage 5 — Integration and release verification

- Cross-domain notification targets remain typed and sanitized. Community invitation acceptance updates canonical community membership but never silently grants Chat membership.
- The full `npm run verify:static` suite is source-only evidence; it does not replace real two-account, multi-device, live notification, browser layout, accessibility or performance acceptance.
- Supabase Testnet was inspected read-only. Community, messaging, event, call and connection-related tables are present with RLS enabled. RUN429 invitation migration remains unapplied and held for disposable-PostgreSQL validation and exact migration-history reconciliation.
- A Supabase validation branch was attempted after user approval, but the platform rejected branch creation because Supabase branching requires Pro or higher. No branch or database mutation was created.
- Local Node is 22.16.0; project requires Node 24.15.0. Dependencies are absent. Full typecheck, lint and production build remain blocked.

## Integrated regression contract

Added `scripts/check-run433-phase2-integrated-social-transformation.mjs` with **22 checks** spanning Community, Messaging, Discovery, request search authorization, call fail-closed policy, TURN credential handling and typed notifications. It is registered in both `verify:static` and `prebuild:checks`.

## Release status

Phase 2 source implementation and source-level regression coverage are delivered as candidate `0.338.146`. **This is not operational or production acceptance.** The last user-designated accepted source archive remains `0.338.139`; no GitHub push, Vercel deployment, Mainnet activation or live database change occurred.
