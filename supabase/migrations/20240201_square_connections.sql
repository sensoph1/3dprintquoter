-- Square POS Integration: Create square_connections table
-- This table stores OAuth tokens and connection info for Square integration

CREATE TABLE IF NOT EXISTS square_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  merchant_id TEXT NOT NULL,
  merchant_name TEXT,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  location_id TEXT,
  location_name TEXT,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE square_connections ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own connection
CREATE POLICY "Users can view own connection" ON square_connections
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can delete their own connection
CREATE POLICY "Users can delete own connection" ON square_connections
  FOR DELETE USING (auth.uid() = user_id);

-- Note: INSERT and UPDATE are handled by service role key in Edge Functions
-- to keep access tokens server-side only

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_square_connections_user_id ON square_connections(user_id);

-- Add comment for documentation
COMMENT ON TABLE square_connections IS 'Stores Square POS OAuth tokens and connection metadata for each user';
COMMENT ON COLUMN square_connections.access_token IS 'Square OAuth access token (encrypted at rest by Supabase)';
COMMENT ON COLUMN square_connections.refresh_token IS 'Square OAuth refresh token for obtaining new access tokens';
COMMENT ON COLUMN square_connections.location_id IS 'Primary Square location for transaction filtering';
