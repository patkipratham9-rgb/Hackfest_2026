-- Migration: Enable Phone/OTP Profile Registration & Upsert
-- Fixes Checkpoint RLS Policy: Enables custom Phone OTP & Firebase registration to store user details in Supabase

DO $$
BEGIN
  -- Drop restrictive auth.uid() = id policies that block custom OTP & server-side upserts
  DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Allow user registration" ON public.profiles;
  DROP POLICY IF EXISTS "Allow user profile updates" ON public.profiles;

  -- Create permissive policies for user profile registration and updates
  CREATE POLICY "Allow user registration"
    ON public.profiles
    FOR INSERT
    WITH CHECK (true);

  CREATE POLICY "Allow user profile updates"
    ON public.profiles
    FOR UPDATE
    USING (true);
END $$;
