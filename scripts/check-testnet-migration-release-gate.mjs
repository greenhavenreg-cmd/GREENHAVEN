#!/usr/bin/env node
/**
 * Fail-closed Testnet migration release gate.
 * This validates release evidence and hash pins; it does not execute SQL.
 */
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const migrationDir = join(root, 'supabase', 'migrations')
const gatePath = join(root, 'supabase', 'TESTNET_RELEASE_GATE.json')
const gate = JSON.parse(readFileSync(gatePath, 'utf8'))
const applyOrder = readFileSync(join(root, 'supabase', 'TESTNET_APPLY_ORDER.md'), 'utf8')
const errors = []
const files = readdirSync(migrationDir).filter((name) => name.endsWith('.sql'))
const byVersion = new Map(files.map((name) => [name.slice(0, 14), name]))

if (gate.schema_version !== 1) errors.push('unsupported release-gate schema_version')
if (gate.release !== 'greenhaven-testnet') errors.push('release must be greenhaven-testnet')
if (gate.status !== 'CLEARED') errors.push(`release status is ${gate.status}; expected CLEARED`)
if (!gate.target_history?.reconciled || !gate.target_history?.evidence?.trim()) {
  errors.push('target migration history must be reconciled with evidence')
}
const rehearsal = gate.postgres_rehearsal ?? {}
if (rehearsal.status !== 'PASS' || !rehearsal.postgres_version?.trim() || !rehearsal.supabase_cli_version?.trim() || !rehearsal.clean_install_passed || !rehearsal.upgrade_replay_passed || !rehearsal.rollback_or_restore_verified || !rehearsal.evidence?.trim()) {
  errors.push('PostgreSQL clean install, upgrade replay, restore/rollback and versioned evidence must all pass')
}
if (!Array.isArray(gate.approved_migrations) || gate.approved_migrations.length === 0) {
  errors.push('approved_migrations must contain individually approved, hash-pinned migrations')
}

const excluded = new Set(gate.excluded_migrations ?? [])
for (const required of [
  '20261022010016_community_join_reasons_proposal.sql',
  '20261022010017_community_governance_log_proposal.sql',
]) {
  if (!excluded.has(required)) errors.push(`legacy proposal must remain excluded: ${required}`)
}

const approvedVersions = new Set()
for (const item of gate.approved_migrations ?? []) {
  const { version, filename, sha256, approval_evidence } = item
  if (!/^\d{14}$/.test(version ?? '')) { errors.push(`invalid approved migration version: ${version}`); continue }
  if (approvedVersions.has(version)) errors.push(`duplicate approved version: ${version}`)
  approvedVersions.add(version)
  const actualName = byVersion.get(version)
  if (!actualName || actualName !== filename) { errors.push(`approved migration filename/version mismatch: ${version}`); continue }
  if (excluded.has(actualName)) errors.push(`excluded migration cannot be approved: ${actualName}`)
  const orderRow = applyOrder.split('\n').find((line) => line.includes(`\`${actualName}\``))
  const operatorAction = orderRow?.split('|').at(-2)?.trim()
  if (operatorAction !== 'REVIEW_THEN_APPLY') {
    errors.push(`${actualName} is not currently eligible for candidate review (operator action: ${operatorAction ?? 'missing'})`)
  }
  const actualHash = createHash('sha256').update(readFileSync(join(migrationDir, actualName))).digest('hex')
  if (actualHash !== sha256) errors.push(`SHA-256 mismatch for ${actualName}`)
  if (!approval_evidence?.trim()) errors.push(`missing per-migration approval evidence: ${actualName}`)
}

// A candidate may depend on another migration only if that predecessor is in the
// approved batch or explicitly recorded as already applied on this exact target.
const applied = new Set(gate.target_history?.verified_applied_versions ?? [])
for (const version of applied) {
  if (!/^\d{14}$/.test(version) || !byVersion.has(version)) errors.push(`target history contains unknown or invalid applied version: ${version}`)
}
for (const item of gate.approved_migrations ?? []) {
  for (const dependency of item.depends_on ?? []) {
    if (!approvedVersions.has(dependency) && !applied.has(dependency)) {
      errors.push(`${item.version} has unresolved predecessor ${dependency}`)
    }
  }
}

if (errors.length) {
  console.error(errors.map((e) => `BLOCK ${e}`).join('\n'))
  console.error(`BLOCKED: ${files.length} canonical migrations inspected; no SQL was executed.`)
  process.exit(1)
}

console.log(`PASS Testnet release gate: ${gate.approved_migrations.length} individually approved, hash-pinned migrations; ${files.length} canonical files inspected; no SQL was executed.`)
