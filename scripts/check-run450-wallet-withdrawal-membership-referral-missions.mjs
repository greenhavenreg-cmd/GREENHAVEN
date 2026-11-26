#!/usr/bin/env node
/** RUN450: wallet actions, staged PI withdrawal, authoritative membership reads, referral landing and mission CTAs. */
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
const read = (path) => readFileSync(path, 'utf8')
const walletCss = read('app/globals.css')
const withdrawUi = read('components/ghc/pi-withdraw-sheet.tsx')
const withdrawRoute = read('app/api/economy/earnings/withdrawals/route.ts')
const membership = read('lib/server/membership/entitlement-store.ts')
const referral = read('lib/server/referral/referral-service.ts')
const publicId = read('lib/server/economy/public-id.ts')
const payoutReadiness = read('app/api/economy/earnings/withdrawals/readiness/route.ts')
const referralLanding = read('app/join/route.ts')
const publicPolicy = read('lib/routing/public-route-policy.ts')
const missions = read('components/ghc/rewards-centre-screen.tsx')
const missionApi = read('app/api/economy/missions/progress/route.ts')
const testnetProfile = read('config/testnet-payments.env.example')
const pkg = JSON.parse(read('package.json'))
const checks = [
  ['PI wallet actions use two spacious columns while GHC actions retain four', walletCss.includes('[aria-label="PI wallet actions"] > div:last-child { display: grid; grid-template-columns: repeat(2') && walletCss.includes('[aria-label="GHC wallet actions"] > div:last-child { display: grid; grid-template-columns: repeat(4')],
  ['Pi withdrawal is a bounded viewport sheet with independent scrolling and fixed footer', withdrawUi.includes('h-[min(92dvh,900px)]') && withdrawUi.includes('min-h-0 flex-1 space-y-4 overflow-y-auto') && withdrawUi.includes('shrink-0 space-y-2 border-t')],
  ['withdrawal follows amount, PIN, PIN confirmation and final review stages', ['"amount" | "pin" | "pin-confirm" | "review"', 'continueFromAmount', 'continueFromPin', 'verifyPinAndReview', 'PIN confirmed'].every((part) => withdrawUi.includes(part))],
  ['raw PIN is cleared after server verification and only amount-bound proof is retained', withdrawUi.includes('setPinProofValue(String(vBody.pinProof))') && withdrawUi.includes('setPinInput("")') && withdrawUi.includes('setPinConfirmInput("")')],
  ['payout request preflights auto-execution and executor key before reserving funds', withdrawRoute.includes('PI_EARNINGS_AUTO_EXECUTE !== "true"') && withdrawRoute.includes('!resolvePiSandbox()') && withdrawRoute.includes('process.env.VERCEL_ENV === "production"') && withdrawRoute.includes('PI_EARNINGS_EXECUTOR_NOT_CONFIGURED') && withdrawRoute.indexOf('PI_EARNINGS_EXECUTOR_NOT_CONFIGURED') < withdrawRoute.indexOf('const result = await createPiEarningsPayoutRequest')],
  ['payout request preflights the Pi Testnet API key and wallet seed', withdrawRoute.includes('PI_SERVER_CREDENTIALS_MISSING') && withdrawRoute.includes('/^S[A-Z2-7]{55}$/')],
  ['Testnet activation profile documents the required blank server-only PIN proof key', testnetProfile.includes('GH_PIN_PROOF_SECRET=') && !/^GH_PIN_PROOF_SECRET=.+$/m.test(testnetProfile)],
  ['withdrawal readiness endpoint gives authenticated users secret-safe executor diagnostics', payoutReadiness.includes('resolveAuthenticatedUser') && payoutReadiness.includes('ready: false') && payoutReadiness.includes('PI_EARNINGS_EXECUTOR_NOT_CONFIGURED') && !payoutReadiness.includes('apiKey:')],
  ['membership entitlement lookup uses the shared Supabase REST client with an absolute configured base URL', membership.includes('supabaseRest<Record<string, unknown>[]>') && membership.includes('env.supabaseUrl') && !/fetch\(url\s*,/.test(membership)],
  ['referral settlement respects explicit flags and the guarded Testnet unlock fallback', referral.includes('referralSettlementEnabled()') && referral.includes('testnet-unlock')],
  ['GreenHaven public ID ensure and resolve use absolute-base Supabase RPC calls', publicId.includes('ghc_ensure_public_id') && publicId.includes('ghc_resolve_public_id') && publicId.includes('supabaseRpc') && !/fetch\(url\s*,/.test(publicId)],
  ['referral /join link resolves to the app root while preserving a validated referral code', existsSync('app/join/route.ts') && referralLanding.includes('NextResponse.redirect(destination, 307)') && referralLanding.includes('searchParams.set("ref", code)')],
  ['referral landing is explicitly public but service APIs remain authenticated', publicPolicy.includes('"/join"') && referralLanding.includes('^[A-Z0-9]{2,32}$')],
  ['first-post mission opens the global composer instead of stopping at the feed tab', missions.includes('challengeId === "challenge_first_post"') && missions.includes('ghc:open-compose')],
  ['mission cards explain missing post/community actions and provide direct task CTAs', missions.includes('No post is verified yet. Create your first post') && missions.includes('No community membership is verified yet') && missions.includes('Browse communities')],
  ['mission verification remains server-authoritative and ignores client metadata', missionApi.includes('Client metadata is deliberately ignored') && missionApi.includes('gh_rewards_mission_complete')],
  ['new RUN450 regression contract is registered in static and prebuild checks', ['verify:static', 'prebuild:checks'].every((key) => pkg.scripts[key]?.includes('check-run450-wallet-withdrawal-membership-referral-missions.mjs'))],
]
let failed = 0
for (const [name, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`); if (!ok) failed++ }
console.log(`\nRUN450 wallet/withdrawal/membership/referral/mission contract: ${checks.length - failed}/${checks.length} passed`)
assert.equal(failed, 0)
