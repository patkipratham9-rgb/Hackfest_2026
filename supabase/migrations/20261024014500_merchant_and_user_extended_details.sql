-- Migration: Add extended merchant business/banking details and user profile addresses

-- 1. Extend profiles with email and addresses jsonb
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS addresses JSONB DEFAULT '[]'::jsonb;

-- 2. Extend stores with merchant business, tax, and banking details
ALTER TABLE public.stores
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS shop_timing TEXT,
  ADD COLUMN IF NOT EXISTS holidays TEXT,
  ADD COLUMN IF NOT EXISTS business_type TEXT,
  ADD COLUMN IF NOT EXISTS contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS pan_number TEXT,
  ADD COLUMN IF NOT EXISTS bank_account_number TEXT,
  ADD COLUMN IF NOT EXISTS bank_ifsc_code TEXT,
  ADD COLUMN IF NOT EXISTS bank_name TEXT,
  ADD COLUMN IF NOT EXISTS pickup_address TEXT,
  ADD COLUMN IF NOT EXISTS return_address TEXT,
  ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- 3. Allow deleting account / store
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can delete their own profile'
  ) THEN
    CREATE POLICY "Users can delete their own profile"
      ON public.profiles
      FOR DELETE
      TO authenticated
      USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'stores' AND policyname = 'Merchants can delete their own store'
  ) THEN
    CREATE POLICY "Merchants can delete their own store"
      ON public.stores
      FOR DELETE
      TO authenticated
      USING (auth.uid() = seller_id);
  END IF;
END $$;
