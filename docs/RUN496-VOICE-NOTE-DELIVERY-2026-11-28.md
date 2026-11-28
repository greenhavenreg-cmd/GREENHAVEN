# RUN496 — Voice notes in Messages are actually sent

**Baseline:** RUN495. Source candidate only — NOT APPROVED for production. No migration, economics, ledger, authentication or API change.

## Finding and fix
The Messages voice-note button recorded audio and uploaded it to durable storage, then showed a success toast ("Voice note recorded. Delivery follows the same durable attachment path…") and stopped. No message was ever created, so the recipient never received anything while the sender was told it worked (the toast also used the ignored `tone` field, so it rendered as info). The upload is now delivered through the same durable attachment path as other files (`sendMediaMessage`, sent as a file attachment named `voice-<time>.webm`). The message bubble reports sending/sent/failed; the fake success toast is gone, and a missing sender or upload URL shows an error.

## Not done
Voice notes arrive as an audio file attachment, not an inline waveform player: the durable messaging API is still text/attachment-first (`sendVoiceNote` in the context remains device-local and unused by this flow). An inline player needs a server-side `voice` attachment type, which is a larger change.

## Verification
`scripts/check-run496-voice-note-delivery.mjs` (4 checks), native-TypeScript syntax pass on the edited file, and the full `verify:static` suite. Not run: typecheck against dependencies, lint, build, browser/device recording and delivery testing.
