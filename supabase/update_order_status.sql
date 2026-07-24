-- ============================================================
-- RPC Function: update_order_status
-- Bypasses RLS so server-side code (webhooks, status checks)
-- can update order status without a service_role key.
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_order_status(
  p_order_id UUID,
  p_status TEXT,
  p_payment_id TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.orders
  SET 
    status = p_status,
    payment_id = COALESCE(p_payment_id, payment_id)
  WHERE id = p_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
