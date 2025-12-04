-- CL Blocks Database Setup
-- Run this in your Supabase SQL Editor

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

