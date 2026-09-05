import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readdirSync, readFileSync } from 'node:fs';

const editorialDates = new Map();
const diarioDir = new URL('./src/content/diario/', import.meta.url);
const tradizioniDir = new URL('./src/content/tradizioni/', import.meta.url);

for (const filename of readdirSync(diarioDir).filter((name) => name.endsWith('.md'))) {
  const source = readFileSync(new URL(filename, diarioDir), 'utf8');
  const published = source.match(/^data:\s*['"]?([^'"\n]+)['"]?$/m)?.[1]?.trim();
  const modified = source.match(/^aggiornato:\s*['"]?([^'"\n]+)['"]?$/m)?.[1]?.trim();
  const value = modified || published;
  if (value) {
    editorialDates.set(`/conoscenza/diario/${filename.replace(/\.md$/, '')}`, new Date(value));
  }
}

for (const filename of readdirSync(tradizioniDir).filter((name) => name.endsWith('.md'))) {
  const source = readFileSync(new URL(filename, tradizioniDir), 'utf8');
  const modified = source.match(/^aggiornato:\s*['"]?([^'"\n]+)['"]?$/m)?.[1]?.trim();
  if (modified) {
    editorialDates.set(`/conoscenza/tradizioni/${filename.replace(/\.md$/, '')}`, new Date(modified));
  }
}

// Le pagine istituzionali dichiarano la propria revisione, senza una data
// globale o il timestamp della build. Le rotte dinamiche usano le collection.
function collectPageReviews(directory, prefix = '') {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name.includes('[')) continue;
    const file = new URL(entry.name + (entry.isDirectory() ? '/' : ''), directory);
    if (entry.isDirectory()) collectPageReviews(file, `${prefix}/${entry.name}`);
    else if (entry.name.endsWith('.astro')) {
      const date = readFileSync(file, 'utf8').match(/<EditorialMeta\s+updated="(\d{4}-\d{2}-\d{2})"/)?.[1];
      const route = `${prefix}/${entry.name.replace(/\.astro$/, '')}`.replace(/\/index$/, '') || '/';
      if (date) editorialDates.set(route, new Date(date));
    }
  }
}
collectPageReviews(new URL('./src/pages/', import.meta.url));

// https://astro.build/config
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'https://www.tao-veda.org',
  trailingSlash: 'never',
  // 'file' emette /pagina.html come artefatto di build; gli URL pubblici sono
  // puliti (Netlify serve le pagine senza estensione e i vecchi .html fanno 301,
  // vedi public/_redirects — migrazione URL puliti 2026-06).
  build: {
    format: 'file',
  },
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes('/consenso-manualita-interne') &&
        !page.includes('/admin') &&
        !page.includes('/conoscenza/tag/') &&
        !page.includes('/404'),
      serialize(item) {
        const lastmod = editorialDates.get(new URL(item.url).pathname);
        return lastmod ? { ...item, lastmod } : item;
      },
    }),
  ],
  markdown: {
    shikiConfig: {
      theme: 'css-variables',
      wrap: true,
    },
  },
});
