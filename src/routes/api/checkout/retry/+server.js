import { json, error } from '@sveltejs/kit';
import midtransClient from 'midtrans-client';
import { MIDTRANS_SERVER_KEY } from '$env/static/private';

export const POST = async ({ request, locals }) => {
  const { session, user } = await locals.safeGetSession();

  if (!session) {
    throw error(401, 'Unauthorized');
  }

  const { orderId } = await request.json();

  if (!orderId) {
    throw error(400, 'Missing orderId');
  }

  // Fetch the order and its details
  const { data: order, error: orderError } = await locals.supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single();

  if (orderError || !order) {
    throw error(404, 'Order not found');
  }

  if (order.status !== 'pending') {
    throw error(400, 'Order is not pending');
  }

  // If we already have a snap token saved, return it
  if (order.payment_id) {
    return json({ token: order.payment_id });
  }

  // Otherwise generate a new one
  const { data: orderDetails } = await locals.supabase
    .from('order_details')
    .select('product_id, product_name, variant, quantity, unit_price')
    .eq('order_id', orderId);

  const snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: MIDTRANS_SERVER_KEY
  });

  const item_details = (orderDetails ?? []).map(item => ({
    id: item.product_id,
    price: item.unit_price,
    quantity: item.quantity,
    name: `${item.product_name} (${item.variant})`.substring(0, 50)
  }));

  const origin = new URL(request.url).origin;
  // Midtrans max order_id length is 50. UUID is 36. We use a base36 timestamp to keep it under 50.
  const retryOrderId = `${orderId}-r${Date.now().toString(36)}`;
  
  const parameter = {
    transaction_details: {
      order_id: retryOrderId,
      gross_amount: order.total_price
    },
    item_details: item_details,
    customer_details: {
      email: session.user.email
    },
    callbacks: {
      finish: `${origin}/profile/orders/${orderId}`,
      unfinish: `${origin}/profile/orders/${orderId}`,
      error: `${origin}/profile/orders/${orderId}`
    }
  };

  try {
    const transaction = await snap.createTransaction(parameter);
    return json({ token: transaction.token });
  } catch (err) {
    console.error('Midtrans Retry Error:', err.ApiResponse || err.message);
    const msg = err.ApiResponse ? JSON.stringify(err.ApiResponse) : err.message;
    throw error(500, 'Midtrans Error: ' + msg);
  }
};
