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
DROP POLICY IF EXISTS "beat-files: auth insert own" ON storage.objects;
DROP POLICY IF EXISTS "beat-files: auth update own" ON storage.objects;
DROP POLICY IF EXISTS "beat-files: auth delete own" ON storage.objects;

-- beat-previews: Anyone can read (public bucket)
CREATE POLICY "beat-previews: public read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'beat-previews');

-- beat-previews: Authenticated users can upload to their own folder
CREATE POLICY "beat-previews: auth insert own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'beat-previews'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- beat-previews: Authenticated users can update their own files
CREATE POLICY "beat-previews: auth update own"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'beat-previews'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- beat-previews: Authenticated users can delete their own files
CREATE POLICY "beat-previews: auth delete own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'beat-previews'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- beat-files: Authenticated users can upload to their own folder
CREATE POLICY "beat-files: auth insert own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'beat-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- beat-files: Authenticated users can update their own files
CREATE POLICY "beat-files: auth update own"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'beat-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- beat-files: Authenticated users can delete their own files
CREATE POLICY "beat-files: auth delete own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'beat-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
