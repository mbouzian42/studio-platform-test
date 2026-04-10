-- ============================================================
-- Tighten beat storage RLS to enforce role-based upload access
-- ============================================================
-- Per the test brief: "only authenticated admins/engineers can
-- upload beats". The original policies from 20260330 only checked
-- the folder matched auth.uid(), which let any authenticated user
-- upload into their own folder regardless of role.
--
-- This migration:
--   1. Adds a SECURITY DEFINER helper (matching is_admin() pattern)
--      to check the current user's role without triggering profile
--      RLS recursion.
--   2. Drops and recreates the six beat-previews / beat-files
--      insert/update/delete policies with the role check included.
--   3. Adds explicit WITH CHECK to the UPDATE policies (previously
--      only had USING, which defaulted WITH CHECK to the USING expr
--      and interacted badly with INSERT ON CONFLICT DO UPDATE).
--
-- The "beat-previews: public read" policy is intentionally left
-- untouched — anyone still reads public previews.
-- ============================================================

-- Helper: check if the current user has a role allowed to manage beats.
CREATE OR REPLACE FUNCTION public.can_manage_beats()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'engineer', 'beatmaker')
  );
$$;

-- ─── beat-previews ──────────────────────────────────────────
DROP POLICY IF EXISTS "beat-previews: auth insert own" ON storage.objects;
CREATE POLICY "beat-previews: auth insert own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'beat-previews'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND public.can_manage_beats()
  );

DROP POLICY IF EXISTS "beat-previews: auth update own" ON storage.objects;
CREATE POLICY "beat-previews: auth update own"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'beat-previews'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND public.can_manage_beats()
  )
  WITH CHECK (
    bucket_id = 'beat-previews'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND public.can_manage_beats()
  );

DROP POLICY IF EXISTS "beat-previews: auth delete own" ON storage.objects;
CREATE POLICY "beat-previews: auth delete own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'beat-previews'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND public.can_manage_beats()
  );

-- ─── beat-files ─────────────────────────────────────────────
DROP POLICY IF EXISTS "beat-files: auth insert own" ON storage.objects;
CREATE POLICY "beat-files: auth insert own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'beat-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND public.can_manage_beats()
  );

DROP POLICY IF EXISTS "beat-files: auth update own" ON storage.objects;
CREATE POLICY "beat-files: auth update own"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'beat-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND public.can_manage_beats()
  )
  WITH CHECK (
    bucket_id = 'beat-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND public.can_manage_beats()
  );

DROP POLICY IF EXISTS "beat-files: auth delete own" ON storage.objects;
CREATE POLICY "beat-files: auth delete own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'beat-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND public.can_manage_beats()
  );
