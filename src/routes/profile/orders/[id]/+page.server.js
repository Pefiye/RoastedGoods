import { error, redirect } from '@sveltejs/kit';
import midtransClient from 'midtrans-client';
import { MIDTRANS_SERVER_KEY } from '$env/static/private';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

const EXPIRY_MINUTES = 20;

export const load = async ({ params, locals }) => {
  const { session, user } = await locals.safeGetSession();

  if (!session) {
    throw redirect(303, '/auth/login');
  }

  const { data: order, error: orderError } = await locals.supabase
    .from('orders')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (orderError || !order) {
    throw error(404, 'Order not found');
  }
  if (order.status === 'pending') {
    const createdAt = new Date(order.created_at);
    const now = new Date();
    const minutesElapsed = (now - createdAt) / 1000 / 60;

    if (minutesElapsed >= EXPIRY_MINUTES) {
      const adminSupabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
      await adminSupabase.rpc('update_order_status', {
        p_order_id: order.id,
        p_status: 'cancelled',
        p_payment_id: null
      });
      order.status = 'cancelled';
    }
  }
  let expiresIn = null;
  if (order.status === 'pending') {
    const createdAt = new Date(order.created_at);
    const expiresAt = new Date(createdAt.getTime() + EXPIRY_MINUTES * 60 * 1000);
    expiresIn = Math.max(0, Math.floor((expiresAt - new Date()) / 1000));
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
    orderDetails: orderDetails ?? [],
    expiresIn
  };
};
