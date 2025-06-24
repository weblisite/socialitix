-- ============================================
-- Update Existing Videos Bucket to Remove Size Limit
-- Run this in Supabase SQL Editor to make uploads unlimited
-- ============================================

-- Update the existing videos bucket to remove file size limit
UPDATE storage.buckets 
SET file_size_limit = NULL 
WHERE id = 'videos';

-- Verify the update
SELECT 
  id, 
  name, 
  public, 
  file_size_limit,
  allowed_mime_types,
  created_at,
  updated_at
FROM storage.buckets 
WHERE name = 'videos';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Videos bucket updated to unlimited file size!';
  RAISE NOTICE '📁 Users can now upload files of any size';
  RAISE NOTICE '⚠️  Note: Supabase may still have platform limits';
END $$; 