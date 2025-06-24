# 🛠️ Supabase Storage Manual Setup Guide

## ⚠️ Permission Issue Resolved

The error `ERROR: 42501: must be owner of table objects` occurs because the `storage.objects` table requires superuser privileges. This guide provides a workaround using the Supabase Dashboard.

## 📋 Step-by-Step Setup

### **Step 1: Run the Simplified Database Migration**

Use the simplified migration that doesn't require superuser privileges:

```bash
# Copy the simplified migration content and run it in Supabase SQL Editor
cat database/migrations/004_supabase_storage_simplified.sql
```

**Or run it directly if you have psql access:**
```bash
psql "your_supabase_connection_string" -f database/migrations/004_supabase_storage_simplified.sql
```

### **Step 2: Create Storage Bucket via Supabase Dashboard**

1. **Go to Supabase Dashboard**
   - Visit [supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your Socialitix project

2. **Navigate to Storage**
   - Click **Storage** in the left sidebar
   - Click **Create Bucket**

3. **Configure Bucket Settings**
   ```
   Bucket name: videos
   Public bucket: false (unchecked)
   File size limit: 500 MB
   Allowed MIME types: video/*, audio/*, image/*
   ```

4. **Click Create Bucket**

### **Step 3: Set Up Storage Policies via Dashboard**

1. **Go to Storage Policies**
   - In Storage section, click on **Policies** tab
   - Select the `videos` bucket

2. **Create Upload Policy**
   - Click **New Policy**
   - Choose **Custom Policy**
   - Policy name: `Users can upload to own folder`
   - Operation: `INSERT`
   - Target roles: `authenticated`
   - Policy definition:
   ```sql
   auth.uid()::text = (storage.foldername(name))[2] AND bucket_id = 'videos'
   ```

3. **Create View Policy**
   - Click **New Policy**
   - Policy name: `Users can view own files`
   - Operation: `SELECT`
   - Target roles: `authenticated`
   - Policy definition:
   ```sql
   auth.uid()::text = (storage.foldername(name))[2] AND bucket_id = 'videos'
   ```

4. **Create Delete Policy**
   - Click **New Policy**
   - Policy name: `Users can delete own files`
   - Operation: `DELETE`
   - Target roles: `authenticated`
   - Policy definition:
   ```sql
   auth.uid()::text = (storage.foldername(name))[2] AND bucket_id = 'videos'
   ```

5. **Create Update Policy**
   - Click **New Policy**
   - Policy name: `Users can update own files`
   - Operation: `UPDATE`
   - Target roles: `authenticated`
   - Policy definition:
   ```sql
   auth.uid()::text = (storage.foldername(name))[2] AND bucket_id = 'videos'
   ```

### **Step 4: Alternative - Use SQL Editor for Policies**

If you prefer SQL, you can create policies via the Supabase SQL Editor:

```sql
-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid()::text = (storage.foldername(name))[2] AND
  bucket_id = 'videos'
);

CREATE POLICY "Users can view own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  auth.uid()::text = (storage.foldername(name))[2] AND
  bucket_id = 'videos'
);

CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  auth.uid()::text = (storage.foldername(name))[2] AND
  bucket_id = 'videos'
);

CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  auth.uid()::text = (storage.foldername(name))[2] AND
  bucket_id = 'videos'
);
```

### **Step 5: Test Storage Setup**

1. **Test via Dashboard**
   - Go to Storage → videos bucket
   - Try uploading a test file
   - Verify you can view it

2. **Test via Application**
   ```bash
   # Start your development server
   npm run dev
   
   # Try uploading a video through your app
   ```

### **Step 6: Verify Database Schema**

Check that your videos table has the new columns:

```sql
-- Check table structure
\d videos;

-- Or use this query
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'videos'
ORDER BY ordinal_position;
```

You should see these new columns:
- `storage_path` (text)
- `storage_bucket` (text, default: 'videos')

### **Step 7: Update Environment Variables**

Make sure your environment variables are set correctly:

```bash
# Check your .env.local file
cat .env.local
```

Should contain:
```bash
SUPABASE_URL=https://kmzwucypmpsdaobsmkde.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🔍 Troubleshooting

### **Issue: "Bucket not found"**
```sql
-- Check if bucket exists
SELECT * FROM storage.buckets WHERE name = 'videos';
```

If no results, create the bucket via Dashboard or SQL:
```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos', 
  'videos', 
  false, 
  524288000, -- 500MB
  ARRAY['video/*', 'audio/*', 'image/*']
);
```

### **Issue: "Policy violation"**
```sql
-- Check if policies exist
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
```

If no policies, create them via Dashboard or SQL Editor.

### **Issue: Upload fails**
1. Check file size (must be < 500MB)
2. Check file type (must be video/*, audio/*, or image/*)
3. Check user authentication
4. Check network connectivity

## ✅ Verification Checklist

- [ ] Database migration completed successfully
- [ ] Storage bucket `videos` created
- [ ] RLS policies configured for all operations (INSERT, SELECT, UPDATE, DELETE)
- [ ] Test file upload works via dashboard
- [ ] Environment variables are set correctly
- [ ] Application can upload files successfully

## 🎯 Next Steps

Once setup is complete:

1. **Test Upload Flow**
   ```bash
   npm run dev
   # Test uploading a video file
   ```

2. **Monitor Storage Usage**
   - Check Supabase Dashboard → Storage for usage stats
   - Use the created views for detailed monitoring

3. **Deploy to Production**
   ```bash
   # Update Vercel environment variables
   vercel env add SUPABASE_URL
   vercel env add SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   
   # Deploy
   vercel --prod
   ```

## 💡 Why This Approach Works

- **No Superuser Required**: Uses Supabase Dashboard for storage operations
- **Secure by Default**: RLS policies ensure user isolation
- **Production Ready**: Same setup works for development and production
- **Easy Management**: All configuration in one dashboard

Your Supabase Storage is now ready! 🚀 