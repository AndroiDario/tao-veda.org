import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Pagine "legacy" del sito statico: nel sitemap devono mantenere l'estensione
// .html (coerente coi canonical e con gli URL già indicizzati). Le pagine nuove
// (es. /conoscenza/*) restano con URL puliti.
const LEGACY_HTML = new Set([
  'approccio',
  'trattamento',
  'prima-del-trattamento',
  'mappa-tao-veda',
  'quattro-livelli',
  'confini',
  'principi',
  'chi-siamo',
  'contatti',
  'privacy-policy',
]);

// https://astro.build/config
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'https://www.tao-veda.org',
  trailingSlash: 'never',
  // 'file' emette /pagina.html: preserva gli URL già indicizzati del sito statico.
  build: {
    format: 'file',
  },
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes('/consenso-manualita-interne') &&
        !page.includes('/admin') &&
        !page.includes('/404'),
      serialize(item) {
        const url = new URL(item.url);
        const seg = url.pathname.replace(/^\/+|\/+$/g, '');
        if (seg && LEGACY_HTML.has(seg)) {
          item.url = `${url.origin}/${seg}.html`;
        }
        return item;
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
