// Read-only public checks for this release. No forms, authentication or IndexNow.
// node scripts/shared-project-live-audit.mjs [--before] [report.json]
import { readFileSync, writeFileSync } from 'node:fs';
const beforeRelease = process.argv.includes('--before');
const output = process.argv.slice(2).find((arg) => !arg.startsWith('--'));
const baseline = JSON.parse(readFileSync(new URL('../docs/progetto-condiviso/verifiche/seo-prima.json', import.meta.url)));
const attrs = (tag) => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map((m) => [m[1], m[2] ?? m[3]]));
const canonical = (html) => [...html.matchAll(/<link\b[^>]*>/g)].map((m) => attrs(m[0])).find((a) => a.rel === 'canonical')?.href;
const meta = (html) => Object.fromEntries([...html.matchAll(/<meta\b[^>]*>/g)].map((m) => attrs(m[0])).filter((a) => a.name || a.property).map((a) => [a.name || a.property, a.content ?? '']));
const schemas = (html) => [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
const report = { checkedAt: new Date().toISOString(), phase: beforeRelease ? 'before' : 'after', pages: [], checks: [], errors: [] };

async function request(url, redirect = 'follow') {
  const response = await fetch(url, { redirect, signal: AbortSignal.timeout(20000) });
  return { status: response.status, url: response.url, location: response.headers.get('location'),
    robots: response.headers.get('x-robots-tag'), html: await response.text() };
}

const pages = Object.values(baseline.hosts).flatMap((host) => Object.values(host.pages))
  .filter((p) => p.canonical && !p.meta.robots?.includes('noindex'));
for (let index = 0; index < pages.length; index += 4) {
  await Promise.all(pages.slice(index, index + 4).map(async (page) => {
    try {
      const actual = await request(page.canonical);
      const problems = [];
      if (actual.status !== 200 || actual.url !== page.canonical) problems.push('status/URL finale');
      if (actual.robots?.includes('noindex')) problems.push('X-Robots-Tag noindex');
      if (canonical(actual.html) !== page.canonical) problems.push('canonical');
      if (actual.html.match(/<title>([\s\S]*?)<\/title>/)?.[1] !== page.title) problems.push('title');
      const actualMeta = meta(actual.html);
      for (const key of ['description', 'robots', 'og:title', 'og:description', 'og:image', 'og:url']) {
        if (actualMeta[key] !== page.meta[key]) problems.push(key);
      }
      if (JSON.stringify(schemas(actual.html)) !== JSON.stringify(page.schemas)) problems.push('JSON-LD');
      report.pages.push({ url: page.canonical, status: actual.status, problems });
      report.errors.push(...problems.map((p) => `${page.canonical}: ${p}`));
    } catch (error) { report.errors.push(`${page.canonical}: ${error.message}`); }
  }));
}

async function check(label, action) {
  try { await action(); report.checks.push({ label, ok: true }); }
  catch (error) { report.checks.push({ label, ok: false }); report.errors.push(`${label}: ${error.message}`); }
}
const assert = (condition, reason) => { if (!condition) throw new Error(reason); };
for (const origin of ['https://www.tao-veda.org', 'https://formazione.tao-veda.org']) {
  await check(`${origin}/robots.txt`, async () => {
    const r = await request(`${origin}/robots.txt`);
    assert(r.status === 200, `HTTP ${r.status}`);
    const local = origin.includes('formazione.') ? '../formazione/public/robots.txt' : '../public/robots.txt';
    assert(r.html.trim() === readFileSync(new URL(local, import.meta.url), 'utf8').trim(), 'robots differente');
  });
  await check(`${origin}/sitemap-0.xml`, async () => {
    const r = await request(`${origin}/sitemap-0.xml`);
    assert(r.status === 200, `HTTP ${r.status}`);
    const urls = [...r.html.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    const old = baseline.hosts[origin.includes('formazione.') ? 'formazione' : 'www'].sitemapUrls.filter((u) => !u.endsWith('.xml'));
    for (const url of old) assert(urls.includes(url), `URL mancante ${url}`);
    if (!beforeRelease && origin === 'https://www.tao-veda.org') assert(urls.includes(`${origin}/partecipare`), '/partecipare assente');
  });
}
for (const [from, to] of [
  ['https://tao-veda.org/chi-siamo', 'https://www.tao-veda.org/chi-siamo'],
  ['https://www.tao-veda.org/chi-siamo.html', 'https://www.tao-veda.org/chi-siamo'],
  ...(!beforeRelease ? [['https://www.tao-veda.org/partecipare.html', 'https://www.tao-veda.org/partecipare']] : []),
]) {
  await check(`Redirect ${from}`, async () => {
    const r = await request(from, 'manual');
    assert(r.status === 301, `HTTP ${r.status}`);
    assert(new URL(r.location, from).href === to, `Location ${r.location}`);
  });
}
if (!beforeRelease) {
  await check('Nuova pagina e stato esplorativo', async () => {
    const r = await request('https://www.tao-veda.org/partecipare');
    assert(r.status === 200, `HTTP ${r.status}`);
    assert(canonical(r.html) === 'https://www.tao-veda.org/partecipare', 'canonical errato');
    assert(r.html.includes('Progetto condiviso in esplorazione') && r.html.includes('non è ancora') && r.html.includes('costituita'), 'stato non confermato');
    assert(r.html.includes('id="carta-di-affinita"'), 'carta mancante');
    assert(!r.html.includes('<form'), 'form inatteso');
    assert(!meta(r.html).robots?.includes('noindex') && !r.robots?.includes('noindex'), 'pagina non indicizzabile');
    const image = meta(r.html)['og:image'];
    assert(image && (await request(image)).status === 200, 'immagine sociale non disponibile');
  });
  for (const path of ['/', '/chi-siamo', '/approccio', '/contatti']) {
    await check(`Invito ${path}`, async () => {
      const r = await request(`https://www.tao-veda.org${path}`);
      assert(r.status === 200 && r.html.includes('href="/partecipare"'), 'collegamento mancante');
    });
  }
}
report.pages.sort((a, b) => a.url.localeCompare(b.url));
if (output) writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ phase: report.phase, existingPages: report.pages.length, checks: report.checks, errors: report.errors }, null, 2));
if (report.errors.length) process.exitCode = 1;
