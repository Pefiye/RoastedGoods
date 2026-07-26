export const load = ({ locals, url }) => {
  const sort = url.searchParams.get('sort') || 'name-asc';

  const getProducts = async () => {
    const { supabase } = locals;
    const { data: products } = await supabase.from('products').select('*').eq('is_active', true);
    let productsData = products || [];

    if (sort === 'popular' || sort === 'least-popular') {
      const { data: orderDetails } = await supabase
        .from('order_details')
        .select('product_id, quantity, orders!inner(status)')
        .in('orders.status', ['paid', 'preparing', 'done']);
      const counts = {};
      if (orderDetails) {
        for (const d of orderDetails) {
          counts[d.product_id] = (counts[d.product_id] || 0) + d.quantity;
        }
      }

      productsData.forEach(p => p.sold = counts[p.id] || 0);
      productsData.sort((a, b) => sort === 'popular' ? b.sold - a.sold : a.sold - b.sold);
    } else {
      productsData.sort((a, b) => {
        if (sort === 'name-asc') return a.name.localeCompare(b.name);
        if (sort === 'name-desc') return b.name.localeCompare(a.name);
        return 0;
      });
    }

    return productsData;
  };

  return { 
    streamed: { products: getProducts() },
    sort
  };
};
