import { defineMiddleware } from 'astro:middleware';
import { createSupabaseServerClient, hasSupabaseConfig } from '@lib/supabase';
import { SITE } from '@lib/site';

const LESSON_PATH = /^\/corsi\/([^/]+)\/[^/]+\/[^/]+$/;
const LOGIN_ONLY = new Set(['/profilo']);

function gatedCourseId(pathname: string): string | null {
  const lesson = pathname.match(LESSON_PATH);
  if (lesson) return lesson[1];
  if (pathname === '/conclusione') return SITE.courseId;
  return null;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const courseId = gatedCourseId(pathname);
  const loginOnly = LOGIN_ONLY.has(pathname);
  if (!courseId && !loginOnly) return next();

  if (!hasSupabaseConfig) {
    return context.redirect(`/accesso?redirect=${encodeURIComponent(pathname)}`, 302);
  }

  const supabase = createSupabaseServerClient(context);
  let user = null;
  try {
    ({ data: { user } } = await supabase.auth.getUser());
  } catch {
    user = null;
  }
  if (!user) {
    return context.redirect(`/accesso?redirect=${encodeURIComponent(pathname)}`, 302);
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
      return context.redirect('/profilo', 302);
    }
  }

  return next();
});
