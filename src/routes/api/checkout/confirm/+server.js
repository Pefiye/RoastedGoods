import { json, error } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
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

  const { data: order, error: orderError } = await locals.supabase
    .from('orders')
    .select('id, user_id, status, payment_id')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single();

  if (orderError || !order) {
    throw error(404, 'Order not found');
  }

  if (order.status !== 'pending') {
    return json({ status: order.status, message: 'Order already processed' });
  }

  try {
    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: MIDTRANS_SERVER_KEY
    });
    
    // We check the status directly from Midtrans to prevent client-side spoofing.
    const statusResponse = await snap.transaction.status(orderId);
    
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    let newStatus = 'pending';

    if (transactionStatus == 'capture') {
      if (fraudStatus == 'accept') {
        newStatus = 'paid';
      }
    } else if (transactionStatus == 'settlement') {
      newStatus = 'paid';
    } else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire') {
      newStatus = 'cancelled';
    }

    if (newStatus !== order.status) {
      const adminSupabase = createClient(publicEnv.PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
      
      const { error: rpcError } = await adminSupabase.rpc('update_order_status', {
        p_order_id: orderId,
        p_status: newStatus,
        p_payment_id: statusResponse.transaction_id || order.payment_id
      });

      if (rpcError) {
        console.error('Confirm RPC error:', rpcError);
        throw error(500, 'Failed to update order status');
      }
      
      return json({ status: newStatus, message: 'Order confirmed' });
    }

    return json({ status: order.status, message: 'Order status unchanged' });
  } catch (err) {
    console.error('Midtrans status check error:', err.ApiResponse || err.message);
    throw error(500, 'Failed to verify transaction status');
  }
};
