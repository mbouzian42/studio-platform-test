-- ============================================================================
-- Beat Favorites — User favorites/cart for the beat marketplace
-- ============================================================================
-- Allows authenticated users to save beats they like (swipe right).
-- Each user can only favorite a beat once (UNIQUE constraint).
-- ============================================================================

CREATE TABLE beat_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  beat_id UUID NOT NULL REFERENCES beats(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, beat_id)
);

-- Index for fast lookups by user
CREATE INDEX idx_beat_favorites_user ON beat_favorites (user_id, created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE beat_favorites ENABLE ROW LEVEL SECURITY;

-- Users can view their own favorites
CREATE POLICY "Users can view own favorites"
  ON beat_favorites FOR SELECT
  USING (auth.uid() = user_id);

-- Users can add favorites
CREATE POLICY "Users can add favorites"
  ON beat_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can remove favorites
CREATE POLICY "Users can remove favorites"
  ON beat_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can manage all favorites
CREATE POLICY "Admins can manage all favorites"
  ON beat_favorites FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
