# Database Setup Guide

This guide will help you set up the database tables needed for Socialitix to work properly.

## Prerequisites

1. You should have already set up your Supabase project
2. You should have the Supabase URL and service role key in your environment variables

## Running Migrations

The database migrations need to be run in your Supabase SQL Editor in the following order:

### Step 1: Job Queue (if not already done)
```sql
-- Run: database/migrations/003_job_queue.sql
```

### Step 2: Supabase Storage Migration (if not already done)
```sql
-- Run: database/migrations/004_supabase_storage_simplified.sql
```

### Step 3: Create Missing Tables
```sql
-- Run: database/migrations/005_create_clips_table.sql
```

## How to Run Migrations

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Create a new query
4. Copy and paste the SQL from each migration file
5. Run the query
6. Repeat for each migration file in order

## Verifying Setup

After running all migrations, you should have these tables:
- `users` - User profiles and subscription info
- `videos` - Video uploads and processing status  
- `clips` - AI-generated video clips
- `job_queue` - Background job processing

You can verify by running:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';
```

## Troubleshooting

### Error: "relation does not exist"
This means the table hasn't been created yet. Make sure you've run all the migration files in order.

### Error: "permission denied"
This usually means you're not using the service role key. Make sure your environment variables are set correctly.

### Error: "already exists"
This is usually safe to ignore - it means the table or policy already exists.

## Storage Setup

Don't forget to also set up your Supabase Storage:

1. Create a bucket named `videos` 
2. Set up RLS policies for the bucket
3. Configure unlimited file size if needed

See `SUPABASE_STORAGE_SETUP.md` for detailed storage setup instructions. 