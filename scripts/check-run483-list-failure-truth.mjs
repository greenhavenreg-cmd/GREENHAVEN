import fs from "node:fs"
import assert from "node:assert/strict"
const rewards = fs.readFileSync("components/ghc/rewards-centre-screen.tsx", "utf8")
const comm = fs.readFileSync("components/ghc/communities-screen.tsx", "utf8")
const prof = fs.readFileSync("components/ghc/profile-screen.tsx", "utf8")
const checks = [
  ["rewards: explicit achievements failed flag", /const \[achievementsLoadFailed, setAchievementsLoadFailed\] = useState\(false\)/.test(rewards)],
  ["rewards: both !ok and rejected loads set the flag", (rewards.match(/setAchievementsLoadFailed\(true\)/g) || []).length === 2],
  ["rewards: each load attempt clears the flag", /setAchievementsHydrating\(true\)\s*\n\s*setAchievementsLoadFailed\(false\)/.test(rewards)],
  ["rewards: failure shows an alert with retry via the existing refresh tick", /Your achievements could not be loaded\./.test(rewards) && /setAchievementRefreshTick\(\(tick\) => tick \+ 1\)/.test(rewards)],
  ["rewards: 'No achievements unlocked' is suppressed after a failed load", /snapshot\.achievements\.length === 0 && !\(achievementsLoadFailed && !achievementsHydrating\)/.test(rewards)],
  ["rewards: tab count line does not claim a count after a failure", /Achievements could not be loaded"/.test(rewards)],
  ["rewards: account switch still clears server achievements", /serverAchievementsOwnerRef\.current = null\s*\n\s*setServerAchievements\(\[\]\)\s*\n\s*setAchievementsHydrating\(true\)/.test(rewards)],
  ["communities: last good query key tracked", /directoryGoodKeyRef = useRef<string \| null>\(null\)/.test(comm) && /directoryGoodKeyRef\.current = `\$\{communityIdentityId\}\|\$\{directory\}\|\$\{categoryFilter\}\|\$\{searchQuery\.trim\(\)\}`/.test(comm)],
  ["communities: failed refresh of the same query keeps the list and says it may be out of date", /keepKnownList/.test(comm) && /may be out of date/.test(comm)],
  ["communities: a different query or identity never keeps another query's rows", /if \(directoryOffset === 0 && !keepKnownList\) \{ setRemoteDirectory\(\[\]\)/.test(comm) && /directoryGoodKeyRef\.current = null\s*\n\s*setDurableInvitations/.test(comm)],
  ["profile: listings failed flag and retry", /profileListingsFailed/.test(prof) && /setProfileListingsRetry\(\(tick\) => tick \+ 1\)/.test(prof) && /\[profileSectionTab, profileListingsRetry\]/.test(prof)],
  ["profile: failed load no longer wipes listings", !/if \(!remote\.ok\) \{\s*setProfileListings\(\[\]\)/.test(prof) && !/if \(!cancelled\) setProfileListings\(\[\]\)/.test(prof)],
  ["profile: 'No listings yet' not shown after a failed load", /\) : profileListingsFailed \? null : \(/.test(prof)],
  ["profile: listings cleared on account switch", /setProfileListings\(\[\]\)\s*\n\s*setProfileListingsFailed\(false\)\s*\n\s*\}, \[meId\]\)/.test(prof)],
]
for (const [n, p] of checks) { console.log(`${p ? "PASS" : "FAIL"} ${n}`); assert.ok(p, n) }
console.log(`RUN483 list failure truth: ${checks.length}/${checks.length} passed`)
