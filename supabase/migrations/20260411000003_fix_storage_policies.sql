-- ============================================================
-- Fix Storage RLS Policies for Beat Marketplace
-- ============================================================

-- 1. Add missing SELECT policy for beat-files (private bucket)
-- This is required for owner to download and for upserts to work
CREATE POLICY "beat-files: auth select own"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'beat-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 2. Add Admin bypass for beat-previews (full access to all folders)
CREATE POLICY "beat-previews: admin access"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'beat-previews'
    AND public.is_admin()
  )
  WITH CHECK (
    bucket_id = 'beat-previews'
    AND public.is_admin()
  );

-- 3. Add Admin bypass for beat-files (full access to all folders)
CREATE POLICY "beat-files: admin access"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'beat-files'
    AND public.is_admin()
  )
  WITH CHECK (
    bucket_id = 'beat-files'
    AND public.is_admin()
  );
