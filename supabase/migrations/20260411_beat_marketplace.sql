-- ============================================================
-- Beat Marketplace — consolidated schema / storage / RLS
-- ============================================================
-- Combines all DB-layer changes required to make the beat
-- marketplace feature work end to end, on top of the base
-- migrations (20260313 initial schema + 20260330 storage buckets).
--
-- Contents:
--   1. Add MP3 support to the beat storage buckets
--   2. Tighten beat storage RLS to enforce role-based uploads
--   3. Create the beat_favorites join table + RLS
-- ============================================================


-- ─── 1. Allow MP3 in the beat storage buckets ───────────────
-- The original storage_buckets migration only allowed WAV/AIFF/FLAC.
-- The brief requires MP3 as well, so extend allowed_mime_types.

UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'audio/wav',
  'audio/x-wav',
  'audio/mpeg',
  'audio/mp3',
  'audio/aiff',
  'audio/x-aiff',
  'audio/flac',
  'image/jpeg',
  'image/png',
  'image/webp'
]
WHERE id = 'beat-previews';

UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'audio/wav',
  'audio/x-wav',
  'audio/mpeg',
  'audio/mp3',
  'audio/aiff',
  'audio/x-aiff',
  'audio/flac'
]
WHERE id = 'beat-files';


-- ─── 2. Enforce uploader role via RLS on storage objects ────
-- Per the test brief: "only authenticated admins/engineers can
-- upload beats". The original policies from 20260330 only checked
-- that the folder matched auth.uid(), which let any authenticated
-- user upload into their own folder regardless of role.
--
-- We also add explicit WITH CHECK to the UPDATE policies
-- (previously only had USING, which defaulted WITH CHECK to the
-- USING expression and interacted badly with INSERT ON CONFLICT
-- DO UPDATE upsert code paths).
--
-- The "beat-previews: public read" policy is left untouched —
-- anyone still reads public previews.

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

-- beat-previews
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

-- beat-files
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


-- ─── 3. Beat favorites ──────────────────────────────────────
-- Logged-in users can favorite beats. Simple join with a
-- composite primary key (one row per user/beat pair).

CREATE TABLE IF NOT EXISTS beat_favorites (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  beat_id UUID NOT NULL REFERENCES beats(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, beat_id)
);

-- Listing a user's favorites ordered by most-recent-first.
CREATE INDEX IF NOT EXISTS beat_favorites_user_created_idx
  ON beat_favorites (user_id, created_at DESC);

ALTER TABLE beat_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites"
  ON beat_favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add own favorites"
  ON beat_favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own favorites"
  ON beat_favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
