import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const css = fs.readFileSync(path.join(root, 'app/gh-premium-overhaul.css'), 'utf8');
const layout = fs.readFileSync(path.join(root, 'app/layout.tsx'), 'utf8');
const report = fs.readFileSync(path.join(root, 'docs/RUN401-CROSS-SURFACE-PREMIUM-POLISH-2026-11-25.md'), 'utf8');
const research = fs.readFileSync(path.join(root, 'components/field/research-studio-client.tsx'), 'utf8');
const marketplace = fs.readFileSync(path.join(root, 'components/ghc/marketplace-screen.tsx'), 'utf8');
const checks = [
  ['stylesheet imported once', (layout.match(/gh-premium-overhaul\.css/g) || []).length === 1],
  ['feed styling present', css.includes('.gh-world-feed')],
  ['marketplace styling present', css.includes('.gh-world-marketplace')],
  ['community styling present', css.includes('.gh-world-community')],
  ['research scoped styling present', css.includes('[data-gh-module="research"]')],
  ['message styling present', css.includes('.gh-world-messages')],
  ['discovery styling present', css.includes('.gh-world-discovery')],
  ['cart scoped styling present', css.includes('[data-gh-module="cart"]')],
  ['research styling hook attached to real root', /data-gh-module="research"/.test(research)],
  ['cart styling hook attached to both cart states', (marketplace.match(/data-gh-module="cart"/g) || []).length >= 2],
  ['profile styling present', css.includes('.gh-world-profile')],
  ['reduced motion respected', css.includes('prefers-reduced-motion: reduce')],
  ['focus-visible affordance present', css.includes(':focus-visible')],
  ['responsive breakpoint present', css.includes('@media (max-width: 420px)')],
  ['report contains ten-upgrade audit', (report.match(/10\./g) || []).length >= 8],
  ['migration/credit not falsely claimed', report.includes('No migrations or credits were applied')],
];
let failed = 0;
for (const [name, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`); if (!ok) failed++; }
if (failed) process.exitCode = 1;
else console.log(`Run 401 cross-surface polish: ${checks.length}/${checks.length} checks passed`);
