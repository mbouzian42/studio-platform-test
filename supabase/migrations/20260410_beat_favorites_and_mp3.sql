-- Beat favorites (cart / wishlist for marketplace)
CREATE TABLE IF NOT EXISTS beat_favorites (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  beat_id UUID NOT NULL REFERENCES beats(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, beat_id)
);

CREATE INDEX IF NOT EXISTS idx_beat_favorites_user ON beat_favorites (user_id, created_at DESC);

ALTER TABLE beat_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own beat favorites"
  ON beat_favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own beat favorites"
  ON beat_favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own beat favorites"
  ON beat_favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow reading beat rows when listed in the user's favorites (e.g. edge cases / joins)
CREATE POLICY "Users can view beats saved in favorites"
  ON beats FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM beat_favorites bf
      WHERE bf.beat_id = beats.id AND bf.user_id = auth.uid()
    )
  );

-- MP3 support for beat uploads (WAV, MP3, AIFF, FLAC)
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
