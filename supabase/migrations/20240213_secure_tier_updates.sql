-- Secure tier updates: Only service role can modify tier field
-- This prevents users from self-upgrading via client-side Supabase calls

-- Drop the existing permissive update policy
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Create a restricted update policy that excludes tier changes
-- Users can update their own profile, but tier changes require service role
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own profile except tier' AND tablename = 'user_profiles'
  ) THEN
    CREATE POLICY "Users can update own profile except tier" ON user_profiles
      FOR UPDATE USING (auth.uid() = id)
      WITH CHECK (
        auth.uid() = id AND
        -- Prevent tier changes via this policy (tier must stay the same)
        tier = (SELECT tier FROM user_profiles WHERE id = auth.uid())
      );
  END IF;
END $$;

-- Add Stripe fields if they don't exist (for subscription tracking)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'stripe_customer_id'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN stripe_customer_id TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'stripe_subscription_id'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN stripe_subscription_id TEXT;
  END IF;
END $$;

-- Index for Stripe customer lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_stripe_customer ON user_profiles(stripe_customer_id);
