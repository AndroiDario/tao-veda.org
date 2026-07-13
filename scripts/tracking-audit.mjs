import { readFileSync, readdirSync } from 'node:fs';
import { basename, relative, resolve } from 'node:path';

const cwd = process.cwd();
const isTraining = basename(cwd) === 'formazione';
const root = isTraining ? resolve(cwd, '..') : cwd;
const dist = resolve(cwd, 'dist');
const config = JSON.parse(readFileSync(resolve(root, 'tracking.config.json'), 'utf8'));
const errors = [];
const consentBootstrap = readFileSync(resolve(root, 'public/assets/js/consent-init.js'), 'utf8');
const cmpSource = readFileSync(resolve(root, 'public/assets/js/cmp.js'), 'utf8');

if (!consentBootstrap.includes('taoVedaAddConsentListener')) {
  errors.push('CMP: listener richiesto dal template GTM mancante');
}
if (!cmpSource.includes('__taoVedaNotifyConsent')) {
  errors.push('CMP: notifica degli aggiornamenti al template GTM mancante');
}
if (/gtag\s*\(\s*['"]consent/.test(`${consentBootstrap}\n${cmpSource}`)) {
  errors.push('CMP: il Consent Mode deve essere gestito soltanto dal template GTM');
}
if (!consentBootstrap.includes(`var CONSENT_VERSION = ${config.consentVersion};`)) {
  errors.push('CMP: versione del bootstrap diversa da tracking.config.json');
}

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

for (const file of walk(dist).filter((path) => path.endsWith('.html'))) {
  const page = `/${relative(dist, file).replaceAll('\\', '/')}`;
  if (page === '/admin/index.html') continue;

  const source = readFileSync(file, 'utf8');
  const gtmIds = new Set(source.match(/GTM-[A-Z0-9]+/g) ?? []);
  const consentScript = `consent-init.js?v=${config.consentVersion}`;
  const cmpScript = `cmp.js?v=${config.consentVersion}`;
  const consentIndex = source.indexOf(consentScript);
  const gtmIndex = source.indexOf('googletagmanager.com/gtm.js');
  const cmpIndex = source.indexOf(cmpScript);

  if (gtmIds.size !== 1 || !gtmIds.has(config.gtmId)) {
    errors.push(`${page}: container GTM inatteso (${[...gtmIds].join(', ') || 'mancante'})`);
  }
  if (gtmIndex < 0) errors.push(`${page}: bootstrap GTM mancante`);
  if (consentIndex < 0) errors.push(`${page}: bootstrap consenso v${config.consentVersion} mancante`);
  if (cmpIndex < 0) errors.push(`${page}: interfaccia CMP v${config.consentVersion} mancante`);
  if (consentIndex > gtmIndex) errors.push(`${page}: il bootstrap consenso deve precedere GTM`);
  if (cmpIndex >= 0 && cmpIndex < gtmIndex) errors.push(`${page}: la CMP deve essere inizializzata dopo GTM`);
  if (/googletagmanager\.com\/gtag\/js|G-[A-Z0-9]{6,}/.test(source)) {
    errors.push(`${page}: GA4 deve essere caricato soltanto dal container GTM`);
  }
}

if (errors.length) {
  console.error(`Audit tracking fallito (${errors.length} problemi):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}

console.log(`Audit tracking completato: container unico ${config.gtmId}, CMP v${config.consentVersion}.`);
