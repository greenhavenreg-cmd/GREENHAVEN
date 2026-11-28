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
  'docs/CURRENT-SOURCE-OF-TRUTH-2026-11-27.md',
  'docs/CURRENT-SOURCE-OF-TRUTH-2026-11-28.md',
  'docs/RUN503-DURABLE-DISCOVERY-RSVP-2026-11-28.md',
  'docs/RUN504-NOTIFICATION-OUTAGE-PRESENCE-DURABILITY-2026-11-28.md',
  'docs/RUN505-CONVERSATION-INBOX-OUTAGE-INTEGRITY-2026-11-28.md',
  'docs/RUN506-DIRECT-CALL-CONTROL-STATE-2026-11-28.md',
  'docs/RUN507-ROOT-METADATA-RECONCILIATION-2026-11-28.md',
  'docs/RUN508-SECURE-IDEMPOTENCY-AND-COMMENT-REACTIONS-2026-11-28.md',
  'docs/RUN509-SECURE-RANDOM-SWEEP-AND-NOTIFICATION-BELL-CRASHES-2026-11-28.md',
  'docs/RUN510-RPC-SOURCE-DRIFT-2026-11-28.md',
  'docs/RUN511-MARKETPLACE-POSITIVE-PRICE-2026-11-28.md',
  'docs/RUN512-TESTNET-PROFILE-PARITY-2026-11-28.md',
  'docs/UPGRADE-WORKLOG-0.338.177.md',
  'docs/UPGRADE-WORKLOG-0.338.176.md',
  'docs/UPGRADE-WORKLOG-0.338.175.md',
  'docs/UPGRADE-WORKLOG-0.338.174.md',
  'docs/UPGRADE-WORKLOG-0.338.173.md',
  'docs/RUN475-MESSAGING-STORE-WRITES-2026-11-28.md',
  'docs/RUN478-CONVERSATION-PREFS-TRUTH-2026-11-28.md',
  'docs/RUN479-COMMUNITY-ROLE-TRUTH-2026-11-28.md',
  'docs/RUN480-SAVED-LIST-VISIBILITY-2026-11-28.md',
  'docs/RUN481-SEARCH-STATUS-TRUTH-2026-11-28.md',
  'docs/RUN497-NO-CONTRADICTORY-SUCCESS-TOASTS-2026-11-28.md',
  'docs/RUN498-NAV-ATTENTION-AND-INTEREST-CHIPS-2026-11-28.md',
  'docs/RUN499-CLOSE-BUTTON-TOUCH-TARGETS-2026-11-28.md',
  'docs/RUN501-MESSAGES-COUNT-BADGE-AND-TOAST-DISMISS-2026-11-28.md',
  'docs/RUN496-VOICE-NOTE-DELIVERY-2026-11-28.md',
  'docs/RUN495-MESSAGING-TOAST-AND-RETRY-DRAFT-2026-11-28.md',
  'docs/RUN494-NOTIFICATION-MARK-ALL-TRUTH-2026-11-28.md',
  'docs/RUN493-COMMUNITY-MUTE-TRUTH-2026-11-28.md',
  'docs/RUN492-GHC-AND-SKU-COMMA-PRICE-2026-11-28.md',
  'docs/RUN491-MARKETPLACE-PRICE-INPUT-2026-11-28.md',
  'docs/RUN490-LIGHTBOX-ARROW-KEYS-2026-11-28.md',
  'docs/RUN489-STORY-VIEWER-KEYS-2026-11-28.md',
  'docs/RUN488-NOTIFICATION-BELL-I18N-2026-11-28.md',
  'docs/RUN487-EXAM-AND-PREVIEW-LABELS-2026-11-28.md',
  'docs/RUN486-RESEARCH-FORM-LABELS-2026-11-28.md',
  'docs/RUN485-SERVER-SIDE-AUDIT-2026-11-28.md',
  'docs/RUN484-STATIC-AUDIT-AND-IDENTITY-SCAN-LABEL-2026-11-28.md',
  'docs/RUN483-LIST-FAILURE-TRUTH-2026-11-28.md',
  'docs/RUN482-PASSKEYS-AND-RECOVERY-LOAD-TRUTH-2026-11-28.md',
  'docs/RUN477-NOTIFICATION-OUTAGE-TRUTH-AND-POST-WRITE-AUDIT-2026-11-28.md',
  'docs/RUN476-MESSAGING-SEND-RECEIPTS-2026-11-28.md',
  'docs/RUN474-COMMENTS-AND-SAVES-AUDIT-2026-11-28.md',
  'docs/RUN473-POST-CURATION-AUDIT-2026-11-28.md',
  'docs/RUN472-MEMBERSHIP-ATTEMPT-REFERENCE-2026-11-28.md',
  'docs/RUN471-COMMA-DECIMAL-AMOUNT-INPUT-2026-11-28.md',
  'docs/RUN470-MONEY-ACTION-SINGLE-FLIGHT-2026-11-28.md',
  'docs/RUN469-OVERLAY-HOOK-AND-SEARCH-INPUT-2026-11-28.md',
  'docs/RUN468-TOUCH-TARGET-EXPANSION-2026-11-28.md',
  'docs/RUN467-KEYBOARD-CARDS-AND-NOTIFICATION-SECTIONS-2026-11-28.md',
  'docs/RUN466-SEARCH-NOTIFICATION-KEYBOARD-2026-11-28.md',
  'docs/RUN465-OVERLAY-SEMANTICS-AND-CONTROL-LABELS-2026-11-28.md',
  'docs/RUN464-SHEET-A11Y-AND-ACTION-GUARDS-2026-11-27.md',
  'docs/RUN463-DIALOG-AND-MONEY-UX-BASELINE-2026-11-27.md',
  'docs/RUN462-PRODUCTION-GRADE-AUDIT-2026-11-27.md',
  'docs/RUN461-REWARD-CLAIM-RESPONSE-INTEGRITY-2026-11-27.md',
  'docs/UPGRADE-WORKLOG-0.338.172.md',
  'docs/RUN460-REFERRAL-READ-HARDENING-2026-11-27.md',
  'docs/UPGRADE-WORKLOG-0.338.171.md',
  'docs/RUN459-MARKETPLACE-ORDER-TRANSPARENCY-2026-11-27.md',
  'docs/UPGRADE-WORKLOG-0.338.170.md',
  'docs/RUN458-MARKETPLACE-CART-ACCOUNT-ISOLATION-2026-11-27.md',
  'docs/UPGRADE-WORKLOG-0.338.169.md',
  'docs/RUN457-CREATOR-STUDIO-ACCOUNT-INTEGRITY-2026-11-27.md',
  'docs/UPGRADE-WORKLOG-0.338.168.md',
  'docs/RUN456-IMPACT-HISTORY-RELEASE-2026-11-27.md',
  'docs/UPGRADE-WORKLOG-0.338.167.md',
  'docs/RUN455-EVENTS-SERVICE-UNBLOCK-2026-11-27.md',
  'docs/UPGRADE-WORKLOG-0.338.166.md',
  'docs/RUN454-SELLER-CENTRE-UNBLOCK-2026-11-27.md',
  'docs/RUN454-PRODUCT-READINESS-SCORECARD-2026-11-27.md',
  'docs/UPGRADE-WORKLOG-0.338.165.md',
  'docs/UPGRADE-WORKLOG-0.338.164.md',
  'docs/RUN452-CREATE-OTHERS-AND-SCROLL-REFINEMENT-2026-11-27.md',
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
  'docs/UPGRADE-WORKLOG-0.338.157.md',
  'docs/UPGRADE-WORKLOG-0.338.158.md',
  'docs/RUN446-MARKETPLACE-SPEND-SIGNATURE-REPAIR-2026-11-26.md',
  'docs/RUN447-COMMUNITY-ROLE-TYPE-REPAIR-2026-11-26.md',
  'docs/RUN449-ENV-TEMPLATE-RESTORATION-2026-11-26.md',
  'docs/RUN450-WALLET-WITHDRAWAL-MEMBERSHIP-REFERRAL-MISSIONS-2026-11-26.md',
  'docs/RUN451-TESTNET-ECONOMY-ACTIVATION-2026-11-26.md',
  'docs/UPGRADE-WORKLOG-0.338.163.md',
  'docs/UPGRADE-WORKLOG-0.338.161.md',
  'docs/RUN448-DISCOVERY-TOAST-AND-OPERATIONAL-HASH-REPAIR-2026-11-26.md',
  'docs/UPGRADE-WORKLOG-0.338.159.md',
  'docs/UPGRADE-WORKLOG-0.338.160.md',
  'docs/RUN445-EARNINGS-DASHBOARD-BUILD-REPAIR-2026-11-26.md',
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
