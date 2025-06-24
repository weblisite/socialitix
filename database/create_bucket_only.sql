-- ============================================
-- Create Storage Bucket Only (No Policies)
-- Run this in Supabase SQL Editor, then create policies via Dashboard
-- ============================================

-- Create the videos storage bucket with unlimited file size
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos', 
  'videos', 
  false, 
  NULL, -- No file size limit (unlimited)
  ARRAY['video/*', 'audio/*', 'image/*']
)
ON CONFLICT (id) DO NOTHING;

-- Verify bucket creation
SELECT 
  id, 
  name, 
  public, 
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE name = 'videos';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Storage bucket "videos" created successfully!';
  RAISE NOTICE '⚠️  Now create RLS policies via Supabase Dashboard';
  RAISE NOTICE '📍 Go to Storage → Policies → New Policy';
END $$; 