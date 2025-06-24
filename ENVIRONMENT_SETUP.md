# 🌍 Environment Variables Setup Guide

## 📋 Overview

With the new serverless architecture, environment variables are managed differently than the old backend setup. This guide covers the complete environment setup for both **local development** and **production deployment**.

## 🏗️ Architecture Changes

**Before (Backend/Frontend Split):**
- `backend/env.example` - Server environment variables
- `frontend/env.example` - Client environment variables

**After (Serverless):**
- Root `env.example` - All environment variables
- Vercel Dashboard - Production environment variables

## 🛠️ Local Development Setup

### 1. Copy Environment Template
```bash
# Copy the template
cp env.example .env.local

# Edit with your values
nano .env.local  # or your preferred editor
```

### 2. Required Variables for Local Development

#### 🗄️ **Database (Required)**
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Frontend also needs these with VITE_ prefix
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

#### ☁️ **Cloud Storage (Required for uploads)**
```bash
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-west-2
AWS_S3_BUCKET=socialitix-videos
```

#### 🎯 **Local API URL**
```bash
VITE_API_BASE_URL=http://localhost:3000/api
```

## 🚀 Production Deployment (Vercel)

### Option 1: Vercel Dashboard
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable from the list below

### Option 2: Vercel CLI
```bash
# Set environment variables via CLI
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
vercel env add AWS_ACCESS_KEY_ID
# ... etc
```

### Option 3: Bulk Import
Create a `.env.production` file and import:
```bash
vercel env pull .env.production
```

## 📝 Complete Environment Variables List

### 🔴 **Required Variables**

#### Database
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Frontend versions
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Cloud Storage
```bash
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-west-2
AWS_S3_BUCKET=socialitix-videos
```

### 🟡 **Optional Variables**

#### AI Services
```bash
ASSEMBLYAI_API_KEY=your_assemblyai_key
OPENAI_API_KEY=sk-proj-your_openai_key
```

#### Security
```bash
JWT_SECRET=your_super_secret_jwt_key_here
WEBHOOK_SECRET=webhook_secret_for_validation
JOB_PROCESSOR_TOKEN=secure_token_for_job_processor
```

#### Analytics
```bash
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
MIXPANEL_TOKEN=your_mixpanel_token
```

## 🎯 Environment Variable Scope

### Frontend (VITE_ prefix)
These variables are available in the React app:
```bash
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_API_BASE_URL
VITE_GA_TRACKING_ID
```

### API (No prefix)
These variables are available in serverless functions:
```bash
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
JWT_SECRET
```

## 🔄 Migration from Old Setup

If you have existing environment files:

### From backend/env.example
```bash
# Old location
backend/.env

# New location  
.env.local (for development)
# OR Vercel Dashboard (for production)
```

### From frontend/env.example
The frontend `env.example` is still valid but consolidated into the root `env.example`.

## 🧪 Testing Environment Setup

### 1. Test Database Connection
```bash
# In your terminal
node -e "
const { createClient } = require('@supabase/supabase-js');
const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
console.log('Database connected:', !!client);
"
```

### 2. Test S3 Connection
```bash
# Test S3 access
curl -X GET "http://localhost:3000/api/health"
```

### 3. Test API Endpoints
```bash
# Test authentication
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

## 🚨 Security Best Practices

### ✅ **Do:**
- Use `.env.local` for development (never commit)
- Use Vercel Dashboard for production variables
- Rotate secrets regularly
- Use different databases for dev/staging/prod

### ❌ **Don't:**
- Commit `.env` files to Git
- Use production keys in development
- Share environment variables in chat/email
- Use weak JWT secrets

## 🔧 Troubleshooting

### Common Issues

**1. "Database connection failed"**
```bash
# Check these variables are set
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY
```

**2. "S3 upload failed"**
```bash
# Check AWS credentials
aws s3 ls s3://$AWS_S3_BUCKET
```

**3. "API calls failing in frontend"**
```bash
# Check API base URL
echo $VITE_API_BASE_URL
```

**4. "Environment variables undefined"**
- Frontend: Must use `VITE_` prefix
- API: No prefix needed
- Check Vercel deployment settings

## 📁 File Structure

```
Socialitix/
├── env.example              # 📝 Template file
├── .env.local               # 🔒 Local development (gitignored)
├── frontend/
│   └── env.example          # 📝 Legacy (can be removed)
└── api/
    └── (uses root env vars)
```

## 🎉 Next Steps

1. **Copy template**: `cp env.example .env.local`
2. **Fill in values**: Edit `.env.local` with your actual keys
3. **Test locally**: `npm run dev`
4. **Deploy to Vercel**: Set production variables in dashboard
5. **Verify deployment**: Test all API endpoints

Your serverless environment is now properly configured! 🚀 