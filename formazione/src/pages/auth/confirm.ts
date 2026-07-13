import type { APIRoute } from 'astro';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createSupabaseServerClient, hasSupabaseConfig, safeRedirectPath } from '@lib/supabase';

export const prerender = false;

export const GET: APIRoute = async (context) => {
  const params = context.url.searchParams;
  const tokenHash = params.get('token_hash');
  const type = (params.get('type') || 'email') as EmailOtpType;
  const redirect = safeRedirectPath(params.get('redirect'));

  if (!hasSupabaseConfig || !tokenHash) {
    return context.redirect('/accesso?errore=scaduto', 302);
  }

  const supabase = createSupabaseServerClient(context);
  const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
  if (error) {
    return context.redirect(`/accesso?errore=scaduto&redirect=${encodeURIComponent(redirect)}`, 302);
  }
  const separator = redirect.includes('?') ? '&' : '?';
  return context.redirect(`${redirect}${separator}registration=complete`, 302);
};
