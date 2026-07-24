-- Run this in your Supabase SQL Editor to grant Cashiers access to view orders.
-- Make sure you have created the get_auth_role() function from fix_rls_recursion.sql first.

CREATE POLICY "Cashiers can view all orders"
  ON public.orders FOR SELECT
  USING ( public.get_auth_role() IN ('cashier', 'admin') );

CREATE POLICY "Cashiers can view all order details"
  ON public.order_details FOR SELECT
  USING ( public.get_auth_role() IN ('cashier', 'admin') );
