import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, relative, resolve } from 'node:path';

const cwd = process.cwd();
const dist = resolve(cwd, 'dist');
const isTraining = basename(cwd) === 'formazione';
const expectedOrigin = isTraining
  ? 'https://formazione.tao-veda.org'
  : 'https://www.tao-veda.org';
const errors = [];

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function routeForFile(file) {
  let route = `/${relative(dist, file).replaceAll('\\', '/')}`
    .replace(/\/index\.html$/, '/')
    .replace(/\.html$/, '');
  if (route.length > 1 && route.endsWith('/')) route = route.slice(0, -1);
  return route || '/';
}

function capture(source, pattern) {
  return source.match(pattern)?.[1] ?? '';
}

const htmlFiles = walk(dist).filter((file) => file.endsWith('.html'));
const routes = new Set(htmlFiles.map(routeForFile));

for (const file of htmlFiles) {
  const route = routeForFile(file);
  if (route === '/admin') continue;
  const source = readFileSync(file, 'utf8');
  const canonical = capture(source, /<link rel="canonical" href="([^"]+)"/);
  const ogImage = capture(source, /<meta property="og:image" content="([^"]+)"/);
  const h1Count = [...source.matchAll(/<h1\b/g)].length;

  if (!capture(source, /<title>(.*?)<\/title>/s)) errors.push(`${route}: title mancante`);
  if (!capture(source, /<meta name="description" content="([^"]+)"/)) errors.push(`${route}: description mancante`);
  if (h1Count !== 1) errors.push(`${route}: trovati ${h1Count} H1`);
  if (!canonical.startsWith(expectedOrigin)) errors.push(`${route}: canonical non valido (${canonical})`);
  if (!ogImage) errors.push(`${route}: og:image mancante`);
  if (ogImage.startsWith(expectedOrigin)) {
    const imageUrl = new URL(ogImage);
    const ogAsset = resolve(dist, imageUrl.pathname.slice(1));
    if (!existsSync(ogAsset)) errors.push(`${route}: og:image locale mancante ${imageUrl.pathname}`);
  }

  for (const match of source.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(match[1]);
    } catch (error) {
      errors.push(`${route}: JSON-LD non parsabile (${error.message})`);
    }
  }

  for (const match of source.matchAll(/<img[^>]+src="([^"]+)"/g)) {
    const src = match[1];
    if (!src.startsWith('/') || src.startsWith('//')) continue;
    const asset = resolve(dist, src.slice(1));
    if (!existsSync(asset)) errors.push(`${route}: immagine locale mancante ${src}`);
  }

  for (const match of source.matchAll(/<(?:img|source)[^>]+srcset="([^"]+)"/g)) {
    for (const candidate of match[1].split(',').map((item) => item.trim().split(/\s+/)[0])) {
      if (!candidate.startsWith('/') || candidate.startsWith('//')) continue;
      const asset = resolve(dist, candidate.slice(1));
      if (!existsSync(asset)) errors.push(`${route}: variante immagine locale mancante ${candidate}`);
    }
  }

  for (const match of source.matchAll(/<a[^>]+href="([^"]+)"/g)) {
    const href = match[1];
    if (href.startsWith('#') || /^(mailto:|tel:|https?:\/\/)/.test(href)) continue;
    if (!href.startsWith('/')) continue;
    const target = href.split(/[?#]/)[0].replace(/\.html$/, '') || '/';
    const dynamicTrainingRoute = isTraining && (
      /^\/(accesso|verifica|profilo|conclusione)/.test(target) ||
      /^\/corsi\/[^/]+\/[^/]+\/[^/]+/.test(target)
    );
    const nonPageResource = /^\/(assets|fonts|_astro|api|\.netlify)\//.test(target) ||
      /^\/(rss\.xml|site\.webmanifest)$/.test(target);
    if (!routes.has(target) && !dynamicTrainingRoute && !nonPageResource) {
      errors.push(`${route}: link interno senza destinazione ${href}`);
    }
  }
}

const sitemapPath = resolve(dist, 'sitemap-0.xml');
if (!existsSync(sitemapPath)) {
  errors.push('sitemap-0.xml mancante');
} else {
  const sitemap = readFileSync(sitemapPath, 'utf8');
  const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  for (const url of sitemapUrls) {
    const parsed = new URL(url);
    const route = parsed.pathname || '/';
    if (parsed.origin !== expectedOrigin) errors.push(`sitemap: origine errata ${url}`);
    if (!routes.has(route)) errors.push(`sitemap: nessuna pagina statica per ${route}`);
    if (/\/conoscenza\/tag\//.test(route)) errors.push(`sitemap: pagina tag presente ${route}`);
    if (/^\/(accesso|verifica|profilo|auth|conclusione)/.test(route)) errors.push(`sitemap: pagina privata presente ${route}`);
    if (/^\/corsi\/[^/]+\/[^/]+\/[^/]+/.test(route)) errors.push(`sitemap: lezione privata presente ${route}`);

    const file = route === '/'
      ? resolve(dist, 'index.html')
      : resolve(dist, `${route.slice(1)}.html`);
    if (!existsSync(file)) continue;
    const html = readFileSync(file, 'utf8');
    const canonical = capture(html, /<link rel="canonical" href="([^"]+)"/);
    if (canonical !== url && !(route === '/' && canonical === `${expectedOrigin}/`)) {
      errors.push(`sitemap: canonical ${canonical} non coincide con ${url}`);
    }
    if (/<meta name="robots" content="[^"]*noindex/.test(html)) {
      errors.push(`sitemap: pagina noindex presente ${route}`);
    }
  }
}

if (errors.length) {
  console.error(`Audit SEO fallito (${errors.length} problemi):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}

console.log(`Audit SEO completato: ${htmlFiles.length} pagine controllate.`);
