# Phases 1–6 integration (0.338.137 baseline)

Integrated: 2026-11-26  
Baseline: GREENHAVEN-0.338.137-RUN423-RUN411-MARKETPLACE-COMMERCE-RELEASE-CHECK-REPAIR

## Patched surfaces
| File | Phases |
|------|--------|
| components/ghc/premium-membership-screen.tsx | 1,4,5 |
| components/ghc/unified-earnings-dashboard.tsx | 2,4,5 |
| components/ghc/rewards-centre-screen.tsx | 3,5,6 |
| components/ghc/pi-cashback-summary.tsx | 6 |
| components/ghc/skeleton-loaders.tsx | 5 |
| features/wallet/wallet-screen.tsx | 2,3,5 |
| features/wallet/withdraw-ghc-panel.tsx | 5 |
| contexts/domains/wallet-read-provider.tsx | 2 (reference) |

## Behaviour summary
1. Membership: last-confirmed / local fallback; no hard wipe on transient API failure
2. Wallet/Pi history: soft-degrade; keep last rows
3. Rewards GHC balances: same authority as Wallet (`useWalletRead`)
4. Ledger: humanized entry types (e.g. Reserve released)
5. Skeletons + settlement gate messaging
6. Rewards copy de-tutorialized; mission/cashback labels tightened

## Cleanup
Historical RUN/PHASE report markdown removed from bundle root.
