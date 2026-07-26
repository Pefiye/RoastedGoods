import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
  const { session, user, profile } = await locals.safeGetSession();

  return {
    session,
    user,
    profile
  };
};
