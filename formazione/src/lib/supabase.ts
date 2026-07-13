import type { AstroCookies } from 'astro';
import { createServerClient, parseCookieHeader } from '@supabase/ssr';

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined;

export const hasSupabaseConfig = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

interface RequestContext {
  request: Request;
  cookies: AstroCookies;
}

export function createSupabaseServerClient({ request, cookies }: RequestContext) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Variabili PUBLIC_SUPABASE_URL e PUBLIC_SUPABASE_ANON_KEY assenti.');
  }
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return parseCookieHeader(request.headers.get('Cookie') ?? '').map(({ name, value }) => ({
          name,
          value: value ?? '',
        }));
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => cookies.set(name, value, options));
      },
    },
  });
}

/** Percorso interno sicuro per i redirect post-accesso. */
export function safeRedirectPath(value: string | null | undefined, fallback = '/profilo') {
  if (value && value.startsWith('/') && !value.startsWith('//')) return value;
  return fallback;
}
