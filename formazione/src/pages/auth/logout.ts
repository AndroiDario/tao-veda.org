import type { APIRoute } from 'astro';
import { createSupabaseServerClient, hasSupabaseConfig } from '@lib/supabase';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  if (hasSupabaseConfig) {
    const supabase = createSupabaseServerClient(context);
    await supabase.auth.signOut();
  }
  return context.redirect('/', 302);
};
