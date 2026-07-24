export const load = async ({ locals }) => {
  const getQueue = async () => {
    const { data: orders, error } = await locals.supabase
      .from('orders')
      .select(`
        id, total_price, status, created_at,
        profiles!inner ( username ),
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
      .in('status', ['paid', 'preparing'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error fetching queue:', error);
    }

    return orders ?? [];
  };

  return {
    streamed: {
      queue: getQueue()
    }
  };
};
