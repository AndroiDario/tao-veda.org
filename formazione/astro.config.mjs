import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import sitemap from '@astrojs/sitemap';

const RISERVATE = ['/accesso', '/verifica', '/profilo', '/auth', '/conclusione'];

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'https://formazione.tao-veda.org',
  trailingSlash: 'never',
  build: { format: 'file' },
  adapter: netlify(),
  integrations: [
    sitemap({
      filter: (page) => !RISERVATE.some((path) => new URL(page).pathname.startsWith(path)),
    }),
  ],
  markdown: {
    shikiConfig: { theme: 'css-variables', wrap: true },
  },
});
