export const load = async ({ locals }) => {
  const { supabase } = locals;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: orders } = await supabase
    .from('orders')
    .select('total_price, created_at, status')
    .in('status', ['paid', 'preparing', 'done'])
    .gte('created_at', today.toISOString());

  const todaySales = orders?.reduce((sum, order) => sum + order.total_price, 0) || 0;
  const todayOrders = orders?.length || 0;
  const { data: activeOrders } = await supabase
    .from('orders')
    .select('*, profiles(username)')
    .in('status', ['paid', 'preparing'])
    .order('created_at', { ascending: true })
    .limit(5);
  const { data: orderDetails } = await supabase
    .from('order_details')
    .select('product_name, quantity, products(image_url), orders!inner(status)')
    .in('orders.status', ['paid', 'preparing', 'done']);
  const drinkCounts = {};
  if (orderDetails) {
    for (const detail of orderDetails) {
      if (!drinkCounts[detail.product_name]) {
        drinkCounts[detail.product_name] = { count: 0, image_url: detail.products?.image_url };
      }
      drinkCounts[detail.product_name].count += detail.quantity;
    }
  }

  const popularDrinks = Object.entries(drinkCounts)
    .map(([name, data]) => ({ name, count: data.count, image_url: data.image_url }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    todaySales,
    todayOrders,
    activeOrders: activeOrders || [],
    popularDrinks
  };
};
