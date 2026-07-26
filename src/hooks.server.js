import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { redirect } from '@sveltejs/kit';

export const handle = async ({ event, resolve }) => {
  event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => event.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => {
          event.cookies.set(name, value, { ...options, path: '/' });
        });
      }
    }
  });

  let safeGetSessionResult = null;
  event.locals.safeGetSession = async () => {
    if (safeGetSessionResult !== null) return safeGetSessionResult;

    const { data: { session: fastSession } } = await event.locals.supabase.auth.getSession();
    if (!fastSession) {
      safeGetSessionResult = { session: null, user: null, profile: null };
      return safeGetSessionResult;
    }

    const { data: { user }, error } = await event.locals.supabase.auth.getUser();
    if (error || !user) {
      safeGetSessionResult = { session: null, user: null, profile: null };
      return safeGetSessionResult;
    }

    const { data: { session } } = await event.locals.supabase.auth.getSession();
    if (!session) {
      safeGetSessionResult = { session: null, user: null, profile: null };
      return safeGetSessionResult;
    }
    const supabaseAdmin = createClient(PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || (await import('$env/static/private')).SUPABASE_SERVICE_ROLE_KEY);

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    safeGetSessionResult = { session, user, profile };
    return safeGetSessionResult;
  };
  const path = event.url.pathname;
  if (!path.startsWith('/auth') && !path.startsWith('/api')) {
    const isProtected = path.startsWith('/admin') || path.startsWith('/cashier') || path.startsWith('/checkout') || path.startsWith('/profile');
    
    if (isProtected) {
      const { session, profile } = await event.locals.safeGetSession();
      
      if (path.startsWith('/admin')) {
        if (!session) throw redirect(303, '/auth/login');
        if (profile?.role !== 'admin') throw redirect(303, profile?.role === 'cashier' ? '/cashier' : '/');
      }
      else if (path.startsWith('/cashier')) {
        if (!session) throw redirect(303, '/auth/login');
        if (profile?.role === 'admin') throw redirect(303, '/admin');
        else if (profile?.role !== 'cashier') throw redirect(303, '/');
      }
      else if (!session) {
        throw redirect(303, '/auth/login');
      }
    }
  }

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === 'content-range' || name === 'x-supabase-api-version';
    }
  });
};
