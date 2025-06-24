# 📁 Supabase Storage Setup Guide

## 🎯 Overview

This guide will help you set up Supabase Storage for handling video uploads in your Socialitix application. Supabase Storage is a perfect choice because it integrates seamlessly with your existing Supabase database and provides robust file management capabilities.

## ✅ Benefits of Supabase Storage

- 🔗 **Seamless Integration**: Works perfectly with your existing Supabase setup
- 🚀 **No Additional Configuration**: Uses your existing Supabase credentials
- 💰 **Cost Effective**: Generous free tier, pay-as-you-scale
- 🔒 **Secure**: Built-in RLS (Row Level Security) policies
- 📈 **Scalable**: Handles files up to 500MB per file
- 🌍 **CDN**: Global content delivery network included
- 🛠️ **Easy Management**: Simple dashboard interface

## 🛠️ Step 1: Create Storage Bucket

### Via Supabase Dashboard
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your Socialitix project
3. Navigate to **Storage** in the left sidebar
4. Click **Create Bucket**
5. Set bucket name: `videos`
6. Configure bucket settings:
   - **Public bucket**: `false` (for security)
   - **File size limit**: `500MB`
   - **Allowed MIME types**: `video/*, audio/*, image/*`

### Via SQL (Alternative)
```sql
-- Create the videos bucket
insert into storage.buckets (id, name, public)
values ('videos', 'videos', false);
```

## 🔐 Step 2: Set Up Storage Policies

Create these RLS (Row Level Security) policies for secure file access:

```sql
-- Policy: Allow authenticated users to upload files to their own folder
create policy "Users can upload to own folder"
on storage.objects for insert
with check (
  auth.uid()::text = (storage.foldername(name))[2] AND
  bucket_id = 'videos'
);

-- Policy: Allow users to view their own files
create policy "Users can view own files"
on storage.objects for select
using (
  auth.uid()::text = (storage.foldername(name))[2] AND
  bucket_id = 'videos'
);

-- Policy: Allow users to delete their own files
create policy "Users can delete own files"
on storage.objects for delete
using (
  auth.uid()::text = (storage.foldername(name))[2] AND
  bucket_id = 'videos'
);

-- Policy: Allow users to update their own files
create policy "Users can update own files"
on storage.objects for update
using (
  auth.uid()::text = (storage.foldername(name))[2] AND
  bucket_id = 'videos'
);
```

## 🗄️ Step 3: Update Database Schema

Add storage-related columns to your videos table:

```sql
-- Add Supabase Storage columns to videos table
alter table videos 
add column if not exists storage_path text,
add column if not exists storage_bucket text default 'videos';

-- Remove old S3 columns if they exist
alter table videos 
drop column if exists s3_key,
drop column if exists s3_bucket;

-- Create index for faster queries
create index if not exists idx_videos_storage_path 
on videos (storage_path);
```

## 🚀 Step 4: Test Storage Setup

### Test via Supabase Dashboard
1. Go to **Storage > videos bucket**
2. Try uploading a test file
3. Verify you can view and download it

### Test via API
Create a test script to verify everything works:

```javascript
// test-storage.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://kmzwucypmpsdaobsmkde.supabase.co',
  'your_anon_key_here'
);

async function testStorage() {
  try {
    // Test file upload
    const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
    
    const { data, error } = await supabase.storage
      .from('videos')
      .upload(`test/${Date.now()}-test.txt`, testFile);

    if (error) {
      console.error('Upload failed:', error);
      return;
    }

    console.log('✅ Upload successful:', data);

    // Test file download
    const { data: downloadData } = supabase.storage
      .from('videos')
      .getPublicUrl(data.path);

    console.log('✅ Download URL:', downloadData.publicUrl);

    // Test file deletion
    const { error: deleteError } = await supabase.storage
      .from('videos')
      .remove([data.path]);

    if (deleteError) {
      console.error('Delete failed:', deleteError);
    } else {
      console.log('✅ Delete successful');
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run test
testStorage();
```

## 📊 Step 5: Configure File Size and Type Restrictions

