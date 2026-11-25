-- ============================================================
-- আপনজন ই-শপ (Aponjon E-Shop) — Supabase Database & Realtime SQL
-- Supabase Dashboard -> SQL Editor -> New Query -> Paste & Run
-- ============================================================

-- 1. Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  old_price NUMERIC NOT NULL DEFAULT 0,
  discount_label TEXT NOT NULL DEFAULT '',
  is_flash_badge BOOLEAN NOT NULL DEFAULT true,
  free_delivery BOOLEAN NOT NULL DEFAULT false,
  image TEXT NOT NULL,
  gallery_images JSONB NOT NULL DEFAULT '[]'::jsonb,
  colors JSONB NOT NULL DEFAULT '["White","Navy Blue","Black","Gold","Red","Pink","Green","Sky Blue"]'::jsonb,
  sold INTEGER NOT NULL DEFAULT 0,
  stock_left INTEGER NOT NULL DEFAULT 0,
  short_desc TEXT NOT NULL DEFAULT '',
  specs JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  name TEXT PRIMARY KEY,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Banners Table
CREATE TABLE IF NOT EXISTS public.banners (
  id TEXT PRIMARY KEY,
  src TEXT NOT NULL,
  alt TEXT NOT NULL DEFAULT '',
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Coupons Table
CREATE TABLE IF NOT EXISTS public.coupons (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL DEFAULT 'percent',
  value NUMERIC NOT NULL DEFAULT 0,
  min_order NUMERIC NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  zone TEXT NOT NULL DEFAULT 'dhaka',
  payment_method TEXT NOT NULL DEFAULT 'cod',
  payment_details TEXT,
  payment_verified BOOLEAN NOT NULL DEFAULT false,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC NOT NULL DEFAULT 0,
  coupon_code TEXT,
  delivery_fee NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'অর্ডার গ্রহণ'
);

-- 6. Managed Users Table
CREATE TABLE IF NOT EXISTS public.managed_users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  identifier TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  address TEXT,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'সক্রিয়',
  source TEXT NOT NULL DEFAULT 'রেজিস্ট্রেশন'
);

-- 7. Complaints / Support Tickets Table
CREATE TABLE IF NOT EXISTS public.complaints (
  id TEXT PRIMARY KEY,
  order_ref TEXT,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'নতুন'
);

-- 8. Visitors Analytics Table
CREATE TABLE IF NOT EXISTS public.visitors (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  date_key TEXT NOT NULL,
  device TEXT NOT NULL,
  page TEXT NOT NULL,
  referrer TEXT NOT NULL
);

-- 9. Website Settings Table (Single Row: id = 'main')
CREATE TABLE IF NOT EXISTS public.store_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  settings JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Admin Live Notifications Table (Order + GoPay Alerts)
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'order',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  order_id TEXT,
  amount NUMERIC,
  trx_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_read BOOLEAN NOT NULL DEFAULT false
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.managed_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Policies for real-time Storefront + Admin sync
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'products',
    'categories',
    'banners',
    'coupons',
    'orders',
    'managed_users',
    'complaints',
    'visitors',
    'store_settings',
    'admin_notifications'
  ]
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "allow_all_%I" ON public.%I;', tbl, tbl);
    EXECUTE format(
      'CREATE POLICY "allow_all_%I" ON public.%I FOR ALL USING (true) WITH CHECK (true);',
      tbl,
      tbl
    );
  END LOOP;
END $$;

-- Enable Supabase Realtime for all tables
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'products',
    'categories',
    'banners',
    'coupons',
    'orders',
    'managed_users',
    'complaints',
    'visitors',
    'store_settings',
    'admin_notifications'
  ]
  LOOP
    BEGIN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I;', tbl);
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
  END LOOP;
END $$;
