import { redirect } from '@sveltejs/kit';

export const load = async ({ locals, url }) => {
  const { session, user, profile } = await locals.safeGetSession();

  return {
    session,
    user,
    profile
  };
};
