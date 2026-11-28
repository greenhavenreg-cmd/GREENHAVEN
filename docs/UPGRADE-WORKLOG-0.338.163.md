# Upgrade worklog — 0.338.163 / RUN451

1. Re-opened and audited the exact RUN450 archive rather than relying on earlier notes.
2. Traced the Testnet unlock resolver and identified the server-side activity reward, referral, curation and Pi-to-GHC feature flags.
3. Enabled GHC activity rewards in the dedicated Testnet Preview profile.
4. Enabled the Testnet registration bonus flag, subject to the existing campaign migration and authoritative ledger RPC.
5. Enabled referral settlement and aligned the public referral status flag.
6. Enabled curation redistribution and aligned the public curation status flag.
7. Enabled Pi-to-GHC pack purchases and aligned the public purchase flag.
8. Preserved enabled tips, GHC withdrawals, marketplace seller payouts, Pi A2U, Pi earnings payout requests/execution and Paystack Test transfers.
9. Preserved Testnet-only boundaries, blank external secrets, and fail-closed generic `.env.example` defaults.
10. Added and registered the RUN451 activation regression check, updated source-of-truth metadata, and packaged the release archive.

## Verification and limits

The static verification is source-only verification scope; it does not prove deployed Vercel environment values, database migration state, provider authentication, or end-to-end settlement. The project requires Node.js 24.15.0. A local full Next.js build and dependency-backed typecheck are not certified by this worklog. No database migrations were applied, no payment provider was called, and no GitHub or Vercel deployment was performed.
