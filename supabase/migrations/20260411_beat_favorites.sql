-- ============================================================
-- Beat Favorites
-- ============================================================
-- Logged-in users can favorite beats. This table is a simple
-- join with a composite primary key (one row per user/beat pair).
-- ============================================================

CREATE TABLE IF NOT EXISTS beat_favorites (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  beat_id UUID NOT NULL REFERENCES beats(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, beat_id)
);

-- Index for listing a user's favorites ordered by most-recent-first.
CREATE INDEX IF NOT EXISTS beat_favorites_user_created_idx
  ON beat_favorites (user_id, created_at DESC);

ALTER TABLE beat_favorites ENABLE ROW LEVEL SECURITY;

-- Users can see their own favorites.
CREATE POLICY "Users can view own favorites"
  ON beat_favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can add favorites for themselves only.
CREATE POLICY "Users can add own favorites"
  ON beat_favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can remove their own favorites.
CREATE POLICY "Users can remove own favorites"
  ON beat_favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
