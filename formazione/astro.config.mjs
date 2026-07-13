import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import sitemap from '@astrojs/sitemap';
import { readdirSync, readFileSync } from 'node:fs';

const RISERVATE = ['/accesso', '/verifica', '/profilo', '/auth', '/conclusione'];
const PRIVATE_LESSON = /^\/corsi\/[^/]+\/[^/]+\/[^/]+/;
const editorialDates = new Map();

for (const sourceConfig of [
  { directory: './src/content/corsi/', prefix: '/corsi/', stripOrder: false },
  { directory: './src/content/moduli/', prefix: '/corsi/via-tao-veda/', stripOrder: true },
]) {
  const base = new URL(sourceConfig.directory, import.meta.url);
  for (const filename of readdirSync(base).filter((name) => name.endsWith('.md'))) {
    const source = readFileSync(new URL(filename, base), 'utf8');
    const modified = source.match(/^aggiornato:\s*['"]?([^'"\n]+)['"]?$/m)?.[1]?.trim();
    if (!modified) continue;
    const slug = filename
      .replace(sourceConfig.stripOrder ? /^\d+-/ : /^$/, '')
      .replace(/\.md$/, '');
    editorialDates.set(`${sourceConfig.prefix}${slug}`, new Date(modified));
  }
}

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'https://formazione.tao-veda.org',
  trailingSlash: 'never',
  build: { format: 'file' },
  adapter: netlify(),
  integrations: [
    sitemap({
      filter: (page) => {
        const pathname = new URL(page).pathname;
        return !RISERVATE.some((path) => pathname.startsWith(path)) && !PRIVATE_LESSON.test(pathname);
      },
      serialize(item) {
        const lastmod = editorialDates.get(new URL(item.url).pathname);
        return lastmod ? { ...item, lastmod } : item;
      },
    }),
  ],
  markdown: {
    shikiConfig: { theme: 'css-variables', wrap: true },
  },
});
