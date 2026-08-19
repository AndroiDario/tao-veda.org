import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';

const KEY = 'f808e860b580c96482e8b3e5bafc9c6d';
const isProduction = process.env.CONTEXT === 'production';

if (!isProduction || process.env.SKIP_INDEXNOW === '1') {
  console.log('IndexNow: invio saltato fuori dal deploy di produzione.');
  process.exit(0);
}

/**
 * Segnalare gli URL a IndexNow è una cortesia verso i motori di ricerca: il
 * sito è già costruito e valido quando questo script parte. Un errore qui
 * viene registrato e basta, altrimenti fa cadere un deploy sano.
 * Con INDEXNOW_STRICT=1 torna a essere bloccante, per il debug.
 */
const strict = process.env.INDEXNOW_STRICT === '1';

function rinuncia(messaggio) {
  console.warn(`IndexNow: ${messaggio}`);
  process.exit(strict ? 1 : 0);
}

const cwd = process.cwd();
const isTraining = basename(cwd) === 'formazione';
const host = isTraining ? 'formazione.tao-veda.org' : 'www.tao-veda.org';
const origin = `https://${host}`;
const sitemapPath = resolve(cwd, 'dist/sitemap-0.xml');

if (!existsSync(sitemapPath)) {
  rinuncia(`sitemap non trovata in ${sitemapPath}, invio saltato.`);
}

const sitemapUrls = [...readFileSync(sitemapPath, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((match) => match[1]);

function changedFiles() {
  const base = process.env.CACHED_COMMIT_REF;
  const head = process.env.COMMIT_REF;
  if (!base || !head) return null;
  try {
    return execFileSync('git', ['diff', '--name-status', base, head], {
      cwd,
      encoding: 'utf8',
    })
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((line) => line.split('\t').at(-1));
  } catch {
    return null;
  }
}

function urlForFile(file) {
  if (isTraining) {
    const course = file.match(/^formazione\/src\/content\/corsi\/([^/]+)\.md$/);
    if (course) return `${origin}/corsi/${course[1]}`;
    const module = file.match(/^formazione\/src\/content\/moduli\/(?:\d+-)?([^/]+)\.md$/);
    if (module) return `${origin}/corsi/via-tao-veda/${module[1]}`;
    return null;
  }

  const article = file.match(/^src\/content\/diario\/([^/]+)\.md$/);
  if (article) return `${origin}/conoscenza/diario/${article[1]}`;
  const tradition = file.match(/^src\/content\/tradizioni\/([^/]+)\.md$/);
  if (tradition) return `${origin}/conoscenza/tradizioni/${tradition[1]}`;
  if (file.startsWith('src/content/glossario/')) return `${origin}/conoscenza/glossario`;
  if (file.startsWith('src/content/bibliografia/')) return `${origin}/conoscenza/bibliografia`;
  return null;
}

const files = changedFiles();
const globalChange = !files || files.some((file) => {
  if (isTraining) {
    return file.startsWith('formazione/src/layouts/') ||
      file.startsWith('formazione/src/lib/') ||
      file === 'formazione/astro.config.mjs';
  }
  return file.startsWith('src/layouts/') || file.startsWith('src/lib/') || file === 'astro.config.mjs';
});

let urls = globalChange ? sitemapUrls : files.map(urlForFile).filter(Boolean);
urls = [...new Set(urls)].slice(0, 10_000);

if (!urls.length) {
  console.log('IndexNow: nessun URL pubblico cambiato.');
  process.exit(0);
}

let response;

try {
  response = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host,
      key: KEY,
      keyLocation: `${origin}/${KEY}.txt`,
      urlList: urls,
    }),
  });
} catch (error) {
  rinuncia(`endpoint irraggiungibile (${error.message}), invio saltato.`);
}

if (!response.ok && response.status !== 202) {
  const corpo = await response.text().catch(() => '');
  rinuncia(`risposta ${response.status} ${corpo}`.trim() + ', invio saltato.');
}

console.log(`IndexNow: notificati ${urls.length} URL per ${host}.`);
