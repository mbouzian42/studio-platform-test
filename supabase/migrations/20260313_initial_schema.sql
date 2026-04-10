-- ============================================================================
-- Studio Platform - Initial Database Schema
-- ============================================================================
-- Tables: profiles, studios, studio_pricing, engineers, bookings,
--         beats, beat_purchases, mixing_orders, mixing_stems,
--         mixing_revisions, content_pages, platform_settings
-- ============================================================================

-- Enable required extensions

-- ============================================================================
-- 1. PROFILES (extends Supabase auth.users)
-- ============================================================================
CREATE TYPE user_role AS ENUM ('client', 'beatmaker', 'engineer', 'admin');

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'client',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- 2. STUDIOS
-- ============================================================================
CREATE TABLE studios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  capacity INT,
  equipment_highlights TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 3. STUDIO PRICING
-- ============================================================================
CREATE TYPE day_category AS ENUM ('weekday', 'weekend');
CREATE TYPE time_category AS ENUM ('peak', 'off_peak');

CREATE TABLE studio_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  day_category day_category NOT NULL,
  time_category time_category NOT NULL,
  hourly_rate DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(studio_id, day_category, time_category)
);

-- ============================================================================
-- 4. ENGINEERS
-- ============================================================================
CREATE TABLE engineers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  priority_order INT NOT NULL DEFAULT 0,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  specialties TEXT[] DEFAULT '{}',
  bio TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 5. BOOKINGS
-- ============================================================================
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE payment_status AS ENUM ('pending', 'deposit_paid', 'fully_paid', 'refunded');

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE RESTRICT,
  engineer_id UUID REFERENCES engineers(id) ON DELETE SET NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_hours INT NOT NULL CHECK (duration_hours >= 2),
  hourly_rate DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  deposit_amount DECIMAL(10,2),
  booking_status booking_status NOT NULL DEFAULT 'pending',
  payment_status payment_status NOT NULL DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Prevent overlapping bookings for the same studio
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Index for availability queries
CREATE INDEX idx_bookings_availability ON bookings (studio_id, booking_date, start_time, end_time)
  WHERE booking_status NOT IN ('cancelled');

-- ============================================================================
-- 6. BEATS
-- ============================================================================
CREATE TABLE beats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beatmaker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  bpm INT,
  key TEXT,
  genre TEXT,
  tags TEXT[] DEFAULT '{}',
  audio_preview_url TEXT,
  audio_full_url TEXT,
  cover_image_url TEXT,
  price_simple DECIMAL(10,2) NOT NULL,
  price_exclusive DECIMAL(10,2),
  is_exclusive_sold BOOLEAN NOT NULL DEFAULT FALSE,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  play_count INT NOT NULL DEFAULT 0,
  like_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for marketplace queries
CREATE INDEX idx_beats_published ON beats (is_published, created_at DESC)
  WHERE is_published = TRUE AND is_exclusive_sold = FALSE;

-- ============================================================================
-- 7. BEAT PURCHASES
-- ============================================================================
CREATE TYPE license_type AS ENUM ('simple', 'exclusive');

CREATE TABLE beat_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  beat_id UUID NOT NULL REFERENCES beats(id) ON DELETE RESTRICT,
  license_type license_type NOT NULL,
  price_paid DECIMAL(10,2) NOT NULL,
  stripe_payment_intent_id TEXT,
  download_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Mark beat as exclusive-sold after exclusive purchase
CREATE OR REPLACE FUNCTION handle_exclusive_purchase()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.license_type = 'exclusive' THEN
    UPDATE beats SET is_exclusive_sold = TRUE, updated_at = now()
    WHERE id = NEW.beat_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_beat_purchased
  AFTER INSERT ON beat_purchases
  FOR EACH ROW EXECUTE FUNCTION handle_exclusive_purchase();

-- ============================================================================
-- 8. MIXING ORDERS
-- ============================================================================
CREATE TYPE mixing_formula AS ENUM ('standard', 'premium');
CREATE TYPE mixing_status AS ENUM ('pending', 'in_progress', 'delivered', 'revision_requested', 'completed');

CREATE TABLE mixing_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,  -- admin manual creation
  formula mixing_formula NOT NULL,
  mixing_status mixing_status NOT NULL DEFAULT 'pending',
  brief TEXT NOT NULL DEFAULT '',
  notes TEXT,
  price DECIMAL(10,2) NOT NULL,
  stripe_payment_intent_id TEXT,
  payment_status payment_status NOT NULL DEFAULT 'pending',
  revision_count INT NOT NULL DEFAULT 0,
  max_revisions INT NOT NULL DEFAULT 2,
  delivered_file_url TEXT,
  meet_link TEXT,
  engineer_id UUID REFERENCES engineers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 9. MIXING STEMS (uploaded files for a mixing order)
