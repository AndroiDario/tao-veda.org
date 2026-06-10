import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

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
        !page.includes('/404'),
    }),
  ],
  markdown: {
    shikiConfig: {
      theme: 'css-variables',
      wrap: true,
    },
  },
});
