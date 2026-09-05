import { readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, relative, resolve } from 'node:path';

const root = process.cwd();
const statusPath = resolve(root, 'shared/project-status.json');
const status = JSON.parse(readFileSync(statusPath, 'utf8'));
const errors = [];

const allowedStates = {
  training: ['public-beta'],
  map: ['active'],
  practice: ['selective-request'],
  advancedTraining: ['planning']
};

for (const [area, allowed] of Object.entries(allowedStates)) {
  if (!status[area] || !allowed.includes(status[area].state)) {
    errors.push(`${area}: stato mancante o inatteso (${status[area]?.state ?? 'assente'})`);
  }
  if (!status[area]?.label || !status[area]?.href || !status[area]?.detail) {
    errors.push(`${area}: configurazione pubblica incompleta`);
  }
}

function walk(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = resolve(directory, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const publicSources = [resolve(root, 'src'), resolve(root, 'formazione/src')]
  .flatMap(walk)
  .filter((path) => ['.astro', '.md', '.ts', '.js'].includes(extname(path)));

const staleTrainingPatterns = [
  /il percorso formativo tao veda (?:è|resta) in (?:costruzione|sviluppo)/i,
  /il corso fondativo (?:è|resta) in (?:costruzione|sviluppo)/i,
  /la formazione tao veda (?:è|resta) in (?:costruzione|sviluppo)/i,
  /comunità in formazione/i
];

if (status.training.state === 'public-beta') {
  for (const path of publicSources) {
    const source = readFileSync(path, 'utf8');
    for (const pattern of staleTrainingPatterns) {
      if (pattern.test(source)) {
        errors.push(`${relative(root, path)}: testo incompatibile con il corso fondativo in beta pubblica (${pattern.source})`);
      }
    }
  }
}

const rootSiteConfig = readFileSync(resolve(root, 'src/lib/site.ts'), 'utf8');
const trainingSiteConfig = readFileSync(resolve(root, 'formazione/src/lib/site.ts'), 'utf8');
const navSource = readFileSync(resolve(root, 'src/lib/site.ts'), 'utf8');
const homeSource = readFileSync(resolve(root, 'src/pages/index.astro'), 'utf8');

if (!rootSiteConfig.includes('shared/project-status.json')) {
  errors.push('src/lib/site.ts: configurazione condivisa degli stati non importata');
}
if (!trainingSiteConfig.includes('../../../shared/project-status.json')) {
  errors.push('formazione/src/lib/site.ts: configurazione condivisa degli stati non importata');
}
for (const label of ['Cos’è Tao Veda', 'Il trattamento', 'Approfondisci', 'Corso online', 'Incontrarsi']) {
  if (!navSource.includes(`label: "${label}"`)) {
    errors.push(`navigazione: voce mancante (${label})`);
  }
}
for (const area of ['training', 'map', 'practice']) {
  if (!homeSource.includes(`PROJECT_STATUS.${area}`)) {
    errors.push(`home: stato ${area} non mostrato dalla configurazione condivisa`);
  }
}
if (!homeSource.includes('id="inizia"')) {
  errors.push('home: ancora #inizia mancante');
}

if (errors.length) {
  console.error(`Audit stati fallito (${errors.length} problemi):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}

console.log('Audit stati completato: beta pubblica, Mappa attiva, incontri su accordo personale e formazione pratica in progettazione.');
