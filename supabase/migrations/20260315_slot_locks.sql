-- Slot locks table for temporary reservation during payment (Story 3.4)
CREATE TABLE IF NOT EXISTS slot_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  locked_until TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for availability queries
CREATE INDEX idx_slot_locks_studio_date ON slot_locks(studio_id, booking_date);

-- RLS
ALTER TABLE slot_locks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own locks"
  ON slot_locks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view active locks"
  ON slot_locks FOR SELECT
  USING (true);

CREATE POLICY "Users can delete their own locks"
  ON slot_locks FOR DELETE
  USING (auth.uid() = user_id);
