-- =============================================================================
-- DINEDIRECT: USER COLLECTION & ADDRESSES SCHEMA FOR SUPABASE
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/hloeorcjstobxesflamk/sql/new
-- =============================================================================

-- 1. Create Users Table / Collection
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'CUSTOMER', -- 'CUSTOMER' | 'RESTAURANT_OWNER'
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Create User Addresses Table / Collection
CREATE TABLE IF NOT EXISTS public.user_addresses (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  label TEXT DEFAULT 'Home', -- 'Home' | 'Work' | 'Other'
  receiver_name TEXT,
  phone TEXT,
  street TEXT NOT NULL,
  apartment TEXT,
  city TEXT NOT NULL,
  postal_code TEXT,
  delivery_notes TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Create Indexes for High Performance Queries
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON public.user_addresses(user_id);

-- 4. Enable Row Level Security (RLS) & Grant Access Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to users table" ON public.users;
CREATE POLICY "Allow all access to users table" ON public.users
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to user_addresses table" ON public.user_addresses;
CREATE POLICY "Allow all access to user_addresses table" ON public.user_addresses
  FOR ALL USING (true) WITH CHECK (true);

-- 5. Seed Initial Admin / Owner User
INSERT INTO public.users (id, name, email, role)
VALUES 
  ('owner_admin', 'Restaurant Owner', '03pavitar.dev@gmail.com', 'RESTAURANT_OWNER')
ON CONFLICT (id) DO UPDATE 
SET role = 'RESTAURANT_OWNER', updated_at = NOW();

-- 6. In case table already exists, safely add latitude and longitude columns:
ALTER TABLE IF EXISTS public.user_addresses 
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
