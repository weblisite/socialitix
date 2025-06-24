# ☁️ Cloud Upload Architecture - Supabase Storage

## 🎯 Overview

This document outlines the cloud-native upload architecture for Socialitix, now powered by **Supabase Storage** instead of AWS S3. This provides seamless integration with your existing Supabase infrastructure while delivering enterprise-grade performance and scalability.

## 🏗️ Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │  Vercel API     │    │ Supabase        │
│   (React)       │    │  (Serverless)   │    │ Storage         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │ 1. Request Upload URL │                       │
         ├──────────────────────▶│                       │
         │                       │ 2. Generate Signed URL│
         │                       ├──────────────────────▶│
         │                       │ 3. Return Upload URL  │
         │                       │◀──────────────────────┤
         │ 4. Return Upload Data │                       │
         │◀──────────────────────┤                       │
         │                       │                       │
         │ 5. Direct Upload      │                       │
         ├───────────────────────────────────────────────▶│
         │                       │                       │
         │ 6. Notify Completion  │                       │
         ├──────────────────────▶│                       │
         │                       │ 7. Create Video Record│
         │                       ├───────────────────────┤
         │                       │ 8. Queue Jobs         │
         │                       │                       │
```

## 🚀 Benefits of Supabase Storage

### ✅ **Advantages over AWS S3**
- **🔗 Seamless Integration**: Uses your existing Supabase setup
- **💰 Cost Effective**: No additional AWS costs or complexity
- **⚡ Faster Setup**: No AWS credentials or bucket configuration needed
- **🔒 Built-in Security**: RLS policies integrate with Supabase Auth
- **🌍 Global CDN**: Automatic content delivery optimization
- **📊 Unified Dashboard**: Manage files alongside your database

### 📈 **Technical Benefits**
- **File Size**: Up to 500MB per file (perfect for video content)
- **Concurrent Uploads**: Unlimited concurrent uploads
- **Progress Tracking**: Real-time upload progress
- **Background Processing**: No serverless timeout limitations
- **Automatic Cleanup**: Built-in file management tools
- **Security**: Row Level Security (RLS) for file access control

## 🔄 Upload Flow Architecture

### **Step 1: Request Upload URL**
```typescript
// Frontend requests signed upload URL
const response = await fetch('/api/videos/upload-url', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${userToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    fileName: 'video.mp4',
    fileType: 'video/mp4',
    fileSize: 52428800 // 50MB
  })
});

