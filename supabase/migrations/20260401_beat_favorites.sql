-- Beat Favorites table for marketplace swipe feature
CREATE TABLE beat_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  beat_id UUID NOT NULL REFERENCES beats(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, beat_id)
);

CREATE INDEX idx_beat_favorites_user ON beat_favorites (user_id, created_at DESC);

ALTER TABLE beat_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites"
  ON beat_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
  ON beat_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own favorites"
  ON beat_favorites FOR DELETE
  USING (auth.uid() = user_id);
