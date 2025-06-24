# Cloud Upload & Background Processing Architecture

This document describes the new architecture for handling large video uploads and background processing in Socialitix using Vercel, AWS S3, and job queues.

## 🏗️ Architecture Overview

### Traditional (Before)
```
Frontend → Vercel API → Processing → Response
```
**Problems:**
- 4.5MB file size limit
- 10-second timeout for serverless functions
- No background processing
- Memory constraints

### New Architecture (After)
```
Frontend → S3 (Direct Upload) → Job Queue → Background Processing → Webhooks
```

## 🚀 Key Features

1. **Direct S3 Uploads**: Files >4.5MB upload directly to cloud storage
2. **Background Job Queue**: Long-running tasks processed asynchronously
3. **Webhook Processing**: External services handle heavy operations
4. **Real-time Status Updates**: Frontend polls for processing status
5. **Scalable Architecture**: No serverless function limitations

## 📁 File Structure

```
api/
├── _utils/
│   ├── storage.js          # AWS S3 utilities
│   ├── jobQueue.js         # Background job management
│   ├── auth.js             # Authentication middleware
│   ├── cors.js             # CORS handling
│   └── models.js           # Database models
├── videos/
│   ├── upload-url.js       # Generate presigned upload URLs
│   ├── complete-upload.js  # Handle upload completion
│   └── status.js           # Video processing status
├── jobs/
│   └── process.js          # Job processor endpoint
├── webhooks/
│   └── video-processing.js # Processing webhooks
└── clips/
    └── index.js            # Clip management

frontend/src/
├── hooks/
│   └── useDirectUpload.ts  # Direct upload React hook
└── pages/
    └── VideoUpload.tsx     # Updated upload component
```

## 🔧 Setup Instructions

### 1. AWS S3 Configuration

Create an S3 bucket and configure the following environment variables:

```bash
# AWS Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-west-2
AWS_S3_BUCKET=socialitix-videos

# Optional webhook security
WEBHOOK_SECRET=your_webhook_secret
JOB_PROCESSOR_TOKEN=your_job_processor_token
```

### 2. S3 Bucket Policy

