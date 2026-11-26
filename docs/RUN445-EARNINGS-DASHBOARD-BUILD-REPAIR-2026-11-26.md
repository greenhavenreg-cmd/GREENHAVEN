# RUN445 — Earnings dashboard build repair (26 November 2026)

**Package:** `gh-connect@0.338.157`  
**Parent:** `0.338.156` / RUN444  
**Scope:** Correct the duplicate `snap` declaration reported by the Vercel Next.js production build.

## Repair

The dashboard used `snap` for both React state (`const [snap, setSnap] = useState(...)`) and a later render alias (`const snap = displaySnap`) in the same function scope. The state variable is now named `serverSnap`; state-dependent quote and loading logic uses that name. The render alias `snap` remains local to the render section and continues to point to the live snapshot or last-known snapshot. The fee-quote callback dependency was updated to `[serverSnap]`. No payment, fee, authorization, withdrawal or ledger behavior was intentionally changed.

A focused regression gate, `scripts/check-run445-earnings-dashboard-snap-scope.mjs`, verifies the state/render naming contract and is registered in static and prebuild checks. The existing Phase 8 earnings-dashboard contract was updated to assert the renamed server state and passes 13/13.

## Verification boundary

The supplied Vercel log proves all 465 prebuild checks passed on that deployment attempt, then Next.js compilation failed on the duplicate declaration. The source repair and focused regression gate are verified locally. `npm run verify:static` completes successfully, and the prebuild dry-run discovers 466 checks (one additional regression gate). This workspace currently has Node.js 22.16.0 while the project requires 24.15.0, so a fresh dependency-backed Next.js production build cannot be claimed here. Vercel must rebuild the corrected archive/commit under its supported runtime. No push, deployment, database mutation, provider transaction or Mainnet operation was performed.
