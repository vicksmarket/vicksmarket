-- Migration: product-images storage bucket + images column
-- Creates a public bucket for product images, sets up RLS policies,
-- and adds an `images` text[] column to products for multi-image support.

-- Create the bucket (idempotent)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  10485760,  -- 10 MB per file
  ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif','image/heic','image/heif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif','image/heic','image/heif'];

-- Add images array column to products (idempotent)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';

-- Drop existing policies to make this idempotent
DROP POLICY IF EXISTS "product_images_public_read"    ON storage.objects;
DROP POLICY IF EXISTS "product_images_auth_insert"    ON storage.objects;
DROP POLICY IF EXISTS "product_images_owner_update"   ON storage.objects;
DROP POLICY IF EXISTS "product_images_owner_delete"   ON storage.objects;

-- Anyone can read product images (bucket is public, but RLS still applies)
CREATE POLICY "product_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Authenticated users can upload to their own folder (path starts with their user id)
CREATE POLICY "product_images_auth_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update objects in their own folder
CREATE POLICY "product_images_owner_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'product-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete objects in their own folder
CREATE POLICY "product_images_owner_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
