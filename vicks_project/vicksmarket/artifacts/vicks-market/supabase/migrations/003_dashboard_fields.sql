-- ══════════════════════════════════════════════
-- Migration 003 — Dashboard fields
-- Run this in the Supabase SQL Editor
-- ══════════════════════════════════════════════

-- Add status column to products (active / draft / archived)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS status text default 'active';

-- Update existing products to have status = 'active'
UPDATE public.products SET status = 'active' WHERE status IS NULL;

-- Add bio and followers_count to profiles (guard: only if table exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) THEN
    ALTER TABLE public.profiles
      ADD COLUMN IF NOT EXISTS bio             text,
      ADD COLUMN IF NOT EXISTS followers_count integer default 0;
  END IF;
END;
$$;

-- Index for fast merchant product queries
CREATE INDEX IF NOT EXISTS idx_products_seller_status
  ON public.products("sellerId", status);
