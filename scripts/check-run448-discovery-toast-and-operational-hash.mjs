import fs from 'node:fs'

const discovery = fs.readFileSync('components/ghc/discovery-grid-screen.tsx', 'utf8')
const operationalRpc = fs.readFileSync('lib/server/marketplace/operational-rpc.ts', 'utf8')

const toastDeclarations = [...discovery.matchAll(/^\s*addToast\?:/gm)]
const hasSingleToastContract = toastDeclarations.length === 1 && /addToast\?:\s*\(message: string, type\?: "success" \| "error" \| "info"\) => void/.test(discovery)
const importsNodeHash = /^import \{ createHash \} from "node:crypto"$/m.test(operationalRpc)
const usesHashForFingerprint = /createHash\("sha256"\)\.update\(payload\)\.digest\("hex"\)/.test(operationalRpc)

if (![hasSingleToastContract, importsNodeHash, usesHashForFingerprint].every(Boolean)) {
  console.error('FAIL: discovery toast contract or operational RPC crypto import is invalid')
  process.exit(1)
}
console.log('PASS: discovery has one compatible addToast declaration; operational RPC imports Node createHash')
