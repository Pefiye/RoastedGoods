import { json, error } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export const POST = async ({ request, locals }) => {
  const { session, user } = await locals.safeGetSession();

  if (!session) {
    throw error(401, 'Unauthorized');
  }

  const { orderId } = await request.json();

  if (!orderId) {
    throw error(400, 'Missing orderId');
  }
  const { data: order, error: orderError } = await locals.supabase
    .from('orders')
    .select('id, user_id, status')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single();

  if (orderError || !order) {
    throw error(404, 'Order not found');
  }

  if (order.status !== 'pending') {
    return json({ status: order.status, message: 'Order already processed' });
  }
  const adminSupabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
  const { error: rpcError } = await adminSupabase.rpc('update_order_status', {
    p_order_id: orderId,
    p_status: 'paid',
    p_payment_id: null
  });

  if (rpcError) {
    console.error('Confirm RPC error:', rpcError);
    throw error(500, 'Failed to update order status');
  }

  return json({ status: 'paid', message: 'Order confirmed' });
};