-- ============================================================================
CREATE TABLE mixing_stems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mixing_order_id UUID NOT NULL REFERENCES mixing_orders(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_format TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 10. MIXING REVISIONS
-- ============================================================================
CREATE TYPE revision_status AS ENUM ('requested', 'in_progress', 'delivered');

CREATE TABLE mixing_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mixing_order_id UUID NOT NULL REFERENCES mixing_orders(id) ON DELETE CASCADE,
  revision_number INT NOT NULL,
  feedback TEXT NOT NULL,
  revision_status revision_status NOT NULL DEFAULT 'requested',
  delivered_file_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 11. CONTENT PAGES (CMS)
-- ============================================================================
CREATE TABLE content_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- ============================================================================
-- 12. PLATFORM SETTINGS
-- ============================================================================
CREATE TABLE platform_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- UPDATED_AT TRIGGER (auto-update timestamp)
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON studios FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON studio_pricing FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON engineers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON beats FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON mixing_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON mixing_revisions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON content_pages FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON platform_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE studios ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE beats ENABLE ROW LEVEL SECURITY;
ALTER TABLE beat_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE mixing_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE mixing_stems ENABLE ROW LEVEL SECURITY;
ALTER TABLE mixing_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- ---- PROFILES ----
-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ---- STUDIOS ----
-- Everyone can view active studios
CREATE POLICY "Public can view active studios"
  ON studios FOR SELECT
  USING (is_active = TRUE);

-- Admins can manage studios
CREATE POLICY "Admins can manage studios"
  ON studios FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ---- STUDIO PRICING ----
-- Everyone can view pricing
CREATE POLICY "Public can view pricing"
  ON studio_pricing FOR SELECT
  USING (TRUE);

-- Admins can manage pricing
CREATE POLICY "Admins can manage pricing"
  ON studio_pricing FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ---- ENGINEERS ----
-- Everyone can view available engineers
CREATE POLICY "Public can view available engineers"
  ON engineers FOR SELECT
  USING (is_available = TRUE);

-- Admins can manage engineers
CREATE POLICY "Admins can manage engineers"
  ON engineers FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ---- BOOKINGS ----
-- Users can view their own bookings
CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create bookings
CREATE POLICY "Users can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view and manage all bookings
CREATE POLICY "Admins can manage all bookings"
  ON bookings FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ---- BEATS ----
-- Everyone can view published beats
CREATE POLICY "Public can view published beats"
  ON beats FOR SELECT
  USING (is_published = TRUE AND is_exclusive_sold = FALSE);

-- Beatmakers can manage their own beats
CREATE POLICY "Beatmakers can manage own beats"
  ON beats FOR ALL
  USING (auth.uid() = beatmaker_id);

-- Admins can manage all beats
CREATE POLICY "Admins can manage all beats"
  ON beats FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ---- BEAT PURCHASES ----
-- Users can view their own purchases
CREATE POLICY "Users can view own purchases"
  ON beat_purchases FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create purchases
CREATE POLICY "Users can create purchases"
  ON beat_purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all purchases
CREATE POLICY "Admins can view all purchases"
  ON beat_purchases FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ---- MIXING ORDERS ----
-- Users can view their own orders
CREATE POLICY "Users can view own mixing orders"
  ON mixing_orders FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create orders
CREATE POLICY "Users can create mixing orders"
  ON mixing_orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can manage all orders
CREATE POLICY "Admins can manage all mixing orders"
  ON mixing_orders FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ---- MIXING STEMS ----
-- Users can view stems for their orders
CREATE POLICY "Users can view own stems"
  ON mixing_stems FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM mixing_orders WHERE id = mixing_order_id AND user_id = auth.uid())
  );

-- Users can upload stems for their orders
CREATE POLICY "Users can upload stems"
  ON mixing_stems FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM mixing_orders WHERE id = mixing_order_id AND user_id = auth.uid())
  );

-- Admins can manage all stems
CREATE POLICY "Admins can manage all stems"
  ON mixing_stems FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ---- MIXING REVISIONS ----
-- Users can view revisions for their orders
CREATE POLICY "Users can view own revisions"
  ON mixing_revisions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM mixing_orders WHERE id = mixing_order_id AND user_id = auth.uid())
  );

-- Users can request revisions
CREATE POLICY "Users can request revisions"
  ON mixing_revisions FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM mixing_orders WHERE id = mixing_order_id AND user_id = auth.uid())
  );

-- Admins/engineers can manage all revisions
CREATE POLICY "Admins can manage all revisions"
  ON mixing_revisions FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ---- CONTENT PAGES ----
-- Everyone can read content
CREATE POLICY "Public can view content"
  ON content_pages FOR SELECT
  USING (TRUE);

-- Admins can manage content
CREATE POLICY "Admins can manage content"
  ON content_pages FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ---- PLATFORM SETTINGS ----
-- Everyone can read settings
CREATE POLICY "Public can view settings"
  ON platform_settings FOR SELECT
  USING (TRUE);

-- Admins can manage settings
CREATE POLICY "Admins can manage settings"
  ON platform_settings FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
