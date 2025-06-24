# Supabase Migration Guide

This document outlines the steps to migrate from MongoDB to Supabase for the Socialitix platform.

## Overview

The migration includes:
- Database migration from MongoDB to PostgreSQL (via Supabase)
- Authentication migration from JWT to Supabase Auth
- File storage migration to Supabase Storage
- Integration with Supabase MCP for AI development

## Prerequisites

1. Create a Supabase account at https://supabase.com
2. Create a new Supabase project
3. Install the Supabase CLI (optional but recommended)

## Step 1: Create Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Choose your organization
4. Enter project name: "socialitix"
5. Enter a strong database password
6. Choose your region
7. Click "Create new project"

## Step 2: Get Project Credentials

From your Supabase project dashboard:

1. Go to Settings > API
2. Copy the following values:
   - Project URL
   - Anon (public) key
   - Service role (secret) key

## Step 3: Set Environment Variables

Create a `.env` file in the backend directory:

```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Other existing environment variables...
```

Create a `.env` file in the frontend directory:

```bash
# Frontend Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Step 4: Run Database Migrations

1. Go to your Supabase project dashboard
2. Click on "SQL Editor"
3. Copy and paste the contents of `backend/src/database/migrations/001_initial_schema.sql`
4. Click "Run" to execute the migration

## Step 5: Configure Supabase MCP (for AI Development)

1. Create a Personal Access Token in Supabase:
   - Go to Account Settings > Access Tokens
   - Click "Generate new token"
   - Give it a name like "Cursor MCP"
   - Copy the token

2. Configure MCP in Cursor:
   - Create `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--read-only",
        "--project-ref=your_project_ref"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "your_personal_access_token"
      }
    }
  }
}
```

Replace `your_project_ref` with your project reference (found in Settings > General).

## Step 6: Install Dependencies

Backend:
```bash
cd backend
npm install
```

Frontend:
```bash
cd frontend
npm install
```

## Step 7: Update Authentication Flow

The authentication has been updated to use Supabase Auth:

- Registration now creates users in Supabase Auth + custom user profiles
- Login uses Supabase session tokens
- Password reset and email verification handled by Supabase
- Row Level Security (RLS) enabled for data protection

## Step 8: Test the Migration

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend:
```bash
cd frontend
npm run dev
```

3. Test user registration and login
4. Verify data is being stored in Supabase

## Key Changes Made

### Backend Changes:
- Replaced Mongoose with Supabase client
- Updated User and Video models to use PostgreSQL
- Modified authentication middleware for Supabase tokens
- Updated auth routes to use Supabase Auth API

### Frontend Changes:
- Added Supabase client configuration
- Updated auth store to use Supabase Auth
- Modified user interface to match new data structure

### Database Schema:
- Migrated from MongoDB documents to PostgreSQL tables
- Added proper relationships and constraints
- Implemented Row Level Security (RLS)
- Added indexes for performance

## Storage Migration (Optional)

To migrate file storage to Supabase Storage:

1. Create storage buckets in Supabase Dashboard
2. Update file upload logic to use Supabase Storage API
3. Migrate existing files from current storage solution

## Benefits of Migration

1. **Integrated Solution**: Database, auth, and storage in one platform
2. **Better Performance**: PostgreSQL with optimized queries
3. **Real-time Features**: Built-in realtime subscriptions
4. **Row Level Security**: Database-level security policies
5. **AI Integration**: Direct MCP integration for AI development
6. **Scalability**: Automatic scaling and backups
7. **Developer Experience**: Better tooling and dashboard

## Troubleshooting

### Common Issues:

1. **Environment Variables**: Ensure all Supabase credentials are set correctly
2. **CORS Issues**: Check Supabase project settings for allowed origins
3. **RLS Policies**: Verify Row Level Security policies are properly configured
4. **Migration Errors**: Check SQL syntax and run migrations step by step

### Support:
- Supabase Documentation: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- GitHub Issues: Create issues in the project repository

## Next Steps

1. Test all functionality thoroughly
2. Migrate existing data from MongoDB (if any)
3. Set up monitoring and alerts
4. Configure backups and disaster recovery
5. Optimize database performance
6. Implement real-time features using Supabase subscriptions 