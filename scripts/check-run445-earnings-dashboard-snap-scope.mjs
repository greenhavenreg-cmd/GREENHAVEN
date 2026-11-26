import fs from 'node:fs'

const path = 'components/ghc/unified-earnings-dashboard.tsx'
const source = fs.readFileSync(path, 'utf8')
const state = source.match(/const\s*\[serverSnap\s*,\s*setSnap\]\s*=\s*useState<Withdrawable\s*\|\s*null>/)
const display = source.match(/const\s+displaySnap\s*=\s*serverSnap\s*\|\|\s*lastKnownSnapRef\.current/)
const alias = source.match(/const\s+snap\s*=\s*displaySnap/)
const previewCallback = source.match(/const onPreviewFee = useCallback\(async \(\) => \{[\s\S]*?\}, \[serverSnap\]\)/)
if (!state || !display || !alias || !previewCallback) {
  console.error('FAIL: earnings dashboard snapshot state/render scopes are not separated as expected')
  process.exit(1)
}
const beforeRender = source.split('  // Prefer live snap; fall back to last known when refresh degraded.')[0]
if (/\bconst\s+snap\s*=/.test(beforeRender)) {
  console.error('FAIL: render-only snap alias is declared before the render boundary')
  process.exit(1)
}
console.log('PASS: earnings dashboard state snapshot and render alias use distinct scopes')
