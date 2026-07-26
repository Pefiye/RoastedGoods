import { error } from '@sveltejs/kit';

export const load = ({ params, locals }) => {
  const getOrderData = async () => {
    const { data: order, error: orderError } = await locals.supabase
      .from('orders')
      .select(`
        id, total_price, status, created_at, user_id,
        profiles ( username )
      `)
      .eq('id', params.id)
      .single();

    if (orderError || !order) {
      throw error(404, 'Order not found');
    }

    const { data: orderDetails } = await locals.supabase
      .from('order_details')
      .select(`
        id,
        product_id,
        product_name,
        variant,
        quantity,
        unit_price,
        products (
          image_url
        )
      `)
      .eq('order_id', order.id)
      .order('created_at', { ascending: true });

    return {
      order,
      orderDetails: orderDetails ?? []
    };
  };

  return {
    streamed: { orderData: getOrderData() }
  };
};
