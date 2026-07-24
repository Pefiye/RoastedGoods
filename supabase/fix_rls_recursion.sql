-- Fix Infinite Recursion in RLS Policies
-- Run this in your Supabase SQL Editor

-- 1. Create a security definer function to get the role of the current user.
-- This runs as the database owner (postgres) and bypasses RLS, breaking the recursion loop.
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS text
LANGUAGE sql SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- 2. Drop the problematic policies that select from profiles directly
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;

DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;

DROP POLICY IF EXISTS "Cashiers can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Cashiers can view all order details" ON public.order_details;

-- 3. Recreate policies using the new get_auth_role() function

-- Profiles table (Admins)
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING ( public.get_auth_role() = 'admin' );

CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK ( public.get_auth_role() = 'admin' );

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING ( public.get_auth_role() = 'admin' );

CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  USING ( public.get_auth_role() = 'admin' );

-- Products table (Admins)
CREATE POLICY "Admins can insert products"
  ON public.products FOR INSERT
  WITH CHECK ( public.get_auth_role() = 'admin' );

CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE
  USING ( public.get_auth_role() = 'admin' );

CREATE POLICY "Admins can delete products"
  ON public.products FOR DELETE
  USING ( public.get_auth_role() = 'admin' );

-- Orders / Order Details (Cashiers & Admins)
CREATE POLICY "Cashiers can view all orders"
  ON public.orders FOR SELECT
  USING ( public.get_auth_role() IN ('cashier', 'admin') );

CREATE POLICY "Cashiers can view all order details"
  ON public.order_details FOR SELECT
  USING ( public.get_auth_role() IN ('cashier', 'admin') );
