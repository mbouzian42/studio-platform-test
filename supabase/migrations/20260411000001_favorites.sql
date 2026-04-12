-- ============================================================
-- Favorites Table for Beat Marketplace
-- ============================================================

CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  beat_id UUID NOT NULL REFERENCES public.beats(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, beat_id)
);

-- Index for user favorites lookup
CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);

-- Functions to increment/decrement like_count
CREATE OR REPLACE FUNCTION public.increment_like_count(beat_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.beats
  SET like_count = like_count + 1
  WHERE id = beat_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.decrement_like_count(beat_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.beats
  SET like_count = GREATEST(0, like_count - 1)
  WHERE id = beat_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own favorites"
  ON public.favorites FOR ALL
  USING (auth.uid() = user_id);

-- Grant permissions (if needed, though usually standard in Supabase)
GRANT ALL ON TABLE public.favorites TO authenticated;
GRANT ALL ON TABLE public.favorites TO service_role;
