-- Storage Bucket Configurations
-- We need to ensure the allowed_mime_types cover all beat audio and image files correctly.
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY['audio/wav','audio/x-wav','audio/aiff','audio/x-aiff','audio/flac','audio/mpeg','audio/mp3','audio/mp4','audio/x-m4a'] 
WHERE id = 'beat-files';

UPDATE storage.buckets 
SET allowed_mime_types = ARRAY['audio/wav','audio/x-wav','audio/aiff','audio/x-aiff','audio/flac','audio/mpeg','audio/mp3','audio/mp4','audio/x-m4a','image/png','image/jpeg','image/jpg','image/webp'] 
WHERE id = 'beat-previews';

-- Drop any conflicting existing manual policies if they exist (safe-guard)
DROP POLICY IF EXISTS "beat-files: auth select own" ON storage.objects;
DROP POLICY IF EXISTS "beat-files: auth update own" ON storage.objects;
DROP POLICY IF EXISTS "beat-files: auth delete own" ON storage.objects;
DROP POLICY IF EXISTS "beat-previews: auth update own" ON storage.objects;
DROP POLICY IF EXISTS "beat-previews: auth delete own" ON storage.objects;
DROP POLICY IF EXISTS "beat-files: purchasers can select" ON storage.objects;
DROP POLICY IF EXISTS "beat-files: admins and engineers can insert" ON storage.objects;
DROP POLICY IF EXISTS "beat-previews: admins and engineers can insert" ON storage.objects;

-- 1. "only authenticated admins/engineers can upload beats"
--    (Upserting means they need INSERT, UPDATE, and SELECT on their own directories)

-- BEAT FILES (Private)
CREATE POLICY "beat-files: admins and engineers can insert" 
ON storage.objects FOR INSERT TO authenticated 
WITH CHECK (
  bucket_id = 'beat-files' AND 
  (storage.foldername(name))[1] = auth.uid()::text AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'engineer', 'beatmaker')
  )
);

CREATE POLICY "beat-files: admins and engineers can update own" 
ON storage.objects FOR UPDATE TO authenticated 
USING (
  bucket_id = 'beat-files' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "beat-files: admins and engineers can delete own" 
ON storage.objects FOR DELETE TO authenticated 
USING (
  bucket_id = 'beat-files' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "beat-files: uploaders can select own files" 
ON storage.objects FOR SELECT TO authenticated 
USING (
  bucket_id = 'beat-files' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- "only purchasers can read full files"
CREATE POLICY "beat-files: purchasers can select" 
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'beat-files' AND
  EXISTS (
    SELECT 1 FROM public.beat_purchases bp
    WHERE bp.user_id = auth.uid() 
      AND bp.stripe_payment_intent_id IS NOT NULL 
      AND bp.beat_id::text = (storage.foldername(name))[2]
  )
);

-- BEAT PREVIEWS (Public)
CREATE POLICY "beat-previews: admins and engineers can insert" 
ON storage.objects FOR INSERT TO authenticated 
WITH CHECK (
  bucket_id = 'beat-previews' AND 
  (storage.foldername(name))[1] = auth.uid()::text AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'engineer', 'beatmaker')
  )
);

CREATE POLICY "beat-previews: admins and engineers can update own" 
ON storage.objects FOR UPDATE TO authenticated 
USING (
  bucket_id = 'beat-previews' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "beat-previews: admins and engineers can delete own" 
ON storage.objects FOR DELETE TO authenticated 
USING (
  bucket_id = 'beat-previews' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- "anyone can read previews"
-- (Ensuring select is public for the public bucket)
-- (Normally beat-previews is configured as a public bucket, so it doesn't strictly need a SELECT RLS, but for completeness:)
CREATE POLICY "beat-previews: public read" 
ON storage.objects FOR SELECT TO public 
USING (bucket_id = 'beat-previews');
