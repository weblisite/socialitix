# 🏗️ Project Structure - Serverless Architecture

## 📁 Current Structure (Serverless-Only)

```
Socialitix/
├── api/                          # 🚀 Vercel Serverless Functions
│   ├── _utils/                   # 🔧 Shared utilities
│   │   ├── supabase.js          # Database connection
│   │   ├── auth.js              # Authentication middleware
│   │   ├── cors.js              # CORS handling
│   │   ├── models.js            # Database models
│   │   ├── storage.js           # AWS S3 utilities
│   │   ├── jobQueue.js          # Background job management
│   │   └── aiService.js         # AI analysis service
│   ├── auth/                    # 🔐 Authentication endpoints
│   │   ├── login.js
│   │   ├── register.js
│   │   └── profile.js
│   ├── videos/                  # 🎬 Video management
│   │   ├── index.js             # List videos
│   │   ├── upload-url.js        # Generate upload URLs
│   │   ├── complete-upload.js   # Complete upload process
│   │   └── status.js            # Video processing status
│   ├── clips/                   # ✂️ Clip management
│   │   ├── index.js             # List clips
│   │   └── generate.js          # Generate clips
│   ├── ai/                      # 🤖 AI services
│   │   └── analyze.js           # AI analysis endpoint
│   ├── jobs/                    # ⚙️ Background processing
│   │   └── process.js           # Job processor
│   ├── webhooks/                # 🔗 Webhook handlers
│   │   └── video-processing.js  # Processing webhooks
│   ├── health.js                # ❤️ Health check
│   └── package.json             # API dependencies
├── frontend/                    # ⚛️ React Frontend
│   ├── src/
│   │   ├── components/          # UI components
│   │   ├── pages/               # Page components
│   │   ├── hooks/               # Custom React hooks
│   │   │   └── useDirectUpload.ts # Direct S3 upload hook
│   │   ├── lib/                 # Utilities
│   │   └── stores/              # State management
│   ├── package.json
│   └── vite.config.ts
├── database/                    # 🗄️ Database migrations
│   └── migrations/
│       ├── 001_initial_schema.sql
│       ├── 002_clips_schema.sql
│       └── 003_job_queue.sql
├── vercel.json                  # ⚡ Vercel configuration
├── package.json                 # Root package.json
└── README.md
```

## 🚫 Deprecated Structure (To Be Removed)

```
❌ backend/                      # DEPRECATED - Express.js server
❌ netlify/                      # DEPRECATED - Netlify functions
❌ docker-compose.yml            # DEPRECATED - Docker setup
❌ render.yaml                   # DEPRECATED - Render deployment
❌ railway.json                  # DEPRECATED - Railway deployment
```

## 🎯 Architecture Benefits

### ✅ **Serverless-Only Advantages**
- **No server management**: Zero DevOps overhead
- **Auto-scaling**: Handles traffic spikes automatically  
- **Cost efficient**: Pay only for actual usage
- **Global distribution**: Edge functions worldwide
- **Zero cold starts**: Optimized for performance

### 🚀 **New Capabilities**
- **Large file uploads**: Direct S3 uploads up to 500MB
- **Background processing**: Job queue for long-running tasks
- **Real-time updates**: Webhook-driven status updates
- **No timeout limits**: External processing for heavy operations

## 📋 **Migration Checklist**

### ✅ **Completed**
- [x] Created serverless API functions in `/api`
- [x] Migrated authentication system
- [x] Implemented direct S3 uploads
- [x] Created background job queue
- [x] Added webhook processing
- [x] Updated frontend for new architecture

### 🧹 **Cleanup Tasks**
- [ ] Remove `backend/` directory
- [ ] Remove `netlify/` directory  
- [ ] Remove Docker files
- [ ] Remove other deployment configs
- [ ] Update documentation

## 🔄 **API Endpoint Mapping**

### Old (Express) → New (Serverless)
```
POST /auth/login          → POST /api/auth/login
POST /auth/register       → POST /api/auth/register
GET  /auth/profile        → GET  /api/auth/profile
POST /videos/upload       → POST /api/videos/upload-url + /api/videos/complete-upload
GET  /videos              → GET  /api/videos
POST /clips/generate      → POST /api/clips/generate
GET  /health              → GET  /api/health
```

## 📦 **Dependencies**

### API Dependencies (`api/package.json`)
```json
{
  "@supabase/supabase-js": "^2.50.0",
  "@aws-sdk/client-s3": "^3.490.0", 
  "@aws-sdk/s3-request-presigner": "^3.490.0"
}
```

### Frontend Dependencies (Unchanged)
- React + Vite
- TypeScript
- Tailwind CSS
- Supabase client

## 🌍 **Environment Variables**

### Required for Vercel Deployment
```bash
# Database
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Cloud Storage
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-west-2
AWS_S3_BUCKET=socialitix-videos

# Security (Optional)
WEBHOOK_SECRET=your_webhook_secret
JOB_PROCESSOR_TOKEN=your_job_processor_token
```

## 🚀 **Deployment Commands**

```bash
# Install dependencies
npm run install-deps

# Development
npm run dev              # Start Vercel dev server

# Build & Deploy
npm run build           # Build frontend
vercel                  # Deploy to Vercel
```

## 📊 **Performance Comparison**

| Metric | Old (Express) | New (Serverless) |
|--------|---------------|------------------|
| Max file size | 4.5MB | 500MB |
| Request timeout | 10s | No limit* |
| Cold start | ~2s | ~100ms |
| Scaling | Manual | Automatic |
| Cost | Fixed | Pay-per-use |

*Background processing via job queue

## 🔍 **Monitoring**

### Health Checks
```bash
curl https://your-app.vercel.app/api/health
```

### Job Queue Status
```sql
SELECT status, COUNT(*) FROM job_queue GROUP BY status;
```

### Performance Metrics
- Monitor via Vercel Dashboard
- Track job processing times
- Monitor S3 upload success rates

## 🆘 **Troubleshooting**

### Common Issues
1. **Large upload fails**: Check S3 permissions and CORS
2. **Job stuck**: Check job processor is running
3. **Authentication errors**: Verify JWT tokens
4. **CORS issues**: Update allowed origins in API

### Debug Tools
```bash
# Check logs
vercel logs your-app

# Test endpoints
curl -X POST https://your-app.vercel.app/api/jobs/process
```

This streamlined architecture eliminates the complexity of managing separate backend infrastructure while providing better performance and scalability! 