### Update Bucket Policies
```sql
-- Create function to validate file uploads
create or replace function validate_file_upload()
returns trigger as $$
begin
  -- Check file size (500MB limit)
  if new.metadata->>'size' is not null then
    if (new.metadata->>'size')::bigint > 524288000 then
      raise exception 'File size exceeds 500MB limit';
    end if;
  end if;

  -- Check file type
  if new.metadata->>'mimetype' is not null then
    if new.metadata->>'mimetype' not like 'video/%' 
       and new.metadata->>'mimetype' not like 'audio/%' 
       and new.metadata->>'mimetype' not like 'image/%' then
      raise exception 'File type not allowed. Only video, audio, and image files are permitted.';
    end if;
  end if;

  return new;
end;
$$ language plpgsql;

-- Create trigger for file validation
create trigger validate_file_upload_trigger
  before insert on storage.objects
  for each row execute function validate_file_upload();
```

## 🔧 Step 6: Environment Variables

Your environment variables are now simplified:

```bash
# Only need Supabase credentials - no AWS required!
SUPABASE_URL=https://kmzwucypmpsdaobsmkde.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Frontend variables
VITE_SUPABASE_URL=https://kmzwucypmpsdaobsmkde.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## 📈 Step 7: Monitor Usage

### Check Storage Usage
```sql
-- View storage usage by bucket
select 
  bucket_id,
  count(*) as file_count,
  sum((metadata->>'size')::bigint) as total_size_bytes,
  pg_size_pretty(sum((metadata->>'size')::bigint)) as total_size_human
from storage.objects 
group by bucket_id;

-- View storage usage by user
select 
  (storage.foldername(name))[2] as user_id,
  count(*) as file_count,
  sum((metadata->>'size')::bigint) as total_size_bytes,
  pg_size_pretty(sum((metadata->>'size')::bigint)) as total_size_human
from storage.objects 
where bucket_id = 'videos'
group by (storage.foldername(name))[2]
order by total_size_bytes desc;
```

## 🎯 Step 8: Deployment Considerations

### For Production
1. **Bucket Configuration**: Ensure bucket is set to private
2. **Policy Review**: Verify RLS policies are properly configured
3. **Size Limits**: Set appropriate file size limits
4. **Monitoring**: Set up alerts for storage usage
5. **Backups**: Consider backup strategy for important files

### Vercel Environment Variables
Add these to your Vercel dashboard:
```bash
SUPABASE_URL=https://kmzwucypmpsdaobsmkde.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🚨 Security Best Practices

### ✅ Do:
- Use RLS policies to restrict access
- Validate file types and sizes
- Use signed URLs for temporary access
- Regularly audit file permissions
- Monitor storage usage

### ❌ Don't:
- Make buckets public unless necessary
- Store sensitive data in file metadata
- Allow unlimited file uploads
- Skip file type validation
- Ignore storage quota limits

## 🔍 Troubleshooting

### Common Issues

**1. "Policy violation" errors**
```sql
-- Check if RLS is enabled
select schemaname, tablename, rowsecurity 
from pg_tables 
where tablename = 'objects' and schemaname = 'storage';

-- Enable RLS if needed
alter table storage.objects enable row level security;
```

**2. "Bucket not found" errors**
```sql
-- List all buckets
select * from storage.buckets;

-- Create bucket if missing
insert into storage.buckets (id, name, public)
values ('videos', 'videos', false);
```

**3. File upload fails**
- Check file size limits
- Verify MIME type restrictions
- Ensure user has proper permissions
- Check network connectivity

**4. Download URLs not working**
- Verify bucket privacy settings
- Check RLS policies
- Use signed URLs for private files

## 📞 Support

If you encounter issues:
1. Check [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
2. Review [Storage Policies Guide](https://supabase.com/docs/guides/storage/security/access-control)
3. Join [Supabase Discord](https://discord.supabase.com/) for community help

## 🎉 Next Steps

After completing this setup:
1. Test file uploads through your app
2. Verify video processing works correctly
3. Monitor storage usage
4. Set up automated cleanup for old files
5. Configure CDN caching if needed

Your Supabase Storage is now ready for production use! 🚀 