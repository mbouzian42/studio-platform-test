-- ============================================================================
-- Fix: RLS infinite recursion on profiles table
-- ============================================================================
-- The "Admins can view all profiles" policy queries the profiles table
-- from within a profiles policy, causing infinite recursion (error 42P17).
-- Solution: Create a SECURITY DEFINER function that bypasses RLS.
-- ============================================================================

-- Helper function to check admin status without triggering RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Drop and recreate the problematic profiles policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (public.is_admin());
