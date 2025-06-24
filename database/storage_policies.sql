-- ============================================
-- Supabase Storage Setup via SQL Editor
-- Run this in your Supabase SQL Editor
-- ============================================

-- Step 1: Create the videos storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos', 
  'videos', 
  false, 
  524288000, -- 500MB limit in bytes
  ARRAY['video/*', 'audio/*', 'image/*']
)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can upload to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;

-- Step 4: Create storage security policies

-- Policy 1: Allow authenticated users to upload files to their own folder
CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid()::text = (storage.foldername(name))[2] AND
  bucket_id = 'videos'
);

-- Policy 2: Allow users to view their own files
CREATE POLICY "Users can view own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  auth.uid()::text = (storage.foldername(name))[2] AND
  bucket_id = 'videos'
);

-- Policy 3: Allow users to delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  auth.uid()::text = (storage.foldername(name))[2] AND
  bucket_id = 'videos'
);

-- Policy 4: Allow users to update their own files
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  auth.uid()::text = (storage.foldername(name))[2] AND
  bucket_id = 'videos'
);

-- Step 5: Verify the setup
-- Check that bucket was created
SELECT 
  id, 
  name, 
  public, 
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE name = 'videos';

-- Check that policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
ORDER BY policyname;

-- Display success message
DO $$
BEGIN
  RAISE NOTICE '✅ Supabase Storage setup completed successfully!';
  RAISE NOTICE '📁 Bucket "videos" created with 500MB limit';
  RAISE NOTICE '🔒 RLS policies configured for secure file access';
  RAISE NOTICE '🎯 Ready to test file uploads!';
END $$;

-- ============================================
-- Supabase Storage RLS Policies for Videos Bucket
-- Run this in Supabase SQL Editor after bucket is created
-- ============================================

-- Enable RLS on storage.objects (should already be enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload videos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'videos');

-- Policy 2: Allow authenticated users to view/download files
CREATE POLICY "Allow authenticated users to read videos"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'videos');

-- Policy 3: Allow authenticated users to update file metadata
CREATE POLICY "Allow authenticated users to update videos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'videos')
WITH CHECK (bucket_id = 'videos');

-- Policy 4: Allow authenticated users to delete files
CREATE POLICY "Allow authenticated users to delete videos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'videos');

-- Policy 5: Allow public access to files if needed (optional - commented out)
-- Uncomment these if you want some files to be publicly accessible
/*
CREATE POLICY "Allow public read access to public videos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'videos' AND (storage.foldername(name))[1] = 'public');
*/

-- Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Storage RLS policies created successfully!';
  RAISE NOTICE '🔒 Authenticated users can now upload, read, update, and delete videos';
  RAISE NOTICE '📁 Files will be stored in the "videos" bucket';
END $$; 