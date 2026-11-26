import fs from "node:fs"

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8")
const context = read("../contexts/ghc-context.tsx")
const screen = read("../components/ghc/discovery-grid-screen.tsx")
const intents = read("../lib/connection-intents.ts")
const profileRoute = read("../app/api/profile/me/route.ts")
const profileStore = read("../lib/server/identity/profile-store.ts")

const checks = [
  ["Discovery context exposes the canonical profile update action", /GHCDiscoveryContext = createContext<[\s\S]{0,900}updateProfile: GHCContextType\[\"updateProfile\"\]/.test(context)],
  ["Discovery context exposes the shared toast action", /GHCDiscoveryContext = createContext<[\s\S]{0,1000}addToast: \(message: string/.test(context)],
  ["Discovery provider supplies profile persistence and toast actions", /const discoveryValue = useMemo\([\s\S]{0,650}updateProfile,[\s\S]{0,100}addToast,[\s\S]{0,100}profile: state\.profile/.test(context)],
  ["Intent changes use the canonical account profile update", /ghc\.updateProfile\(\{ connectionIntents: normalized \}\)/.test(screen)],
  ["Discovery only announces success after profile update confirmation", /if \(!saved\)[\s\S]{0,260}not yet confirmed by the server[\s\S]{0,180}saveConnectionIntentsWithStatus[\s\S]{0,160}Discovery preferences updated/.test(screen)],
  ["Local intent mirror reports actual storage persistence", /function saveConnectionIntentsWithStatus[\s\S]{0,650}localStorage\.setItem[\s\S]{0,100}return true[\s\S]{0,100}catch[\s\S]{0,80}return false/.test(intents)],
  ["Legacy local intent helper remains backward compatible", /function saveConnectionIntents\(userId: string, intents: ConnectionIntentId\[\]\): void[\s\S]{0,160}saveConnectionIntentsWithStatus/.test(intents)],
  ["Profile PATCH derives the owner from the authenticated session", /resolveAuthenticatedUser/.test(profileRoute) && /upsertServerProfile\(auth\.userId, input\)/.test(profileRoute)],
  ["Server profile store persists connection intents as a first-class field", /connectionIntents: Array\.isArray\(input\.connectionIntents\)[\s\S]{0,250}connectionIntents[\s\S]{0,120}existing\?\.connectionIntents/.test(profileStore)],
]

let failed = 0
for (const [name, pass] of checks) {
  console.log(`${pass ? "PASS" : "FAIL"} ${name}`)
  if (!pass) failed += 1
}
console.log(`RUN431 Phase 2 discovery preferences contract: ${checks.length - failed}/${checks.length} passed`)
if (failed) process.exitCode = 1
