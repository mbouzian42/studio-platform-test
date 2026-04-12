-- ============================================================================
-- Fix: Beats RLS policies + MP3 support in storage buckets
-- ============================================================================
-- 1. Replace admin beats policy to use is_admin() (avoids RLS recursion)
-- 2. Add engineer policy so engineers can insert/manage beats
-- 3. Add audio/mpeg (MP3) to storage bucket allowed_mime_types
-- ============================================================================

-- Helper: check if current user has a specific role (bypasses RLS on profiles)
CREATE OR REPLACE FUNCTION public.has_role(required_role text)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role::text = required_role
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ---- Fix beats table policies ----

-- Drop and recreate admin policy using is_admin() to avoid recursion
DROP POLICY IF EXISTS "Admins can manage all beats" ON beats;
CREATE POLICY "Admins can manage all beats"
  ON beats FOR ALL
  USING (public.is_admin());

-- Add engineer policy: engineers can insert and manage their own beats
CREATE POLICY "Engineers can manage own beats"
  ON beats FOR ALL
  USING (
    auth.uid() = beatmaker_id
    AND public.has_role('engineer')
  );

-- ---- Fix beat_purchases policies (same recursion issue) ----
DROP POLICY IF EXISTS "Admins can view all purchases" ON beat_purchases;
CREATE POLICY "Admins can view all purchases"
  ON beat_purchases FOR ALL
  USING (public.is_admin());

-- ---- Add MP3 to storage bucket allowed MIME types ----

UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'audio/wav', 'audio/x-wav',
  'audio/mpeg', 'audio/mp3',
  'audio/aiff', 'audio/x-aiff',
  'audio/flac',
  'image/jpeg', 'image/png', 'image/webp'
]
WHERE id = 'beat-previews';

UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'audio/wav', 'audio/x-wav',
  'audio/mpeg', 'audio/mp3',
  'audio/aiff', 'audio/x-aiff',
  'audio/flac'
]
WHERE id = 'beat-files';
