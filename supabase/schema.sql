-- ============================================================
-- RoastedGoods Database Schema
-- Run this entire script in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'cashier', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL,
  base_price INTEGER NOT NULL, -- in IDR (smallest unit, no decimals)
  category TEXT NOT NULL DEFAULT 'coffee',
  variants JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Carts table (one per user)
CREATE TABLE public.carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Cart details table
CREATE TABLE public.cart_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant TEXT NOT NULL DEFAULT 'Tall',
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(cart_id, product_id, variant)
);

-- 5. Orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_price INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'preparing', 'done', 'cancelled')),
  payment_id TEXT, -- for Midtrans transaction ID later
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Order details table
CREATE TABLE public.order_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL, -- snapshot at time of order
  variant TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price INTEGER NOT NULL, -- snapshot at time of order
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Trigger: Auto-create profile + cart when a new user signs up
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );

  INSERT INTO public.carts (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Trigger: Auto-update updated_at on carts
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_cart_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.carts SET updated_at = now() WHERE id = NEW.cart_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_cart_detail_change
  AFTER INSERT OR UPDATE OR DELETE ON public.cart_details
  FOR EACH ROW EXECUTE FUNCTION public.update_cart_timestamp();

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

-- Create a security definer function to get the role of the current user.
-- This runs as the database owner (postgres) and bypasses RLS, breaking the recursion loop.
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS text
LANGUAGE sql SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Profiles: users can read their own profile
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Products: anyone can read, only admins can write
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products"
  ON public.products FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert products"
  ON public.products FOR INSERT
  WITH CHECK ( public.get_auth_role() = 'admin' );

CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE
  USING ( public.get_auth_role() = 'admin' );

CREATE POLICY "Admins can delete products"
  ON public.products FOR DELETE
  USING ( public.get_auth_role() = 'admin' );

-- Carts: users can only access their own cart
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cart"
  ON public.carts FOR SELECT
  USING (auth.uid() = user_id);

-- Cart details: users can manage items in their own cart
ALTER TABLE public.cart_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cart details"
  ON public.cart_details FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.carts WHERE id = cart_details.cart_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can insert into own cart"
  ON public.cart_details FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.carts WHERE id = cart_details.cart_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can update own cart details"
  ON public.cart_details FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.carts WHERE id = cart_details.cart_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can delete from own cart"
  ON public.cart_details FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.carts WHERE id = cart_details.cart_id AND user_id = auth.uid())
  );

-- Orders: users can view their own orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Order details: users can view their own order details
ALTER TABLE public.order_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own order details"
  ON public.order_details FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_details.order_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can insert own order details"
  ON public.order_details FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_details.order_id AND user_id = auth.uid())
  );

