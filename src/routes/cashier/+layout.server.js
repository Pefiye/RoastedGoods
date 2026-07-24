import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
  const { session, user } = await locals.safeGetSession();

  if (!session) {
    throw redirect(303, '/auth/login');
  }

  let profile = null;
  if (user) {
    const { data } = await locals.supabase
      .from('profiles')
      .select('id, username, email, role')
      .eq('id', user.id)
      .single();
    profile = data;
  }

  // Route protection is now handled by src/hooks.server.js

  return {
    session,
    user,
    profile
  };
};
