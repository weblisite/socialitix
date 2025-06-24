-- Migration: 004_supabase_storage_simplified.sql
-- Description: Update videos table for Supabase Storage integration (User-safe version)
-- Date: 2024-01-20

-- ============================================
-- Update videos table for Supabase Storage
-- ============================================

-- Add Supabase Storage columns
ALTER TABLE videos 
ADD COLUMN IF NOT EXISTS storage_path text,
ADD COLUMN IF NOT EXISTS storage_bucket text DEFAULT 'videos';

-- Remove old S3 columns if they exist (safe approach)
DO $$ 
BEGIN
  -- Check if s3_key column exists before dropping
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'videos' AND column_name = 's3_key') THEN
    ALTER TABLE videos DROP COLUMN s3_key;
  END IF;
  
  -- Check if s3_bucket column exists before dropping
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'videos' AND column_name = 's3_bucket') THEN
    ALTER TABLE videos DROP COLUMN s3_bucket;
  END IF;
END $$;

-- Update existing url column to allow longer URLs (Supabase Storage URLs can be long)
ALTER TABLE videos 
ALTER COLUMN url TYPE text;

-- Create index for faster queries on storage_path
CREATE INDEX IF NOT EXISTS idx_videos_storage_path 
ON videos (storage_path);

-- Create index for storage_bucket queries
CREATE INDEX IF NOT EXISTS idx_videos_storage_bucket 
ON videos (storage_bucket);

-- ============================================
-- Update existing records (if any)
-- ============================================

-- Update existing videos to use storage_bucket
UPDATE videos 
SET storage_bucket = 'videos' 
WHERE storage_bucket IS NULL;

-- ============================================
-- Create helper functions for storage
-- ============================================

-- Function to get file URL from storage path
CREATE OR REPLACE FUNCTION get_video_storage_url(storage_path text)
RETURNS text AS $$
BEGIN
  -- Return the public URL for the file
  -- This will be used in application logic
  RETURN concat('https://kmzwucypmpsdaobsmkde.supabase.co/storage/v1/object/public/videos/', storage_path);
END;
$$ LANGUAGE plpgsql;

-- Function to clean up orphaned storage files
CREATE OR REPLACE FUNCTION cleanup_orphaned_files()
RETURNS integer AS $$
DECLARE
  deleted_count integer := 0;
BEGIN
  -- This function would be called periodically to clean up files
  -- that exist in storage but not in the videos table
  -- Implementation would depend on your cleanup strategy
  
  RAISE NOTICE 'Cleanup function created. Implement cleanup logic as needed.';
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Create storage usage monitoring views
-- ============================================

-- View for storage usage by user (will work once storage is set up)
CREATE OR REPLACE VIEW user_storage_usage AS
SELECT 
  user_id,
  count(*) as video_count,
  sum(file_size) as total_size_bytes,
  pg_size_pretty(sum(file_size)) as total_size_human
FROM videos 
WHERE storage_path IS NOT NULL
GROUP BY user_id
ORDER BY total_size_bytes DESC;

-- View for overall storage statistics
CREATE OR REPLACE VIEW storage_statistics AS
SELECT 
  storage_bucket,
  count(*) as file_count,
  sum(file_size) as total_size_bytes,
  pg_size_pretty(sum(file_size)) as total_size_human,
  avg(file_size) as avg_size_bytes,
  pg_size_pretty(avg(file_size)) as avg_size_human
FROM videos 
WHERE storage_path IS NOT NULL
GROUP BY storage_bucket;

-- ============================================
-- Migration completed successfully
-- ============================================

-- Add a comment to track this migration
COMMENT ON TABLE videos IS 'Updated for Supabase Storage integration - Migration 004 (Simplified)';

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Migration 004_supabase_storage_simplified.sql completed successfully';
  RAISE NOTICE 'Videos table updated for Supabase Storage';
  RAISE NOTICE 'Storage monitoring views created';
  RAISE NOTICE 'NOTE: Storage bucket and RLS policies must be created via Supabase Dashboard';
END $$; 