import { json, error } from '@sveltejs/kit';
import midtransClient from 'midtrans-client';
import { MIDTRANS_SERVER_KEY } from '$env/static/private';

export const POST = async ({ request, locals }) => {
  const { session, user } = await locals.safeGetSession();

  if (!session) {
    throw error(401, 'Unauthorized');
  }

  const body = await request.json();
  const { checkoutItems, totalPrice, cartId } = body;

  if (!checkoutItems || checkoutItems.length === 0) {
    throw error(400, 'Cart is empty');
  }

  const orderId = crypto.randomUUID();

  // 1. Prepare Midtrans Item Details
  const item_details = checkoutItems.map(item => ({
    id: item.product_id,
    price: item.unit_price,
    quantity: item.quantity,
    name: `${item.name} (${item.variant})`.substring(0, 50) // Midtrans max length is 50
  }));

  // 2. Initialize Midtrans Snap
  const snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: MIDTRANS_SERVER_KEY
  });

  // 3. Request Snap Token
  const origin = new URL(request.url).origin;
  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: totalPrice
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

    // 4. Create order in Supabase WITH the token already attached
    const { data: order, error: orderError } = await locals.supabase
      .from('orders')
      .insert({
        id: orderId,
        user_id: user.id,
        total_price: totalPrice,
        status: 'pending',
        payment_id: transaction.token
      })
      .select('id')
      .single();

    if (orderError) throw error(500, orderError.message);

    // 5. Create order details in Supabase
    const orderDetails = checkoutItems.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.name,
      variant: item.variant,
      quantity: item.quantity,
      unit_price: item.unit_price
    }));

    const { error: detailError } = await locals.supabase
      .from('order_details')
      .insert(orderDetails);

    if (detailError) throw error(500, detailError.message);

    // 6. Clear the user's cart on successful transaction creation
    if (cartId) {
      await locals.supabase
        .from('cart_details')
        .delete()
        .eq('cart_id', cartId);
    }
    
    return json({
      token: transaction.token,
      orderId: order.id
    });
  } catch (err) {
    console.error('Midtrans Error:', err);
    throw error(500, 'Failed to create Midtrans transaction');
  }
};
