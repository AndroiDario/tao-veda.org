import { readFileSync, readdirSync } from 'node:fs';
import { relative, resolve } from 'node:path';

const root = process.cwd();
const dist = resolve(root, 'dist');
const errors = [];

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
  const mainCount = (source.match(/<main\b/g) ?? []).length;

  if (mainCount !== 1) errors.push(`${page}: atteso un solo elemento main, trovati ${mainCount}`);
  if (!/class="skip-link"[^>]+href="#contenuto"/.test(source)) errors.push(`${page}: skip-link mancante`);
  if (!/<main\b[^>]*id="contenuto"[^>]*tabindex="-1"/.test(source)) errors.push(`${page}: destinazione skip-link non focalizzabile`);
}

const mapHtml = readFileSync(resolve(dist, 'mappa-tao-veda.html'), 'utf8');
if (!/<input[^>]+id="mappa-check"[^>]+hidden/.test(mapHtml)) {
  errors.push('/mappa-tao-veda: honeypot non escluso dall’albero accessibile');
}

const css = readFileSync(resolve(root, 'src/styles/styles.css'), 'utf8');
if (!/\.menu-toggle,.courses-shortcut\{min-height:44px/.test(css)) {
  errors.push('navigazione mobile: target Menu/Inizia inferiore a 44px');
}
if (!/@media\(max-width:640px\)[\s\S]*?\.cmp-reopen\{[\s\S]*?position:static;[\s\S]*?min-height:44px/.test(css)) {
  errors.push('CMP mobile: pulsante Privacy non è in flusso o è inferiore a 44px');
}
if (!/a:focus-visible,button:focus-visible\{outline:2px solid var\(--gold\)/.test(css)) {
  errors.push('focus visibile globale mancante per link e pulsanti');
}

const tokens = readFileSync(resolve(root, 'shared/styles/tokens.css'), 'utf8');
const colors = Object.fromEntries(
  [...tokens.matchAll(/--(bg|text|muted|gold|gold-dim):\s*(#[0-9a-f]{6})/gi)].map((match) => [match[1], match[2]])
);

function luminance(hex) {
  const channels = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255)
    .map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(first, second) {
  const a = luminance(first);
  const b = luminance(second);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

for (const token of ['text', 'muted', 'gold', 'gold-dim']) {
  if (!colors[token] || !colors.bg) {
    errors.push(`contrasto: token ${token} o bg mancante`);
    continue;
  }

  const ratio = contrast(colors[token], colors.bg);
  if (ratio < 4.5) errors.push(`contrasto: ${token} su bg = ${ratio.toFixed(2)}, richiesto almeno 4.5:1`);
}

if (errors.length) {
  console.error(`Audit accessibilità fallito (${errors.length} problemi):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}

console.log('Audit accessibilità completato: landmark, skip-link, honeypot, focus, target mobile e contrasto verificati.');
