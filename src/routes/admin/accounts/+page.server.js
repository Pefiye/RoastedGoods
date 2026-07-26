import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import { fail } from '@sveltejs/kit';

export const load = ({ locals }) => {
  const getAccounts = async () => {
    const { supabase } = locals;

    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    return profiles || [];
  };

  return { streamed: { profiles: getAccounts() } };
};

export const actions = {
  create: async ({ request, locals }) => {
    const { session, profile } = await locals.safeGetSession();
    if (!session || profile?.role !== 'admin') return fail(403, { error: 'Forbidden' });
    const supabaseAdmin = createClient(
      publicEnv.PUBLIC_SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY
    );

    const data = await request.formData();
    const email = data.get('email');
    const password = data.get('password');
    const username = data.get('username');
    const role = data.get('role');

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username, role }
    });

    if (authError) return fail(400, { error: authError.message });

    return { success: true };
  },

  updateRole: async ({ request, locals }) => {
    const { session, profile } = await locals.safeGetSession();
    if (!session || profile?.role !== 'admin') return fail(403, { error: 'Forbidden' });

    const supabaseAdmin = createClient(
      publicEnv.PUBLIC_SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY
    );

    const data = await request.formData();
    const id = data.get('id');
    const role = data.get('role');

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ role })
      .eq('id', id);

    if (error) return fail(400, { error: error.message });
    return { success: true };
  },

  delete: async ({ request, locals }) => {
    const { session, profile } = await locals.safeGetSession();
    if (!session || profile?.role !== 'admin') return fail(403, { error: 'Forbidden' });

    const supabaseAdmin = createClient(
      publicEnv.PUBLIC_SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY
    );

    const data = await request.formData();
    const id = data.get('id');

    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (error) return fail(400, { error: error.message });
    return { success: true };
  }
};
