import { defineMiddleware } from 'astro:middleware';
import type { APIContext } from 'astro';
import { createSupabaseServerClient, hasSupabaseConfig } from '@lib/supabase';

const LESSON_PATH = /^\/corsi\/([^/]+)\/[^/]+\/[^/]+$/;
const CONCLUSION_PATH = /^\/corsi\/([^/]+)\/conclusione$/;
const ENROLLMENT_PATH = /^\/iscrizione\/[^/]+$/;
const LOGIN_ONLY = new Set(['/profilo']);

function privateRedirect(context: APIContext, location: string) {
  return privateResponse(context.redirect(location, 302));
}

function privateResponse(response: Response) {
  const headers = new Headers(response.headers);
  headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  headers.set('Cache-Control', 'private, no-store');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function gatedCourseId(pathname: string): string | null {
  const lesson = pathname.match(LESSON_PATH);
  if (lesson) return lesson[1];
  const conclusion = pathname.match(CONCLUSION_PATH);
  if (conclusion) return conclusion[1];
  return null;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const courseId = gatedCourseId(pathname);
  const loginOnly = LOGIN_ONLY.has(pathname) || ENROLLMENT_PATH.test(pathname);
  if (!courseId && !loginOnly) return next();

  if (!hasSupabaseConfig) {
    return privateRedirect(context, `/accesso?redirect=${encodeURIComponent(pathname)}`);
  }

  const supabase = createSupabaseServerClient(context);
  let user = null;
  try {
    ({ data: { user } } = await supabase.auth.getUser());
  } catch {
    user = null;
  }
  if (!user) {
    return privateRedirect(context, `/accesso?redirect=${encodeURIComponent(pathname)}`);
  }
  context.locals.user = user;

  if (courseId) {
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('status')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .maybeSingle();
    const status = enrollment?.status;
    if (status !== 'active' && status !== 'completed') {
      return privateRedirect(context, '/profilo');
    }
  }

  return privateResponse(await next());
});
