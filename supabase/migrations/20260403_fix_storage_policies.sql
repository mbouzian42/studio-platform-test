-- Fix storage buckets and RLS policies for beat marketplace
-- This migration ensures buckets exist with correct MIME types and RLS policies

-- Create or update buckets with MP3 support
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'beat-previews',
    'beat-previews',
    true,
    209715200,
    ARRAY['audio/wav', 'audio/x-wav', 'audio/mpeg', 'audio/mp3', 'audio/aiff', 'audio/x-aiff', 'audio/flac', 'image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'beat-files',
    'beat-files',
    false,
    209715200,
    ARRAY['audio/wav', 'audio/x-wav', 'audio/mpeg', 'audio/mp3', 'audio/aiff', 'audio/x-aiff', 'audio/flac']
  )
ON CONFLICT (id) DO UPDATE SET
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Drop existing policies (safe to run even if they don't exist)
DROP POLICY IF EXISTS "beat-previews: public read" ON storage.objects;
DROP POLICY IF EXISTS "beat-previews: auth insert own" ON storage.objects;
DROP POLICY IF EXISTS "beat-previews: auth update own" ON storage.objects;
DROP POLICY IF EXISTS "beat-previews: auth delete own" ON storage.objects;
DROP POLICY IF EXISTS "beat-previews: authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "beat-previews: authenticated update" ON storage.objects;
DROP POLICY IF EXISTS "beat-previews: authenticated delete" ON storage.objects;
DROP POLICY IF EXISTS "beat-files: auth insert own" ON storage.objects;
DROP POLICY IF EXISTS "beat-files: auth update own" ON storage.objects;
DROP POLICY IF EXISTS "beat-files: auth delete own" ON storage.objects;
DROP POLICY IF EXISTS "beat-files: authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "beat-files: authenticated update" ON storage.objects;
DROP POLICY IF EXISTS "beat-files: authenticated delete" ON storage.objects;

-- beat-previews: Anyone can read (public bucket)
CREATE POLICY "beat-previews: public read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'beat-previews');

-- beat-previews: Authenticated users can upload
-- Role check is done in application code (admin/engineer/beatmaker)
CREATE POLICY "beat-previews: authenticated upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'beat-previews');

-- beat-previews: Authenticated users can update
CREATE POLICY "beat-previews: authenticated update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'beat-previews');

-- beat-previews: Authenticated users can delete
CREATE POLICY "beat-previews: authenticated delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'beat-previews');

-- beat-files: Authenticated users can upload
CREATE POLICY "beat-files: authenticated upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'beat-files');

-- beat-files: Authenticated users can update
CREATE POLICY "beat-files: authenticated update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'beat-files');

-- beat-files: Authenticated users can delete
CREATE POLICY "beat-files: authenticated delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'beat-files');