Set up CORS policy for direct uploads:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::socialitix-videos/*"
    },
    {
      "Sid": "AllowDirectUploads",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::YOUR_ACCOUNT:user/YOUR_USER"
      },
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl"
      ],
      "Resource": "arn:aws:s3:::socialitix-videos/*"
    }
  ]
}
```

### 3. Database Migration

Run the database migration to create the job queue table:

```sql
-- See database/migrations/003_job_queue.sql
```

### 4. Environment Variables

Update your Vercel environment variables:

```bash
# Existing variables
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# New AWS variables
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-west-2
AWS_S3_BUCKET=socialitix-videos

# Optional security tokens
WEBHOOK_SECRET=your_webhook_secret
JOB_PROCESSOR_TOKEN=your_job_processor_token
```

## 🔄 Upload Flow

### 1. Client-Side Upload Process

```typescript
// 1. Request presigned upload URL
const response = await fetch('/api/videos/upload-url', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size
  })
});

// 2. Upload directly to S3
const { uploadUrl, key } = await response.json();
await uploadToS3(file, uploadUrl);

// 3. Notify backend of completion
await fetch('/api/videos/complete-upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    key,
    fileName: file.name,
    title: file.name
  })
});
```

### 2. Backend Processing Flow

```javascript
// 1. Create video record
const video = await VideoModel.create({
  user_id: userId,
  s3_key: key,
  analysis_status: 'queued',
  // ... other fields
});

// 2. Queue processing job
await JobQueue.addJob('process_video', {
  videoId: video.id,
  s3Key: key,
  userId: userId
}, 'high');

// 3. Queue AI analysis job
await JobQueue.addJob('ai_analysis', {
  videoId: video.id,
  s3Key: key
}, 'normal');
```

## 🎯 Job Processing

### Job Types

1. **process_video**: Extract metadata, generate thumbnails
2. **ai_analysis**: AI-powered content analysis
3. **generate_clips**: Create video clips from segments

### Job Processor

The job processor runs as a separate service or cron job:

```bash
# Call the job processor endpoint
curl -X POST https://your-app.vercel.app/api/jobs/process \
  -H "Authorization: Bearer $JOB_PROCESSOR_TOKEN"
```

### External Job Processor

For production, set up an external service to process jobs:

```javascript
// Example using a separate server
const processJobs = async () => {
  const response = await fetch('https://your-app.vercel.app/api/jobs/process', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.JOB_PROCESSOR_TOKEN}`
    }
  });
  
  const result = await response.json();
  if (result.hasJob) {
    console.log('Processed job:', result.jobId);
    // Process next job immediately
    await processJobs();
  } else {
    // Wait before checking again
    setTimeout(processJobs, 10000); // 10 seconds
  }
};
```

## 📊 Monitoring & Status

### Real-time Status Updates

The frontend polls for processing status:

```typescript
const pollProcessingStatus = async (videoId: string) => {
  const response = await fetch(`/api/videos/${videoId}/status`);
  const data = await response.json();
  
  if (data.status === 'completed') {
    // Processing complete
    updateVideoStatus(data);
  } else if (data.status === 'failed') {
    // Handle error
    handleError(data.error);
  } else {
    // Continue polling
    setTimeout(() => pollProcessingStatus(videoId), 5000);
  }
};
```

### Job Queue Monitoring

Monitor job queue status:

```sql
-- Check pending jobs
SELECT type, COUNT(*) FROM job_queue WHERE status = 'pending' GROUP BY type;

-- Check failed jobs
SELECT * FROM job_queue WHERE status = 'failed' ORDER BY created_at DESC;

-- Check processing times
SELECT 
  type, 
  AVG(EXTRACT(EPOCH FROM (completed_at - started_at))) as avg_duration_seconds
FROM job_queue 
WHERE status = 'completed' 
GROUP BY type;
```

## 🚨 Error Handling

### Retry Logic

Jobs are automatically retried up to 3 times:

```javascript
// Job fails -> status = 'failed', attempts++
// If attempts < max_attempts, job can be retried
await JobQueue.retryJob(jobId);
```

### Cleanup

Old completed jobs are cleaned up automatically:

```javascript
// Clean up jobs older than 7 days
await JobQueue.cleanup(7);
```

## 🔐 Security Considerations

1. **Presigned URLs**: Time-limited (1 hour) upload URLs
2. **Authentication**: All endpoints require valid JWT tokens
3. **File Validation**: File type and size validation
4. **Webhook Security**: Optional webhook signature verification
5. **RLS Policies**: Database-level security with Supabase RLS

## 🎛️ Configuration Options

### File Size Limits

```javascript
// Current limit: 500MB
const maxSize = 500 * 1024 * 1024;
```

### Job Priorities

- `high`: Video processing (metadata extraction)
- `normal`: AI analysis
- `low`: Cleanup tasks

### Polling Intervals

- Frontend status polling: 5 seconds
- Job processor: 10 seconds (when queue is empty)

## 📈 Performance Benefits

1. **No File Size Limits**: Upload files up to 500MB
2. **No Timeout Issues**: Background processing removes time constraints
3. **Better User Experience**: Immediate upload confirmation with progress updates
4. **Scalability**: Can handle multiple concurrent uploads and processing jobs
5. **Cost Efficiency**: Only pay for actual processing time

## 🛠️ Deployment

1. Update environment variables in Vercel
2. Run database migration
3. Deploy updated code
4. Set up external job processor (optional)
5. Configure monitoring and alerts

## 🔄 Migration from Old System

The new system is backward compatible. Existing small files will continue to work with the old upload method, while large files automatically use the new direct upload system.

## 📚 Additional Resources

- [AWS S3 Presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables) 