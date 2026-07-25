-- ====================================================================
-- BROWNIES & FRAMES - COMPLETE SUPABASE SQL SCHEMA
-- Run this script directly in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/rapihhocsnmckogsmokp/sql/new
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CREATE PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    compare_at_price NUMERIC(10, 2),
    weight TEXT DEFAULT '250g',
    stock INT DEFAULT 50,
    category TEXT NOT NULL,
    badge TEXT,
    images TEXT[] DEFAULT '{}',
    rating NUMERIC(3, 2) DEFAULT 5.0,
    reviews_count INT DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CREATE ADMINS TABLE
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'Super Admin',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CREATE CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CREATE ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'Pending',
    shipping_address JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CREATE ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    quantity INT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) & ACCESS POLICIES
-- Disable RLS on public tables to allow seamless anonymous reads/writes
-- ====================================================================

ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;

-- ====================================================================
-- STORAGE BUCKETS SETUP FOR PRODUCT IMAGES
-- ====================================================================

INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Grant public read and write policies on 'products' bucket
CREATE POLICY "Public Read Access on products bucket" 
ON storage.objects FOR SELECT USING (bucket_id = 'products');

CREATE POLICY "Public Insert Access on products bucket" 
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'products');

CREATE POLICY "Public Update Access on products bucket" 
ON storage.objects FOR UPDATE USING (bucket_id = 'products');

CREATE POLICY "Public Delete Access on products bucket" 
ON storage.objects FOR DELETE USING (bucket_id = 'products');

-- ====================================================================
-- SEED INITIAL CATEGORIES
-- ====================================================================

INSERT INTO public.categories (name, slug, description, image_url) VALUES
('Brownies', 'brownies', 'Handcrafted brownies baked fresh with premium Belgian chocolate.', '/images/home_brownies.jpg'),
('Frames', 'frames', 'Beautifully crafted frames to hold your most cherished memories.', '/images/home_frames.jpg'),
('Gifts', 'gifts', 'Thoughtful gifts for every occasion, beautifully packed with love.', '/images/home_gifts.jpg')
ON CONFLICT (slug) DO NOTHING;