-- ============================================================
-- Seed: Products (13 drinks from static/images)
-- Prices in IDR. Variants include Tall/Grande/Venti with price adds.
-- ============================================================
INSERT INTO public.products (name, description, image_url, base_price, category, variants) VALUES
(
  'Caffe Latte',
  'A smooth and creamy classic. Rich espresso balanced with steamed milk and a light layer of foam.',
  '/images/CaffeLatte.jpeg',
  32000,
  'coffee',
  '[{"name": "Tall", "price_add": 0}, {"name": "Grande", "price_add": 6000}, {"name": "Venti", "price_add": 13000}]'::jsonb
),
(
  'Caramel Ribbon Crunch Frappuccino',
  'Buttery caramel syrup blended with coffee, milk and ice, layered with crunchy caramel ribbon crunch topping.',
  '/images/CaramelRibbonCrunchFrapp.jpeg',
  45000,
  'coffee',
  '[{"name": "Tall", "price_add": 0}, {"name": "Grande", "price_add": 7000}, {"name": "Venti", "price_add": 13000}]'::jsonb
),
(
  'Chai Latte',
  'A warm and spicy blend of black tea infused with cinnamon, clove and other warming spices, combined with steamed milk.',
  '/images/ChaiLatte.jpeg',
  35000,
  'non-coffee',
  '[{"name": "Tall", "price_add": 0}, {"name": "Grande", "price_add": 7000}, {"name": "Venti", "price_add": 13000}]'::jsonb
),
(
  'Honey Citrus Mint Tea',
  'A soothing blend of herbal tea with steamed lemonade, honey, and a hint of fresh mint.',
  '/images/HoneyCitrusMintTea.jpeg',
  30000,
  'non-coffee',
  '[{"name": "Tall", "price_add": 0}, {"name": "Grande", "price_add": 6000}, {"name": "Venti", "price_add": 12000}]'::jsonb
),
(
  'Hot Chocolate',
  'A rich and creamy classic made with steamed milk and mocha sauce, topped with whipped cream.',
  '/images/HotChocolate.jpeg',
  28000,
  'non-coffee',
  '[{"name": "Tall", "price_add": 0}, {"name": "Grande", "price_add": 6000}, {"name": "Venti", "price_add": 12000}]'::jsonb
),
(
  'Iced Black Tea',
  'A refreshing blend of premium black tea, lightly sweetened and served over ice.',
  '/images/IcedBlackTea.jpeg',
  22000,
  'non-coffee',
  '[{"name": "Tall", "price_add": 0}, {"name": "Grande", "price_add": 6000}, {"name": "Venti", "price_add": 10000}]'::jsonb
),
(
  'Iced Caffe Latte with Protein',
  'Smooth espresso with cold milk and a boost of protein, served over ice for a refreshing pick-me-up.',
  '/images/IcedCaffeLattewProtein.jpeg',
  42000,
  'coffee',
  '[{"name": "Tall", "price_add": 0}, {"name": "Grande", "price_add": 6000}, {"name": "Venti", "price_add": 13000}]'::jsonb
),
(
  'Iced Matcha Tea Latte',
  'Smooth and creamy matcha green tea sweetened just right and served with milk over ice.',
  '/images/IcedMatchaTeaLatte.jpeg',
  40000,
  'non-coffee',
  '[{"name": "Tall", "price_add": 0}, {"name": "Grande", "price_add": 6000}, {"name": "Venti", "price_add": 12000}]'::jsonb
),
(
  'Passionfruit Guava Lemonade Refresher',
  'A tropical blend of passionfruit and guava flavors mixed with lemonade and real fruit juice, finished with pearls.',
  '/images/PassionfruitGuavaLemonadeRefresherPearls.jpeg',
  35000,
  'non-coffee',
  '[{"name": "Tall", "price_add": 0}, {"name": "Grande", "price_add": 7000}, {"name": "Venti", "price_add": 13000}]'::jsonb
),
(
  'Strawberry Acai',
  'A vibrant refresher with sweet strawberry and acai flavors, shaken with real strawberry pieces.',
  '/images/StrawberryAcai.jpeg',
  38000,
  'non-coffee',
  '[{"name": "Tall", "price_add": 0}, {"name": "Grande", "price_add": 7000}, {"name": "Venti", "price_add": 12000}]'::jsonb
),
(
  'Strawberry Acai Lemonade Refreshers',
  'Sweet strawberry and acai blended with lemonade for a tangy twist, shaken with real fruit pieces.',
  '/images/StrawberryAcaiLemonadeRefreshers.jpeg',
  38000,
  'non-coffee',
  '[{"name": "Tall", "price_add": 0}, {"name": "Grande", "price_add": 7000}, {"name": "Venti", "price_add": 12000}]'::jsonb
),
(
  'Vanilla Bean Creme Frappuccino',
  'A rich and creamy blend of vanilla bean, milk, and ice topped with whipped cream.',
  '/images/VanillaBeanCremeFrappuccino.jpeg',
  42000,
  'non-coffee',
  '[{"name": "Tall", "price_add": 0}, {"name": "Grande", "price_add": 6000}, {"name": "Venti", "price_add": 13000}]'::jsonb
),
(
  'Vanilla Sweet Cream Cold Brew',
  'Slow-steeped cold brew topped with a luscious float of house-made vanilla sweet cream.',
  '/images/VanillaSweetCreamColdBrew.jpeg',
  38000,
  'coffee',
  '[{"name": "Tall", "price_add": 0}, {"name": "Grande", "price_add": 7000}, {"name": "Venti", "price_add": 12000}]'::jsonb
);
