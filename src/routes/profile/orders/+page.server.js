import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
  const { session, user } = await locals.safeGetSession();

  if (!session) {
    throw redirect(303, '/auth/login');
  }

  const getOrders = async () => {
    const { data: orders, error } = await locals.supabase
      .from('orders')
      .select(`
        id, total_price, status, created_at,
        order_details (
          id,
          product_name,
          variant,
          quantity,
          unit_price,
          products (
            image_url
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    return orders ?? [];
  };

  return {
    streamed: {
      orders: getOrders()
    }
  };
};
