import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { SITE } from './site';

const publicDir = fileURLToPath(new URL('../../public/', import.meta.url));

/**
 * Verifica che l'OG image esista in /public; altrimenti ricade sul default.
 */
export function resolveOgImage(path?: string): string {
  if (!path) return SITE.defaultOgImage;
  if (!path.startsWith('/')) return SITE.defaultOgImage;

  const assetPath = fileURLToPath(new URL(`.${path}`, new URL(`file://${publicDir}`)));
  return existsSync(assetPath) ? path : SITE.defaultOgImage;
}

/**
 * URL canonico "pulito" a partire da un pathname.
 * Tutte le pagine usano questa funzione per il canonical di default
 * (rimuove `.html` e `index` dal pathname, build.format 'file').
 */
export function cleanPath(pathname: string): string {
  let path = pathname;
  if (path.endsWith('/index.html')) path = path.slice(0, -'index.html'.length);
  else if (path.endsWith('.html')) path = path.slice(0, -'.html'.length);
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
  return path || '/';
}
