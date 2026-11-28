# RUN498 — Navigation attention truth and interest-chip accessibility (2026-11-28)

**Baseline:** RUN497 (`gh-connect@0.338.173`). Production NOT APPROVED.

## Defects found by audit
1. **Bottom-navigation badges disagreed with the inbox.** The Messages dot summed `unreadCount` over *every* conversation, including archived and muted ones, while the inbox itself hides archived threads. The Communities dot ignored archive/mute too. A muted or archived thread could therefore keep a red dot lit that the user could not clear from the inbox.
2. **Interest chips announced no action.** The profile interest chips remove an interest on tap but exposed only the interest name to assistive technology, with a 14px icon and no explicit touch height.

## Changes
- `contexts/domains/messaging-provider.tsx` (the read seam) used the same raw sum; it now calls the helper so a future consumer cannot reintroduce the mismatch.
- New `lib/messaging/unread-attention.ts`: single source for navigation attention. Archived and muted conversations contribute 0; a timed mute (`muteUntil`) stops applying once it expires; counts are bounded to non-negative integers; flag-only `unread` still counts as 1.
- `components/ghc/app.tsx` uses the helper for both badges. Inbox contents, message storage, read receipts and server counts are unchanged.
- `components/ghc/profile-components.tsx`: both interest chip buttons gained `aria-label="Remove interest …"`, hidden decorative icons, a 36px minimum height and a visible focus outline.

## Not changed
No financial, ledger, reward, membership, migration or API behaviour. No new dependency.

## Verification
- `scripts/test-run498-unread-attention.mjs`: 11/11.
- `scripts/check-run498-nav-attention-and-interest-chips.mjs`: 9/9.
- Full `verify:static` suite re-run.
- Typecheck, lint, build, browser and Testnet acceptance were **not** run (dependencies unavailable offline in this environment). These remain outstanding.
