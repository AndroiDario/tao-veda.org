import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import sitemap from '@astrojs/sitemap';
import { readdirSync, readFileSync } from 'node:fs';

const RISERVATE = ['/accesso', '/registrazione', '/verifica', '/profilo', '/auth', '/iscrizione', '/conclusione'];
const PRIVATE_LESSON = /^\/corsi\/[^/]+\/[^/]+\/[^/]+/;
const PRIVATE_CONCLUSION = /^\/corsi\/[^/]+\/conclusione/;
const SITE_URL = process.env.PUBLIC_SITE_URL || 'https://formazione.tao-veda.org';
const editorialDates = new Map();

// Le lezioni in anteprima libera (frontmatter `pubblico: true`) sono rese in SSR,
// quindi la sitemap le riceve come customPages lette direttamente dai file.
const publicLessonPaths = [];
{
  const base = new URL('./src/content/lezioni/', import.meta.url);
  for (const filename of readdirSync(base).filter((name) => name.endsWith('.md'))) {
    const source = readFileSync(new URL(filename, base), 'utf8');
    if (!/^pubblico:\s*true$/m.test(source)) continue;
    if (/^draft:\s*true$/m.test(source)) continue;
    const courseId = source.match(/^corso:\s*['"]?([^'"\n]+)['"]?$/m)?.[1]?.trim();
    const moduleId = source.match(/^modulo:\s*['"]?([^'"\n]+)['"]?$/m)?.[1]?.trim();
    const slug = source.match(/^slug:\s*['"]?([^'"\n]+)['"]?$/m)?.[1]?.trim() ?? filename.replace(/^\d+-/, '').replace(/\.md$/, '');
    if (courseId && moduleId) publicLessonPaths.push(`/corsi/${courseId}/${moduleId}/${slug}`);
  }
}

for (const directory of ['./src/content/corsi/', './src/content/moduli/']) {
  const base = new URL(directory, import.meta.url);
  for (const filename of readdirSync(base).filter((name) => name.endsWith('.md'))) {
    const source = readFileSync(new URL(filename, base), 'utf8');
    const modified = source.match(/^aggiornato:\s*['"]?([^'"\n]+)['"]?$/m)?.[1]?.trim();
    if (!modified) continue;
    if (directory.includes('/corsi/')) {
      const id = source.match(/^id:\s*['"]?([^'"\n]+)['"]?$/m)?.[1]?.trim() ?? filename.replace(/\.md$/, '');
      editorialDates.set(`/corsi/${id}`, new Date(modified));
    } else {
      const courseId = source.match(/^corso:\s*['"]?([^'"\n]+)['"]?$/m)?.[1]?.trim();
      const slug = source.match(/^slug:\s*['"]?([^'"\n]+)['"]?$/m)?.[1]?.trim() ?? filename.replace(/^\d+-/, '').replace(/\.md$/, '');
      if (courseId) editorialDates.set(`/corsi/${courseId}/${slug}`, new Date(modified));
    }
  }
}

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'https://formazione.tao-veda.org',
  trailingSlash: 'never',
  build: { format: 'file' },
  adapter: netlify(),
  integrations: [
    sitemap({
      customPages: publicLessonPaths.map((path) => `${SITE_URL}${path}`),
      filter: (page) => {
        const pathname = new URL(page).pathname;
        if (publicLessonPaths.includes(pathname)) return true;
        return !RISERVATE.some((path) => pathname.startsWith(path)) && !PRIVATE_LESSON.test(pathname) && !PRIVATE_CONCLUSION.test(pathname);
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
