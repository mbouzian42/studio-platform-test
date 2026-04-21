-- Beat favorites (logged-in users)
CREATE TABLE IF NOT EXISTS beat_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  beat_id UUID NOT NULL REFERENCES beats(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, beat_id)
);

CREATE INDEX IF NOT EXISTS idx_beat_favorites_user ON beat_favorites (user_id);

ALTER TABLE beat_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites"
  ON beat_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON beat_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON beat_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Allow MP3 on audio buckets; beat-previews must KEEP image MIME types (covers).
UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'audio/wav',
  'audio/x-wav',
  'audio/aiff',
  'audio/x-aiff',
  'audio/flac',
  'audio/mpeg',
  'audio/mp3',
  'image/jpeg',
  'image/png',
  'image/webp'
]::text[]
WHERE id = 'beat-previews';

UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'audio/wav',
  'audio/x-wav',
  'audio/aiff',
  'audio/x-aiff',
  'audio/flac',
  'audio/mpeg',
  'audio/mp3'
]::text[]
WHERE id = 'beat-files';
