# Supabase Setup Instructions

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up for a free account (or log in)
3. Click "New Project"
4. Fill in:
   - **Name**: CL-Blocks (or any name you prefer)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to you
5. Click "Create new project" (takes 1-2 minutes)

## 2. Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## 3. Create the Database Table

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Paste and run this SQL:

```sql
-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  access_level TEXT NOT NULL DEFAULT 'edit' CHECK (access_level IN ('edit', 'read')),
  category TEXT NOT NULL DEFAULT 'my-reports',
  filters JSONB NOT NULL DEFAULT '{"timePeriod": "Last 4 weeks", "selectedDimensions": []}'::jsonb,
  favorite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_reports_category ON reports(category);
CREATE INDEX IF NOT EXISTS idx_reports_updated_at ON reports(updated_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for prototype - no auth needed)
-- In production, you'd want more restrictive policies
CREATE POLICY "Allow all operations" ON reports
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable real-time for reports table
ALTER PUBLICATION supabase_realtime ADD TABLE reports;
```

4. Click "Run" (or press Cmd/Ctrl + Enter)

## 4. Enable Real-time

1. Go to **Database** → **Replication**
2. Find the `reports` table
3. Toggle it ON to enable real-time replication

## 5. Set Environment Variables

1. Create a `.env` file in your project root (if it doesn't exist)
2. Add these variables:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

3. Replace `your_project_url_here` and `your_anon_key_here` with the values from step 2

## 6. Install Dependencies (if not already done)

```bash
npm install
```

## 7. Run the Migration Script (Optional)

If you have existing data in localStorage, run:

```bash
node migrate-to-supabase.js
```

This will migrate your existing reports to Supabase.

## 8. Start the Development Server

```bash
npm run dev
```

## Notes

- **Free Tier Limits**: 
  - 500MB database storage
  - 2GB bandwidth per month
  - Real-time included
  - Perfect for prototypes!

- **Security**: The current setup allows public read/write access. For production, you'd want to:
  - Add authentication
  - Create more restrictive RLS policies
  - Use service role key for server-side operations only

## Troubleshooting

- **"Table doesn't exist"**: Make sure you ran the SQL in step 3
- **"Real-time not working"**: Check that real-time is enabled in Database → Replication
- **"CORS errors"**: Make sure your Supabase project allows requests from your domain
- **"RLS policy violation"**: Make sure the policy in step 3 was created successfully

