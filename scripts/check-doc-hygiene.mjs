#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const root = process.cwd()
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const docsRoot = join(root, 'docs')
const required = new Set([
  // Only current operating documents are mandatory. Historical reports may be
  // archived or omitted from a clean release bundle without breaking the build.
  'docs/INDEX.md',
  'docs/CURRENT-SOURCE-OF-TRUTH-2026-11-26.md',
  'docs/PRODUCT-UX-COPY-STANDARD.md',
  'docs/ENGINEERING-AUDIT-2026-11-26.md',
  'docs/RUN424-IDENTITY-FINANCIAL-INTEGRITY-2026-11-26.md',
  'docs/RUN426-PHASE0-SOCIAL-EXPERIENCE-FOUNDATION-2026-11-26.md',
  'docs/RUN427-PHASE1A-COMMUNITY-DIRECTORY-2026-11-26.md',
  'docs/RUN428-PHASE1-SOCIAL-CONNECTIONS-IMPLEMENTATION-2026-11-26.md',
  'docs/RUN429-PHASE1-DURABLE-COMMUNITY-INVITATIONS-2026-11-26.md',
  'docs/RUN430-PHASE2-SOCIAL-ENGAGEMENT-2026-11-26.md',
  'docs/RUN431-PHASE2-DISCOVERY-PREFERENCES-2026-11-26.md',
  'docs/RUN432-PHASE2-COMMUNITY-CREATE-DRAFT-2026-11-26.md',
  'docs/RUN433-PHASE2-INTEGRATED-SOCIAL-TRANSFORMATION-2026-11-26.md',
  'docs/RUN434-PHASE3-AUTHORITY-AUDIT-2026-11-26.md',
  'docs/RUN434-PHASE3-ROUTE-WRITER-INVENTORY-2026-11-26.csv',
  'docs/RUN435-PHASE3-IDENTITY-INPUT-CLASSIFICATION-2026-11-26.md',
  'docs/RUN437-PHASE3-READONLY-RECONCILIATION-PACK-2026-11-26.md',
  'docs/UPGRADE-WORKLOG-0.338.149.md',
  'docs/UPGRADE-WORKLOG-0.338.150.md',
  'docs/UPGRADE-WORKLOG-0.338.151.md',
  'docs/UPGRADE-WORKLOG-0.338.152.md',
  'docs/UPGRADE-WORKLOG-0.338.153.md',
  'docs/UPGRADE-WORKLOG-0.338.154.md',
  'docs/UPGRADE-WORKLOG-0.338.155.md',
  'docs/UPGRADE-WORKLOG-0.338.156.md',
  'docs/RUN444-TESTNET-PAYMENT-WITHDRAWAL-RAILS-2026-11-26.md',
  'docs/RUN442-TESTNET-MIGRATION-APPLICATION-REPORT-2026-11-26.md',
  'docs/RUN443-TESTNET-MIGRATION-APPLICATION-REPORT-2026-11-26.md',
  'docs/RUN441-PHASE4-COMMUNITY-MESSENGER-TRANSACTION-REHEARSAL.md',

  'docs/SOURCE_OF_TRUTH.md',
  'docs/PROJECT_TRUTH.md',
  'docs/PROJECT-SOURCE-OF-TRUTH.md',
  'docs/ENVIRONMENT-VARIABLES.md',
  'docs/MIGRATION_CHECKLIST.md',
  'docs/OPERATOR_ENV_AND_STATUS.md',
  'docs/SUPABASE-STORAGE-OPERATIONS.md',
  'docs/CURRENT_BUILD_CONTEXT.md',
  'docs/POLICY_REVIEW_CHECKLIST.md',
  // Retained operational and historical evidence; not customer-facing copy.
  'docs/FIELD-DESK-PUBLIC-ACCESS.md',
  'docs/MIGRATION-STRUCTURAL-INVENTORY-2026-11-09.csv',
  'docs/PI_A2U_ECOSYSTEM_QUALIFICATION.md',
  'docs/RESEARCH-EVIDENCE-USER-GUIDE.md',
  'docs/RESEARCH-STUDIO-USER-GUIDE.md',
  'docs/SCOPED-EVIDENCE-USER-GUIDE.md',
  'docs/releases/DEPLOYMENT-GUIDE-0.330.7.md',
  'docs/releases/DEPLOYMENT-GUIDE-0.338.54.md',
  'docs/releases/DEPLOYMENT-GUIDE-0.338.55.md',
  'docs/releases/RELEASE-MANIFEST-0.330.7.md',
  'docs/releases/RELEASE-MANIFEST-0.338.55.md',
  'docs/security/DEPENDENCY-REMEDIATION-STATUS-RUN320.md',
  'docs/security/RUN337-NPM-AUDIT-44237574920.json',
  'docs/security/RUN365-AUDIT-AND-FIX-2026-11-19.md',
  'docs/security/RUN370-PI-AUTH-REJECTION-DIAGNOSTICS-2026-11-19.md',
  'docs/security/RUN379-PI-CSP-AUTH-DIAGNOSTICS-2026-11-23.md',
  'docs/translation-review/PHASE10-REVIEW-REGISTER-0.297.0.csv',
  'docs/translation-review/PHASE6-REVIEW-REGISTER-0.293.0.csv',
  'docs/translation-review/PHASE9-REVIEW-REGISTER-0.296.0.csv',
])
const failures=[]
const walk=(dir)=>{
  for(const name of readdirSync(dir)){
    const p=join(dir,name)
    const rel=relative(root,p).replaceAll('\\','/')
    if(statSync(p).isDirectory()) {
      if (rel === 'docs/archive/historical-implementation-records') continue
      walk(p)
    } else if(rel.endsWith('.md') || rel.endsWith('.json') || rel.endsWith('.csv')) {
      if (rel.endsWith('.historical-notice.md') || existsSync(`${p}.historical-notice.md`)) continue
      if(rel === 'docs/PHASE-03-RESTORE-EVIDENCE-TEMPLATE.json' || rel === 'docs/architecture/PRODUCTION_VERIFICATION_REPORT.json') continue
      const s=readFileSync(p,'utf8')
      const archivedWorklog = rel.startsWith('docs/archive/upgrade-worklogs/')
      if(!archivedWorklog && !required.has(rel) && !['docs/ENVIRONMENT-VARIABLES.md','docs/PROJECT-SOURCE-OF-TRUTH.md'].includes(rel) && !s.startsWith('> **LEGACY VERIFICATION FIXTURE')) {
        // Non-required docs must be explicitly current; this prevents silent historical-document growth.
        // Allow: Pass48 baseline date, intermediate worklogs, and active Nov-2026 engineering notes.
        const currentWorklog = rel === `docs/UPGRADE-WORKLOG-${pkg.version}.md`
        const datedCurrent = /2026-10-31|2026-11-0[1-5]|2026-11-08|2026-11-09|2026-11-10|2026-11-11|2026-11-14|2026-11-15|2026-11-18|0\.222\.0|0\.26[5-9]|0\.27[0-5]|0\.312\.0|0\.313\.\d+/.test(s) || /0\.27[0-5]\.\d/.test(s) || /2026-11-18/.test(rel)
        if(!currentWorklog && !datedCurrent) failures.push(`unclassified documentation: ${rel}`)
      }
    }
  }
}
walk(docsRoot)
for(const p of required) {
  const rootPath = join(root,p)
  const archivedWorklog = p.startsWith('docs/UPGRADE-WORKLOG-')
    ? join(root,'docs/archive/upgrade-worklogs',p.slice('docs/'.length))
    : null
  const archivedHistorical = join(root, 'docs/archive/historical-implementation-records', `docs__${p.slice('docs/'.length).replaceAll('/', '__')}`)
  if(!existsSync(rootPath) && !(archivedWorklog && existsSync(archivedWorklog)) && !existsSync(archivedHistorical)) failures.push(`missing canonical document: ${p}`)
}
if(!readFileSync(join(root,'README.md'),'utf8').includes(`Current source version:** \`${pkg.version}\``)) failures.push('README current version marker missing')
if(!readFileSync(join(root,'docs/PROJECT_TRUTH.md'),'utf8').includes(`**Current source version:** \`${pkg.version}\``)) failures.push('PROJECT_TRUTH current version marker missing')
if(!readFileSync(join(root,'docs/SOURCE_OF_TRUTH.md'),'utf8').includes('legacy documents')) failures.push('SOURCE_OF_TRUTH legacy-document rule missing')
if(failures.length){ console.error(`Documentation hygiene: ${failures.length} failure(s)`); for(const f of failures) console.error(`FAIL ${f}`); process.exit(1) }
console.log('Documentation hygiene: PASS (legacy noise isolated/marked and current source-of-truth documents present)')
