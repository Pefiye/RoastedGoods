export const load = async ({ locals }) => {
  const { data: orders, error } = await locals.supabase
    .from('orders')
    .select(`
      id,
      total_price,
      status,
      created_at,
      payment_id,
      profiles!inner (
        username,
        email
      ),
      order_details (
        product_name,
        variant,
        quantity
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error);
  }

  return {
    orders: orders ?? []
  };
};
