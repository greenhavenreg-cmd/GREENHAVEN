#!/usr/bin/env node
/** Lightweight repository secret-pattern gate. Values are never printed. */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const root = process.cwd()
const ignored = new Set(['.git', 'node_modules', '.next', '.vercel', '.turbo', '.cache', 'coverage', 'dist', 'build', 'out', 'playwright-report', 'test-results'])
const patterns = [
  ['private-key-pem', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ['aws-access-key-id', /\bAKIA[0-9A-Z]{16}\b/],
  ['github-personal-access-token', /\bgh[pousr]_[A-Za-z0-9]{30,}\b/],
  ['github-fine-grained-token', /\bgithub_pat_[A-Za-z0-9_]{30,}\b/],
  ['supabase-service-jwt', /\beyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_-]{40,}\.[A-Za-z0-9_-]{24,}\b/],
  ['stripe-secret-key', /\bsk_(?:live|test)_[A-Za-z0-9]{20,}\b/],
  ['secret-env-assignment', /\b(?:SUPABASE_SERVICE_ROLE_KEY|PI_API_KEY|PI_SERVER_API_KEY|GHC_OPERATOR_RECONCILE_KEY|GHC_CREATOR_REWARD_OPERATOR_KEY)\s*=\s*[^\s#]{24,}/i],
  ['public-secret-env-name', /\bNEXT_PUBLIC_[A-Z0-9_]*(?:SERVICE_ROLE|PRIVATE_KEY|SECRET_KEY|ACCESS_TOKEN|API_SECRET)[A-Z0-9_]*\s*=/i],
]
const hits = []
let scanned = 0
function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!ignored.has(entry.name)) walk(join(dir, entry.name))
      continue
    }
    if (!entry.isFile()) continue
    const path = join(dir, entry.name)
    const size = statSync(path).size
    if (size > 5 * 1024 * 1024) continue
    let content
    try { content = readFileSync(path, 'utf8') } catch { continue }
    if (content.includes('\u0000')) continue
    scanned++
    const lines = content.split(/\r?\n/)
    for (let i = 0; i < lines.length; i++) {
      for (const [name, pattern] of patterns) {
        if (pattern.test(lines[i])) hits.push({ name, path: relative(root, path), line: i + 1 })
      }
    }
  }
}
walk(root)
if (hits.length) {
  console.error(`FAIL repository secret-pattern scan: ${hits.length} potential finding(s) across ${scanned} text files.`)
  for (const hit of hits) console.error(`- ${hit.path}:${hit.line} (${hit.name}); value suppressed`)
  process.exit(1)
}
console.log(`PASS repository secret-pattern scan: ${scanned} text files; zero potential secret values.`)
