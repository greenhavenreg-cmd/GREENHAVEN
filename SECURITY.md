# Security policy

## Reporting a vulnerability

Please do not publish exploit details, credentials, private user data, or reproducible attack instructions in a public issue or pull request.

If GitHub private vulnerability reporting is enabled for this repository, use **Security → Advisories → Report a vulnerability**. If it is not enabled, contact the repository owner or maintainers through a private channel and provide only the minimum information needed to reproduce and assess the issue.

Do not include live Pi access tokens, Supabase service-role keys, Vercel environment values, payment provider secrets, user identity records, or financial ledger data in a report. Redact logs and request identifiers where possible.

## Supported release boundary

- The `testnet` branch and Vercel Preview are the active validation environment.
- `main` and Production are not approved for changes or promotion unless a separate release approval is recorded.
- Security fixes must preserve server-side Pi Platform verification, canonical GreenHaven identity/session checks, RLS, server-only service-role access, and server-authoritative financial ledgers.
