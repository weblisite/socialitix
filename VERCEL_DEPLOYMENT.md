# Vercel Deployment Guide

This project is configured to deploy on Vercel with both frontend and backend (serverless functions) in a single repository.

## Project Structure

```
├── api/                    # Vercel serverless functions
│   ├── _utils/            # Shared utilities
│   │   ├── supabase.js    # Supabase configuration
│   │   ├── auth.js        # Authentication middleware
│   │   ├── cors.js        # CORS configuration
│   │   └── models.js      # Database models
│   ├── auth/              # Authentication endpoints
│   │   ├── login.js
│   │   ├── register.js
│   │   └── profile.js
│   ├── videos/            # Video management endpoints
│   │   └── index.js
│   ├── health.js          # Health check endpoint
│   └── package.json       # API dependencies
├── frontend/              # React frontend
├── vercel.json           # Vercel configuration
└── package.json          # Root package.json
```

## Deployment Steps

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Connect to Vercel
```bash
vercel login
```

### 3. Initialize Project
```bash
vercel
```

### 4. Set Environment Variables
In your Vercel dashboard or via CLI, set the following environment variables:

```bash
# Supabase
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY

# Frontend
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_API_URL

# Optional: External Services
vercel env add AWS_ACCESS_KEY_ID
vercel env add AWS_SECRET_ACCESS_KEY
vercel env add AWS_REGION
vercel env add STRIPE_SECRET_KEY
vercel env add STRIPE_WEBHOOK_SECRET
```

### 5. Deploy
```bash
vercel --prod
```

## API Endpoints

After deployment, your API endpoints will be available at:
- `https://your-app.vercel.app/api/health` - Health check
- `https://your-app.vercel.app/api/auth/login` - User login
- `https://your-app.vercel.app/api/auth/register` - User registration
- `https://your-app.vercel.app/api/auth/profile` - User profile
- `https://your-app.vercel.app/api/videos` - Video management

## Local Development

### 1. Install Dependencies
```bash
npm run install-deps
```

### 2. Set Environment Variables
Copy `.env.example` to `.env.local` and fill in your values.

### 3. Run Development Server
```bash
npm run dev
```

This will start:
- Frontend on `http://localhost:3000`
- Vercel dev server with API functions

### 4. Test API Locally
```bash
vercel dev
```

## Configuration Files

### vercel.json
- Configures build settings
- Sets up routing between frontend and API
- Defines function timeout limits

### API Functions
- All functions are in the `/api` directory
- Use ES modules (`.js` files with `type: "module"`)
- Include CORS headers for cross-origin requests
- Include authentication middleware where needed

## Migration Notes

This setup migrates your Express.js backend to Vercel serverless functions:

1. **Express Routes → API Functions**: Each route becomes a separate function
2. **Middleware**: Converted to utility functions that wrap handlers
3. **Database**: Continues using Supabase (no changes needed)
4. **File Uploads**: Limited by Vercel's 4.5MB payload limit for serverless functions
5. **Background Jobs**: Need to be handled via external services or webhooks

## Limitations

- **File Size**: 4.5MB limit for request payloads (affects video uploads)
- **Execution Time**: 30-second timeout for serverless functions
- **State**: Functions are stateless (no persistent memory between requests)
- **WebSockets**: Not supported in serverless functions

## Recommendations

For large file uploads and long-running processes:
1. Use direct client-side uploads to cloud storage (S3, Google Cloud Storage)
2. Use webhooks for processing notifications
3. Consider Vercel Edge Functions for WebSocket-like functionality
4. Use external job queues for background processing

## Troubleshooting

### Build Errors
- Check that all dependencies are listed in `api/package.json`
- Ensure ES module syntax is used consistently
- Verify environment variables are set

### Runtime Errors
- Check Vercel function logs in the dashboard
- Ensure CORS headers are properly set
- Verify Supabase connection strings

### Performance Issues
- Monitor function execution time
- Optimize database queries
- Consider caching strategies 