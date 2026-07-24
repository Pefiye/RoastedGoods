import { json } from '@sveltejs/kit';
import midtransClient from 'midtrans-client';
import { MIDTRANS_SERVER_KEY } from '$env/static/private';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export const POST = async ({ request }) => {
  try {
    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: MIDTRANS_SERVER_KEY
    });

    const notificationJson = await request.json();
    
    // Validate the notification using Midtrans SDK
    const statusResponse = await snap.transaction.notification(notificationJson);
    
    let orderId = statusResponse.order_id;
    // Strip retry suffix if present (e.g., -r[base36timestamp])
    const dashRIndex = orderId.lastIndexOf('-r');
    if (dashRIndex > 0 && dashRIndex > orderId.lastIndexOf('-', dashRIndex - 1)) {
      orderId = orderId.substring(0, dashRIndex);
    }
    
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;
    const paymentId = statusResponse.transaction_id;

    let newStatus = 'pending';

    if (transactionStatus == 'capture') {
      if (fraudStatus == 'accept') {
        newStatus = 'paid';
      }
    } else if (transactionStatus == 'settlement') {
      newStatus = 'paid';
    } else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire') {
      newStatus = 'cancelled';
    } else if (transactionStatus == 'pending') {
      newStatus = 'pending';
    }

    // Use RPC function (SECURITY DEFINER) to bypass RLS
    const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
    
    const { error } = await supabase.rpc('update_order_status', {
      p_order_id: orderId,
      p_status: newStatus,
      p_payment_id: paymentId
    });

    if (error) {
      console.error('Supabase RPC error:', error);
      return json({ status: 'error', message: error.message }, { status: 500 });
    }

    return json({ status: 'success' });
  } catch (error) {
    console.error('Webhook Error:', error);
    return json({ status: 'error', message: error.message }, { status: 500 });
  }
};
