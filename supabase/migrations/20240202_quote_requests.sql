-- Quote Requests: Create quote_requests table
-- Public form submissions from customers requesting quotes

CREATE TABLE IF NOT EXISTS quote_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own requests
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own requests' AND tablename = 'quote_requests') THEN
    CREATE POLICY "Users can view own requests" ON quote_requests
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

-- Policy: Users can update their own requests (status changes)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own requests' AND tablename = 'quote_requests') THEN
    CREATE POLICY "Users can update own requests" ON quote_requests
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Policy: Users can delete their own requests
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own requests' AND tablename = 'quote_requests') THEN
    CREATE POLICY "Users can delete own requests" ON quote_requests
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Policy: Anyone can insert a request (public form submission)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can submit a request' AND tablename = 'quote_requests') THEN
    CREATE POLICY "Anyone can submit a request" ON quote_requests
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_quote_requests_user_id ON quote_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON quote_requests(status);
