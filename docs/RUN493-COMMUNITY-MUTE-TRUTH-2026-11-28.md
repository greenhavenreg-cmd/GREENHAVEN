# RUN493 — Community mute truth and membership badge guard

**Baseline:** RUN492. Source candidate only — NOT APPROVED for production. No migration, economics, ledger, authentication or API change.

## Findings and fixes
1. **"Mute chat" in the community hub was partly fake.** The button flipped a local `chatMuted` flag and then fired the real mute without awaiting it, so the label could say "Chat muted" while the server mute failed (or was never wired), and a second tap could un-sync the two states. The button now reads the server-backed `community.isMuted`, shows "Saving…" while the request runs, is disabled when no handler exists, and exposes `aria-pressed`.
2. **Unhandled rejection / silent failure.** The Communities screen mute handler now catches a failed mute or unmute and shows an error toast; the hub refreshes either way.
3. **Membership badge wiped on a server error.** The profile's post-activation re-check read a 503/error body as "free" and cleared a VIP/VVIP badge. Non-OK responses are now ignored.

## Verification
`scripts/check-run493-community-mute-truth.mjs` (6 checks) and the full `verify:static` suite. Not run: typecheck, lint, build, browser/device testing (dependencies are not installed in this environment).
