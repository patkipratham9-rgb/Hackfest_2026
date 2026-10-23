-- Checkpoint CP-SP03: Supabase Storage Banner Upload Bucket & RLS Policies

-- 1. Create store-banners public bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'store-banners',
  'store-banners',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Storage RLS policies for store-banners
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public read for store banners'
  ) THEN
    CREATE POLICY "Public read for store banners"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'store-banners');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated users and sellers can upload banners'
  ) THEN
    CREATE POLICY "Authenticated users and sellers can upload banners"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'store-banners');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can update store banners'
  ) THEN
    CREATE POLICY "Users can update store banners"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'store-banners');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can delete store banners'
  ) THEN
    CREATE POLICY "Users can delete store banners"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'store-banners');
  END IF;
END $$;
