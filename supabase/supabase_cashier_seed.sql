-- Run this script in your Supabase SQL Editor to seed the cashier account.
-- It inserts a new user into auth.users and creates the corresponding profile.

-- Since Supabase auth.users is protected, it's safer to just insert the profile 
-- and let the user create the auth user manually via the dashboard if the query below fails.

DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change,
    raw_user_meta_data
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    'cashier@roastedgoods.com',
    crypt('cashier123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '',
    '',
    '',
    '',
    '{"role": "cashier", "username": "Cashier"}'::jsonb
  );
END $$;
