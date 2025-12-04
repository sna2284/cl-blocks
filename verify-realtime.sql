-- Verify and enable real-time for reports table
-- Run this if real-time isn't working

-- Check if table is in the publication
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' AND tablename = 'reports';

-- If the above returns no rows, add the table to the publication:
ALTER PUBLICATION supabase_realtime ADD TABLE reports;

-- Verify it was added
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' AND tablename = 'reports';

