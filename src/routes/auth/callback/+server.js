import { redirect } from '@sveltejs/kit';

export const GET = async ({ url, locals }) => {
  const code = url.searchParams.get('code');

  if (code) {
    const { data } = await locals.supabase.auth.exchangeCodeForSession(code);

    if (data.user) {
      const { data: profile } = await locals.supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profile?.role === 'cashier' || profile?.role === 'admin') {
        throw redirect(303, '/cashier');
      }
    }
  }

  throw redirect(303, '/menu');
};
