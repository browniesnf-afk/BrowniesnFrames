-- ====================================================================
-- BROWNIES & FRAMES - MASTER SUPABASE SQL MIGRATION & SETUP SCRIPT
-- Run this single script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/rapihhocsnmckogsmokp/sql/new
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE / UPDATE CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 3. CREATE / UPDATE PRODUCTS TABLE
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

-- 4. CREATE / UPDATE CUSTOMERS TABLE (With Phone Unique Constraint)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT,
    phone TEXT NOT NULL UNIQUE,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.customers ADD CONSTRAINT customers_phone_key UNIQUE (phone) ON CONFLICT DO NOTHING;

-- 5. CREATE / UPDATE ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'Pending',
    items_summary TEXT,
    shipping_address JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS items_summary TEXT;

-- 6. CREATE / UPDATE ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    quantity INT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CREATE / UPDATE ADMINS TABLE
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    role TEXT DEFAULT 'Super Admin',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) & ACCESS POLICIES
-- Disable RLS on public tables to allow seamless anonymous reads/writes
-- ====================================================================

ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins DISABLE ROW LEVEL SECURITY;

-- Add open public policies
DROP POLICY IF EXISTS "Public Read Categories" ON public.categories;
CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Write Categories" ON public.categories;
CREATE POLICY "Public Write Categories" ON public.categories FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Read Products" ON public.products;
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Write Products" ON public.products;
CREATE POLICY "Public Write Products" ON public.products FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Read Customers" ON public.customers;
CREATE POLICY "Public Read Customers" ON public.customers FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Write Customers" ON public.customers;
CREATE POLICY "Public Write Customers" ON public.customers FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Read Orders" ON public.orders;
CREATE POLICY "Public Read Orders" ON public.orders FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Write Orders" ON public.orders;
CREATE POLICY "Public Write Orders" ON public.orders FOR ALL USING (true);

-- ====================================================================
-- STORAGE BUCKETS SETUP FOR IMAGES
-- ====================================================================

INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Storage Read" ON storage.objects;
CREATE POLICY "Public Storage Read" ON storage.objects FOR SELECT USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Public Storage Insert" ON storage.objects;
CREATE POLICY "Public Storage Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'products');

DROP POLICY IF EXISTS "Public Storage Update" ON storage.objects;
CREATE POLICY "Public Storage Update" ON storage.objects FOR UPDATE USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Public Storage Delete" ON storage.objects;
CREATE POLICY "Public Storage Delete" ON storage.objects FOR DELETE USING (bucket_id = 'products');

-- ====================================================================
-- INITIAL SEED DATA FOR CATEGORIES
-- ====================================================================

INSERT INTO public.categories (name, slug, description, image_url, is_active) VALUES
('Brownies', 'brownies', 'Handcrafted brownies baked fresh with premium Belgian chocolate.', '/images/home_brownies.jpg', true),
('Frames', 'frames', 'Beautifully crafted frames to hold your most cherished memories.', '/images/home_frames.jpg', true),
('Gifts', 'gifts', 'Thoughtful gifts for every occasion, beautifully packed with love.', '/images/home_gifts.jpg', true)
ON CONFLICT (slug) DO NOTHING;
