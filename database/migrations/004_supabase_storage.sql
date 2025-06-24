-- Migration: 004_supabase_storage.sql
-- Description: Update videos table for Supabase Storage integration
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
-- Create Supabase Storage bucket (if not exists)
-- ============================================

-- Create videos bucket for storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos', 
  'videos', 
  false, 
  524288000, -- 500MB limit
  ARRAY['video/*', 'audio/*', 'image/*']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Set up Row Level Security Policies
-- ============================================

-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can upload to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;

-- Policy: Allow authenticated users to upload files to their own folder
CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  auth.uid()::text = (storage.foldername(name))[2] AND
  bucket_id = 'videos'
);

-- Policy: Allow users to view their own files
CREATE POLICY "Users can view own files"
ON storage.objects FOR SELECT
USING (
  auth.uid()::text = (storage.foldername(name))[2] AND
  bucket_id = 'videos'
);

-- Policy: Allow users to delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (
  auth.uid()::text = (storage.foldername(name))[2] AND
  bucket_id = 'videos'
);

-- Policy: Allow users to update their own files
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
USING (
  auth.uid()::text = (storage.foldername(name))[2] AND
  bucket_id = 'videos'
);

-- ============================================
-- Create file validation function and trigger
-- ============================================

-- Create function to validate file uploads
CREATE OR REPLACE FUNCTION validate_file_upload()
RETURNS trigger AS $$
BEGIN
  -- Check file size (500MB limit)
  IF new.metadata->>'size' IS NOT NULL THEN
    IF (new.metadata->>'size')::bigint > 524288000 THEN
      RAISE EXCEPTION 'File size exceeds 500MB limit';
    END IF;
  END IF;

  -- Check file type
  IF new.metadata->>'mimetype' IS NOT NULL THEN
    IF new.metadata->>'mimetype' NOT LIKE 'video/%' 
       AND new.metadata->>'mimetype' NOT LIKE 'audio/%' 
       AND new.metadata->>'mimetype' NOT LIKE 'image/%' THEN
      RAISE EXCEPTION 'File type not allowed. Only video, audio, and image files are permitted.';
    END IF;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS validate_file_upload_trigger ON storage.objects;

-- Create trigger for file validation
CREATE TRIGGER validate_file_upload_trigger
  BEFORE INSERT ON storage.objects
  FOR EACH ROW EXECUTE FUNCTION validate_file_upload();

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

-- View for storage usage by user
CREATE OR REPLACE VIEW user_storage_usage AS
SELECT 
  (storage.foldername(name))[2] as user_id,
  count(*) as file_count,
  sum((metadata->>'size')::bigint) as total_size_bytes,
  pg_size_pretty(sum((metadata->>'size')::bigint)) as total_size_human
FROM storage.objects 
WHERE bucket_id = 'videos'
GROUP BY (storage.foldername(name))[2]
ORDER BY total_size_bytes DESC;

-- View for overall storage statistics
CREATE OR REPLACE VIEW storage_statistics AS
SELECT 
  bucket_id,
  count(*) as file_count,
  sum((metadata->>'size')::bigint) as total_size_bytes,
  pg_size_pretty(sum((metadata->>'size')::bigint)) as total_size_human,
  avg((metadata->>'size')::bigint) as avg_size_bytes,
  pg_size_pretty(avg((metadata->>'size')::bigint)) as avg_size_human
FROM storage.objects 
GROUP BY bucket_id;

-- ============================================
-- Migration completed successfully
-- ============================================

-- Add a comment to track this migration
COMMENT ON TABLE videos IS 'Updated for Supabase Storage integration - Migration 004';

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Migration 004_supabase_storage.sql completed successfully';
  RAISE NOTICE 'Supabase Storage bucket "videos" created';
  RAISE NOTICE 'RLS policies configured for secure file access';
  RAISE NOTICE 'File validation triggers enabled';
  RAISE NOTICE 'Storage monitoring views created';
END $$; 