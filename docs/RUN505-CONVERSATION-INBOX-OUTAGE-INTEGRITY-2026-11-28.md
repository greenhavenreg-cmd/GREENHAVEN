# RUN505 — Conversation inbox outage integrity (2026-11-28)

**Release:** GreenHaven 0.338.176  
**Parent:** 0.338.175 / RUN504  
**Status:** source candidate only; production NOT APPROVED.

## Change

The authenticated conversation inbox previously converted several durable-store failures into an empty conversation list or silently omitted membership, preference, and unread-count fields. That could make a temporary database outage look like a genuinely empty inbox or a successful but incomplete response.

The inbox now fails the request when any required durable read fails: the caller's active membership list, conversation rows, caller preferences, active membership rows, unread-count RPC, or production store configuration. The existing route returns a non-cacheable server error through its error boundary. A genuinely empty membership result remains a valid empty inbox.

No schema, migration, ledger, GHC balance, Pi payment, withdrawal, reward, membership entitlement, referral, curation settlement, or vote-to-mint behavior changed.

## Verification

- RUN505 focused source contract: 7 assertions.
- Existing RUN504 and full static suites must be re-run for this candidate.
- This change is not a live database outage simulation and does not certify browser/device behavior.

## Operator gates

Supported Node.js 24.15.0+, clean dependency installation, TypeScript, ESLint, Next.js production build, Testnet multi-account inbox tests, and live Supabase outage/recovery acceptance remain required. Production remains NOT APPROVED.
