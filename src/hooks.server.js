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

  event.locals.safeGetSession = async () => {
    // Call getUser() first to authenticate against the Supabase Auth server.
    // This suppresses the "insecure getSession" warning.
    const { data: { user }, error } = await event.locals.supabase.auth.getUser();
    if (error || !user) {
      return { session: null, user: null, profile: null };
    }

    const { data: { session } } = await event.locals.supabase.auth.getSession();
    if (!session) {
      return { session: null, user: null, profile: null };
    }

    // Fetch profile using service role to bypass RLS
    const supabaseAdmin = createClient(PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || (await import('$env/static/private')).SUPABASE_SERVICE_ROLE_KEY);

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return { session, user, profile };
  };

  // Route Protection Interceptors
  // Ignore auth routes and api routes from strict redirects, unless specific rules apply
  if (!event.url.pathname.startsWith('/auth') && !event.url.pathname.startsWith('/api')) {
    const { session, profile } = await event.locals.safeGetSession();
    const path = event.url.pathname;

    // Admin Area Protection
    if (path.startsWith('/admin')) {
      if (!session) throw redirect(303, '/auth/login');
      if (profile?.role !== 'admin') {
        throw redirect(303, profile?.role === 'cashier' ? '/cashier' : '/');
      }
    }

    // Cashier Area Protection
    if (path.startsWith('/cashier')) {
      if (!session) throw redirect(303, '/auth/login');
      if (profile?.role === 'admin') {
        throw redirect(303, '/admin');
      } else if (profile?.role !== 'cashier') {
        throw redirect(303, '/');
      }
    }

    // Prevent Cashiers and Admins from accessing user (root) pages
    if (session) {
      if (profile?.role === 'admin' && !path.startsWith('/admin')) {
        throw redirect(303, '/admin');
      } else if (profile?.role === 'cashier' && !path.startsWith('/cashier')) {
        throw redirect(303, '/cashier');
      }
    }
  }

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === 'content-range' || name === 'x-supabase-api-version';
    }
  });
};
