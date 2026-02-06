-- User Data: Store studio configuration and history per user for cloud sync

CREATE TABLE IF NOT EXISTS user_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  library JSONB NOT NULL DEFAULT '{}',
  history JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own data' AND tablename = 'user_data') THEN
    CREATE POLICY "Users can view own data" ON user_data
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own data' AND tablename = 'user_data') THEN
    CREATE POLICY "Users can insert own data" ON user_data
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own data' AND tablename = 'user_data') THEN
    CREATE POLICY "Users can update own data" ON user_data
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_user_data_user_id ON user_data(user_id);
