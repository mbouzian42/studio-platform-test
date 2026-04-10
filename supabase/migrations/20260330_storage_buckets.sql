-- ============================================================
-- Storage Buckets for Beat Marketplace
-- ============================================================
-- beat-previews: public bucket for cover images + audio previews
-- beat-files:    private bucket for full beat downloads (signed URLs)
-- ============================================================

-- Create buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'beat-previews',
    'beat-previews',
    true,
    209715200, -- 200MB (stores audio previews + cover images)
    ARRAY['audio/wav', 'audio/x-wav', 'audio/aiff', 'audio/x-aiff', 'audio/flac', 'image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'beat-files',
    'beat-files',
    false,
    209715200, -- 200MB
    ARRAY['audio/wav', 'audio/x-wav', 'audio/aiff', 'audio/x-aiff', 'audio/flac']
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- RLS Policies for beat-previews (public bucket)
-- ============================================================

-- Anyone can read (public bucket)
CREATE POLICY "beat-previews: public read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'beat-previews');

-- Authenticated users can upload to their own folder
CREATE POLICY "beat-previews: auth insert own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'beat-previews'
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );

-- Authenticated users can update their own files
CREATE POLICY "beat-previews: auth update own"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'beat-previews'
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );

-- Authenticated users can delete their own files
CREATE POLICY "beat-previews: auth delete own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'beat-previews'
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );

-- ============================================================
-- RLS Policies for beat-files (private bucket)
-- ============================================================

-- Authenticated users can upload to their own folder
CREATE POLICY "beat-files: auth insert own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'beat-files'
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );

-- Authenticated users can update their own files
CREATE POLICY "beat-files: auth update own"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'beat-files'
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );

-- Authenticated users can delete their own files
CREATE POLICY "beat-files: auth delete own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'beat-files'
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );

-- No public SELECT on beat-files — downloads go through signed URLs
