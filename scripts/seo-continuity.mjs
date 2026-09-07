import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { createHash } from 'node:crypto';

// Capture only public build data. Never reads environment files or user data.
// Usage: node scripts/seo-continuity.mjs capture /tmp/before.json
//        node scripts/seo-continuity.mjs compare /tmp/before.json
const root = process.cwd();
const [mode, filename] = process.argv.slice(2);
if (!['capture', 'compare'].includes(mode) || !filename) {
  throw new Error('Usage: seo-continuity.mjs capture|compare <snapshot.json>');
}
const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const path = resolve(dir, entry.name);
  return entry.isDirectory() ? walk(path) : [path];
});
const unique = (values) => [...new Set(values)].sort();
const attrs = (tag) => Object.fromEntries(
  [...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)]
    .map((m) => [m[1], m[2] ?? m[3]])
);
function snapshot() {
  const result = { version: 1, hosts: {}, protectedFiles: {}, redirects: {} };
  for (const prefix of ['', 'formazione']) {
    const dist = resolve(root, prefix, 'dist');
    const files = walk(dist);
    const pages = {};
    for (const file of files.filter((path) => path.endsWith('.html'))) {
      const html = readFileSync(file, 'utf8');
      const meta = {};
      for (const match of html.matchAll(/<meta\b[^>]*>/g)) {
        const a = attrs(match[0]);
        if (a.name || a.property) meta[a.name || a.property] = a.content ?? '';
      }
      const links = [...html.matchAll(/<link\b[^>]*>/g)].map((m) => attrs(m[0]));
      pages[relative(dist, file)] = {
        title: html.match(/<title>([\s\S]*?)<\/title>/)?.[1],
        h1: html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1],
        meta,
        canonical: links.find((a) => a.rel === 'canonical')?.href,
        schemas: [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1])),
        anchors: unique([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1])),
        links: unique([...html.matchAll(/<a\b[^>]*>/g)].map((m) => attrs(m[0]).href).filter(Boolean)),
      };
    }
    result.hosts[prefix || 'www'] = {
      pages,
      sitemapUrls: unique(files.filter((f) => /sitemap[^/]*\.xml$/.test(f)).flatMap((file) =>
        [...readFileSync(file, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
      )),
    };
  }
  for (const file of ['public/_redirects', 'formazione/public/_redirects']) {
    if (existsSync(resolve(root, file))) result.redirects[file] = readFileSync(resolve(root, file), 'utf8');
  }
  for (const file of ['public/robots.txt', 'src/lib/schema.ts', 'src/lib/seo.ts',
    'formazione/public/robots.txt', 'formazione/src/lib/schema.ts',
    'formazione/src/lib/seo.ts', 'tracking.config.json']) {
    if (existsSync(resolve(root, file))) {
      result.protectedFiles[file] = createHash('sha256').update(readFileSync(resolve(root, file))).digest('hex');
    }
  }
  return result;
}
const current = snapshot();
if (mode === 'capture') {
  writeFileSync(filename, JSON.stringify(current, null, 2) + '\n');
  console.log(`Baseline salvata: ${filename}`);
} else {
  const before = JSON.parse(readFileSync(filename, 'utf8'));
  if (before.version !== current.version) throw new Error('Versione snapshot incompatibile');
  const errors = [];
  const addedPages = [];
  const addedSitemapUrls = [];
  for (const [host, data] of Object.entries(before.hosts)) {
    const after = current.hosts[host];
    for (const [path, page] of Object.entries(data.pages)) {
      const next = after?.pages[path];
      if (!next) { errors.push(`${host}/${path}: pagina rimossa`); continue; }
      for (const key of ['title', 'h1', 'meta', 'canonical', 'schemas']) {
        if (JSON.stringify(page[key]) !== JSON.stringify(next[key])) errors.push(`${host}/${path}: ${key} modificato`);
      }
      for (const key of ['anchors', 'links']) {
        for (const value of page[key]) if (!next[key].includes(value)) errors.push(`${host}/${path}: ${key} rimosso (${value})`);
      }
    }
    for (const url of data.sitemapUrls) if (!after.sitemapUrls.includes(url)) errors.push(`URL sitemap rimosso: ${url}`);
    addedPages.push(...Object.keys(after.pages).filter((p) => !data.pages[p]).map((p) => `${host}/${p}`));
    addedSitemapUrls.push(...after.sitemapUrls.filter((url) => !data.sitemapUrls.includes(url)));
  }
  for (const [file, hash] of Object.entries(before.protectedFiles)) {
    if (current.protectedFiles[file] !== hash) errors.push(`File protetto modificato: ${file}`);
  }
  for (const [file, source] of Object.entries(before.redirects)) {
    if (!current.redirects[file]?.startsWith(source)) errors.push(`Regole redirect esistenti modificate: ${file}`);
  }
  console.log(JSON.stringify({
    existingPages: Object.values(before.hosts).reduce((n, h) => n + Object.keys(h.pages).length, 0),
    addedPages, addedSitemapUrls, errors,
  }, null, 2));
  if (errors.length) process.exitCode = 1;
}
