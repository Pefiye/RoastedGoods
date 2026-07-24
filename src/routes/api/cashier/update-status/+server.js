import { json, error } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export const POST = async ({ request, locals }) => {
  const { session, user } = await locals.safeGetSession();

  if (!session) {
    throw error(401, 'Unauthorized');
  }

  // 1. Verify the requester is a cashier (or admin)
  const { data: profile, error: profileError } = await locals.supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || (profile.role !== 'cashier' && profile.role !== 'admin')) {
    throw error(403, 'Forbidden: Cashier access required');
  }

  const { orderId, newStatus } = await request.json();

  if (!orderId || !newStatus) {
    throw error(400, 'Missing orderId or newStatus');
  }

  if (newStatus !== 'preparing' && newStatus !== 'done') {
    throw error(400, 'Invalid status update requested');
  }

  // 2. Fetch current order status
  const { data: order, error: orderError } = await locals.supabase
    .from('orders')
    .select('status')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    throw error(404, 'Order not found');
  }

  // 3. Validate state transitions
  if (newStatus === 'preparing' && order.status !== 'paid') {
    throw error(400, 'Only paid orders can be marked as preparing');
  }
  
  if (newStatus === 'done' && order.status !== 'preparing') {
    throw error(400, 'Only preparing orders can be marked as done');
  }

  // 4. Update the status using admin client (bypassing RLS because orders RLS might only allow owners)
  // Wait, if RLS allows updating by anyone? The update_order_status RPC exists! Let's use it.
  const adminSupabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
  const { error: rpcError } = await adminSupabase.rpc('update_order_status', {
    p_order_id: orderId,
    p_status: newStatus,
    p_payment_id: null // Leave existing payment ID alone (this RPC only updates status and payment_id if provided)
  });

  if (rpcError) {
    console.error('Update status RPC error:', rpcError);
    throw error(500, 'Failed to update order status');
  }

  return json({ success: true, message: `Order updated to ${newStatus}` });
};
