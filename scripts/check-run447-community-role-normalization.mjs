import fs from 'node:fs'

const labels = fs.readFileSync('lib/community/role-labels.ts', 'utf8')
const screen = fs.readFileSync('components/ghc/communities-screen.tsx', 'utf8')
const card = fs.readFileSync('components/ghc/group-card.tsx', 'utf8')
const discovery = fs.readFileSync('components/ghc/discovery-grid-screen.tsx', 'utf8')

const validRoleType = /export type CommunityRoleLabel\s*=\s*"owner"\s*\|\s*"admin"\s*\|\s*"moderator"\s*\|\s*"member"\s*\|\s*"guest"/.test(labels)
const normalizer = /export function normalizeCommunityRole\([\s\S]*?\): CommunityRoleLabel\s*\{[\s\S]*?case "mod":\s*return "moderator"[\s\S]*?default:\s*return fallback/.test(labels)
const directoryUsesNormalizer = /normalizeCommunityRole\(roleEntry\?\.\[1\],\s*joined\s*\?\s*"member"\s*:\s*"guest"\)/.test(screen)
const ownerPrecedence = /community\.createdBy\s*&&\s*isSameIdentity\(community\.createdBy\)\s*\?\s*"owner"\s*:\s*normalizeCommunityRole/.test(screen)
const cardRoleContract = /role\?:\s*"owner"\s*\|\s*"admin"\s*\|\s*"moderator"\s*\|\s*"member"\s*\|\s*"guest"/.test(card)
const discoveryUsesStableCallbackDependencies = /const updateProfile = ghc\.updateProfile\s+const addToast = ghc\.addToast[\s\S]*?\[updateProfile, addToast, meId, selectedIntents\]/.test(discovery) && !/ghc\.updateProfile|ghc\.addToast/.test(discovery.match(/const onIntentsChange = useCallback\([\s\S]*?\n  \)/)?.[0] || '')

if (![validRoleType, normalizer, directoryUsesNormalizer, ownerPrecedence, cardRoleContract, discoveryUsesStableCallbackDependencies].every(Boolean)) {
  console.error('FAIL: community directory role normalization contract is incomplete')
  process.exit(1)
}
console.log('PASS: community role contract is normalized; creator ownership, safe fallbacks and discovery callback dependencies are preserved')
