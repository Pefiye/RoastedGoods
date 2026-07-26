export const load = async ({ locals, url }) => {
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '25');
  const search = url.searchParams.get('search') || '';
  const offset = (page - 1) * limit;

  const getOrders = async () => {
    let query = locals.supabase
      .from('orders')
      .select(`
        id,
        total_price,
        status,
        created_at,
        payment_id,
        profiles (
          username,
          email
        ),
        order_details (
          product_name,
          variant,
          quantity
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (search) {
      query = query.ilike('id', `%${search}%`);
    }

    const { data: orders, error, count } = await query.range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching transactions:', error);
    }
    
    return {
      orders: orders ?? [],
      count: count ?? 0
    };
  };

  return {
    streamed: {
      ordersData: getOrders()
    }
  };
};
