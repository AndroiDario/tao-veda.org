import { existsSync, readFileSync, readdirSync } from 'node:fs';
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

const validTrackingName = /^[a-z][a-z0-9_]*$/;
const duplicates = (values) => values.filter((value, index) => values.indexOf(value) !== index);

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

if (isTraining) {
  const eventNames = config.trainingEvents ?? [];
  const parameterNames = config.trainingEventParameters ?? [];

  if (!Array.isArray(eventNames) || eventNames.length === 0) {
    errors.push('Tracking Formazione: elenco eventi mancante in tracking.config.json');
  }
  if (!Array.isArray(parameterNames) || parameterNames.length === 0) {
    errors.push('Tracking Formazione: elenco parametri mancante in tracking.config.json');
  }
  for (const name of [...eventNames, ...parameterNames]) {
    if (typeof name !== 'string' || !validTrackingName.test(name)) {
      errors.push(`Tracking Formazione: nome non valido (${String(name)})`);
    }
  }
  for (const name of duplicates(eventNames)) {
    errors.push(`Tracking Formazione: evento duplicato (${name})`);
  }
  for (const name of duplicates(parameterNames)) {
    errors.push(`Tracking Formazione: parametro duplicato (${name})`);
  }

  const buildDirectories = [dist, resolve(cwd, '.netlify/build')].filter(existsSync);
  const builtTrackingSource = buildDirectories.flatMap(walk)
    .filter((path) => /\.(?:html|js|mjs)$/.test(path))
    .map((path) => readFileSync(path, 'utf8'))
    .join('\n');
  for (const eventName of eventNames) {
    const occurrences = builtTrackingSource.split(eventName).length - 1;
    // Una occorrenza appartiene alla configurazione incorporata nel bundle;
    // almeno una seconda deve provenire dal codice che emette l'evento.
    if (occurrences < 2) {
      errors.push(`Tracking Formazione: evento configurato ma assente dal build (${eventName})`);
    }
  }
}

if (!isTraining) {
  const eventNames = config.siteEvents ?? [];

  if (!Array.isArray(eventNames) || eventNames.length === 0) {
    errors.push('Tracking sito: elenco eventi mancante in tracking.config.json');
  }
  for (const name of eventNames) {
    if (typeof name !== 'string' || !validTrackingName.test(name)) {
      errors.push(`Tracking sito: nome non valido (${String(name)})`);
    }
  }
  for (const name of duplicates(eventNames)) {
    errors.push(`Tracking sito: evento duplicato (${name})`);
  }

  const builtTrackingSource = walk(dist)
    .filter((path) => /\.(?:html|js|mjs)$/.test(path))
    .map((path) => readFileSync(path, 'utf8'))
    .join('\n');
  for (const eventName of eventNames) {
    if (!builtTrackingSource.includes(eventName)) {
      errors.push(`Tracking sito: evento configurato ma assente dal build (${eventName})`);
    }
  }
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