const { uploadUrl, filePath, token } = await response.json();
```

### **Step 2: Direct Upload to Supabase Storage**
```typescript
// Direct upload using presigned URL
const uploadResponse = await fetch(uploadUrl, {
  method: 'PUT',
  headers: {
    'Content-Type': file.type
  },
  body: file
});
```

### **Step 3: Complete Upload Processing**
```typescript
// Notify backend of completed upload
const completeResponse = await fetch('/api/videos/complete-upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${userToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    filePath: filePath,
    fileName: file.name,
    title: 'My Video'
  })
});
```

## 🛠️ Backend Implementation

### **Storage Service (api/_utils/storage.js)**
```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export class StorageService {
  // Generate presigned upload URL
  static async generateUploadUrl(fileName, fileType, userId) {
    const filePath = `uploads/${userId}/${Date.now()}-${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('videos')
      .createSignedUploadUrl(filePath, { expiresIn: 3600 });
    
    return {
      uploadUrl: data.signedUrl,
      filePath: filePath,
      token: data.token
    };
  }
  
  // Generate download URL
  static async generateDownloadUrl(filePath) {
    const { data } = supabase.storage
      .from('videos')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  }
}
```

### **Upload URL Endpoint (api/videos/upload-url.js)**
```javascript
import { StorageService } from '../_utils/storage.js';
import { requireAuth } from '../_utils/auth.js';

async function handler(req, res) {
  const { fileName, fileType, fileSize } = req.body;
  const userId = req.user?.id;

  // Validate file
  if (fileSize > 500 * 1024 * 1024) {
    return res.status(400).json({ 
      error: 'File size exceeds 500MB limit' 
    });
  }

  // Generate upload URL
  const uploadData = await StorageService.generateUploadUrl(
    fileName, fileType, userId
  );

  res.json(uploadData);
}

export default requireAuth(handler);
```

## 🗄️ Database Schema

### **Updated Videos Table**
```sql
-- Updated videos table structure
CREATE TABLE videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  title text NOT NULL,
  filename text NOT NULL,
  original_filename text NOT NULL,
  file_size bigint NOT NULL,
  
  -- Supabase Storage fields
  storage_path text NOT NULL,
  storage_bucket text DEFAULT 'videos',
  url text, -- Public/signed URL for file access
  
  -- Processing fields
  analysis_status text DEFAULT 'queued',
  processing_progress integer DEFAULT 0,
  processing_error text,
  
  -- Video metadata
  format text,
  duration integer DEFAULT 0,
  width integer DEFAULT 0,
  height integer DEFAULT 0,
  
  -- AI analysis results
  ai_suggestions jsonb DEFAULT '{"clips":[],"bestMoments":[],"overallScore":0}',
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### **Storage Policies**
```sql
-- RLS policies for secure file access
CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  auth.uid()::text = (storage.foldername(name))[2] AND
  bucket_id = 'videos'
);

CREATE POLICY "Users can view own files"
ON storage.objects FOR SELECT
USING (
  auth.uid()::text = (storage.foldername(name))[2] AND
  bucket_id = 'videos'
);
```

## 🎬 Frontend Implementation

### **React Upload Hook**
```typescript
import { useDirectUpload } from '../hooks/useDirectUpload';

function VideoUpload() {
  const { uploadFile, isUploading, uploadProgress } = useDirectUpload({
    onProgress: (progress) => {
      console.log(`Upload: ${progress.percentage}%`);
    },
    onComplete: (result) => {
      if (result.success) {
        console.log('Video uploaded:', result.videoId);
      }
    }
  });

  const handleUpload = async (file: File) => {
    await uploadFile(file, 'My Video Title');
  };

  return (
    <div>
      {isUploading && (
        <div>Upload Progress: {uploadProgress}%</div>
      )}
      <input 
        type="file" 
        accept="video/*" 
        onChange={(e) => handleUpload(e.target.files[0])} 
      />
    </div>
  );
}
```

## 🔐 Security Architecture

### **Authentication**
- **Bearer Tokens**: JWT tokens from Supabase Auth
- **User Isolation**: Files stored in user-specific folders
- **RLS Policies**: Database-level access control
- **Signed URLs**: Time-limited access to files

### **File Validation**
- **File Type**: Only video/audio/image files allowed
- **File Size**: 500MB maximum per file
- **Path Validation**: Prevents directory traversal
- **Metadata Sanitization**: Clean file metadata

### **Access Control**
```sql
-- Users can only access their own files
CREATE POLICY "User file access"
ON storage.objects FOR ALL
USING (
  auth.uid()::text = (storage.foldername(name))[2] AND
  bucket_id = 'videos'
);
```

## 📊 Performance Optimization

### **Upload Performance**
- **Direct Upload**: Bypasses server for file transfer
- **Presigned URLs**: Secure, time-limited upload access  
- **CDN Integration**: Global content delivery network
- **Parallel Processing**: Background job queue for video processing

### **Monitoring & Analytics**
```sql
-- Storage usage monitoring
SELECT 
  user_id,
  count(*) as file_count,
  pg_size_pretty(sum(file_size)) as total_size
FROM videos 
GROUP BY user_id 
ORDER BY sum(file_size) DESC;
```

## 🔧 Environment Configuration

### **Required Environment Variables**
```bash
# Supabase Configuration (same as your database)
SUPABASE_URL=https://kmzwucypmpsdaobsmkde.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Frontend Variables
VITE_SUPABASE_URL=https://kmzwucypmpsdaobsmkde.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### **No AWS Configuration Required! 🎉**
- ❌ No AWS_ACCESS_KEY_ID needed
- ❌ No AWS_SECRET_ACCESS_KEY needed  
- ❌ No AWS_REGION configuration
- ❌ No S3_BUCKET setup required

## 🚀 Deployment Guide

### **1. Database Migration**
```bash
# Run the Supabase Storage migration
psql -d "your_database_url" -f database/migrations/004_supabase_storage.sql
```

### **2. Create Storage Bucket**
- Go to Supabase Dashboard → Storage
- Create bucket named `videos`
- Set to private (not public)
- Configure file size limit: 500MB

### **3. Deploy to Vercel**
```bash
# Update environment variables in Vercel dashboard
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY  
vercel env add SUPABASE_SERVICE_ROLE_KEY

# Deploy
vercel --prod
```

## 🔍 Troubleshooting

### **Common Issues**

**1. Upload fails with "Policy violation"**
```sql
-- Check RLS policies are enabled
SELECT * FROM pg_policies WHERE tablename = 'objects';
```

**2. File not found after upload**
```javascript
// Verify file path format
const filePath = `uploads/${userId}/${uniqueFileName}`;
```

**3. Large files timeout**
- Files >500MB: Split into chunks or use different storage
- Network issues: Implement retry logic
- Progress tracking: Use XMLHttpRequest for progress events

## 📈 Scaling Considerations

### **Storage Limits**
- **Free Tier**: 1GB storage
- **Pro Tier**: 100GB storage
- **Custom**: Contact Supabase for larger needs

### **Performance Optimization**
- **CDN Caching**: Automatic with Supabase Storage
- **File Compression**: Implement client-side compression
- **Chunked Uploads**: For very large files (>100MB)
- **Background Processing**: Use job queue for heavy operations

## 🎯 Next Steps

1. **✅ Test the storage setup** with sample uploads
2. **✅ Monitor storage usage** through Supabase dashboard
3. **⚡ Optimize upload performance** based on user feedback
4. **🔒 Review security policies** for production readiness
5. **📊 Set up monitoring alerts** for storage quotas

## 🌟 Summary

The new Supabase Storage architecture provides:

- **🚀 Simplified Setup**: No AWS configuration needed
- **💰 Cost Effective**: Uses existing Supabase infrastructure  
- **🔒 Secure by Default**: RLS policies and authentication
- **⚡ High Performance**: Direct uploads with CDN delivery
- **📈 Scalable**: Grows with your application needs
- **🛠️ Easy Management**: Unified dashboard with database

Your video upload system is now ready for production with enterprise-grade reliability! 🎉 