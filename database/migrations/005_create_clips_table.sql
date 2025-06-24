-- Migration: 005_create_clips_table.sql
-- Description: Create clips table and other missing tables for full application functionality
-- Date: 2024-01-20

-- ============================================
-- Create clips table
-- ============================================

CREATE TABLE IF NOT EXISTS clips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    thumbnail TEXT,
    duration INTERVAL,
    start_time NUMERIC NOT NULL, -- Start time in seconds
    end_time NUMERIC NOT NULL,   -- End time in seconds
    platform TEXT CHECK (platform IN ('tiktok', 'instagram', 'youtube', 'twitter', 'linkedin')) DEFAULT 'tiktok',
    status TEXT CHECK (status IN ('ready', 'processing', 'failed')) DEFAULT 'processing',
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    ai_score INTEGER DEFAULT 0 CHECK (ai_score >= 0 AND ai_score <= 100),
    hook TEXT DEFAULT '',
    type TEXT DEFAULT 'short',
    file_path TEXT, -- Path to the generated clip file
    file_size BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for clips table
CREATE INDEX IF NOT EXISTS idx_clips_user_id ON clips(user_id);
CREATE INDEX IF NOT EXISTS idx_clips_video_id ON clips(video_id);
CREATE INDEX IF NOT EXISTS idx_clips_status ON clips(status);
CREATE INDEX IF NOT EXISTS idx_clips_platform ON clips(platform);
CREATE INDEX IF NOT EXISTS idx_clips_created_at ON clips(created_at);
CREATE INDEX IF NOT EXISTS idx_clips_ai_score ON clips(ai_score);

-- ============================================
-- Create/Update users table
-- ============================================

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add columns if they don't exist
DO $$ 
BEGIN
    -- Add subscription_plan column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'subscription_plan') THEN
        ALTER TABLE users ADD COLUMN subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'pro', 'enterprise'));
    END IF;
    
    -- Add subscription_status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'subscription_status') THEN
        ALTER TABLE users ADD COLUMN subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired'));
    END IF;
    
    -- Add storage_used column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'storage_used') THEN
        ALTER TABLE users ADD COLUMN storage_used BIGINT DEFAULT 0;
    END IF;
    
    -- Add storage_limit column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'storage_limit') THEN
        ALTER TABLE users ADD COLUMN storage_limit BIGINT DEFAULT 5368709120; -- 5GB in bytes
    END IF;
END $$;

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_subscription_plan ON users(subscription_plan);

-- ============================================
-- Create videos table if it doesn't exist
-- ============================================

CREATE TABLE IF NOT EXISTS videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    file_size BIGINT DEFAULT 0,
    storage_path TEXT,
    storage_bucket TEXT DEFAULT 'videos',
    url TEXT,
    thumbnail_url TEXT,
    duration NUMERIC DEFAULT 0, -- Duration in seconds
    width INTEGER DEFAULT 0,
    height INTEGER DEFAULT 0,
    format TEXT DEFAULT 'mp4',
    analysis_status TEXT DEFAULT 'pending' CHECK (analysis_status IN ('pending', 'queued', 'processing', 'completed', 'failed')),
    processing_progress INTEGER DEFAULT 0 CHECK (processing_progress >= 0 AND processing_progress <= 100),
    processing_error TEXT,
    ai_suggestions JSONB DEFAULT '{"clips": [], "bestMoments": [], "overallScore": 0}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for videos table
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_analysis_status ON videos(analysis_status);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at);
CREATE INDEX IF NOT EXISTS idx_videos_storage_path ON videos(storage_path);

-- ============================================
-- Enable RLS (Row Level Security) on all tables
-- ============================================

ALTER TABLE clips ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Create RLS policies (with conflict handling)
-- ============================================

-- Clips policies (drop and recreate to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own clips" ON clips;
DROP POLICY IF EXISTS "Users can insert their own clips" ON clips;
DROP POLICY IF EXISTS "Users can update their own clips" ON clips;
DROP POLICY IF EXISTS "Users can delete their own clips" ON clips;

CREATE POLICY "Users can view their own clips" ON clips
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clips" ON clips
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clips" ON clips
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clips" ON clips
    FOR DELETE USING (auth.uid() = user_id);

-- Users policies (drop and recreate to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;

CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Videos policies (drop and recreate to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own videos" ON videos;
DROP POLICY IF EXISTS "Users can insert their own videos" ON videos;
DROP POLICY IF EXISTS "Users can update their own videos" ON videos;
DROP POLICY IF EXISTS "Users can delete their own videos" ON videos;

CREATE POLICY "Users can view their own videos" ON videos
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own videos" ON videos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own videos" ON videos
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own videos" ON videos
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- Create helper functions
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at (drop existing first to avoid conflicts)
DROP TRIGGER IF EXISTS update_clips_updated_at ON clips;
CREATE TRIGGER update_clips_updated_at
    BEFORE UPDATE ON clips
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_videos_updated_at ON videos;
CREATE TRIGGER update_videos_updated_at
    BEFORE UPDATE ON videos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Create views for analytics
-- ============================================

-- User analytics view (created after columns are added)
DO $$
BEGIN
    -- Only create the view if subscription_plan column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'users' AND column_name = 'subscription_plan') THEN
        
        CREATE OR REPLACE VIEW user_analytics AS
        SELECT 
            u.id,
            u.email,
            u.full_name,
            u.subscription_plan,
            COUNT(DISTINCT v.id) as total_videos,
            COUNT(DISTINCT c.id) as total_clips,
            COALESCE(SUM(v.file_size), 0) as storage_used_bytes,
            pg_size_pretty(COALESCE(SUM(v.file_size), 0)) as storage_used_human,
            AVG(c.ai_score) as avg_ai_score,
            SUM(c.views) as total_views,
            SUM(c.likes) as total_likes,
            SUM(c.shares) as total_shares
        FROM users u
        LEFT JOIN videos v ON u.id = v.user_id
        LEFT JOIN clips c ON v.id = c.video_id
        GROUP BY u.id, u.email, u.full_name, u.subscription_plan;
        
    ELSE
        -- Create a simpler view without subscription_plan
        CREATE OR REPLACE VIEW user_analytics AS
        SELECT 
            u.id,
            u.email,
            u.full_name,
            'free'::text as subscription_plan,
            COUNT(DISTINCT v.id) as total_videos,
            COUNT(DISTINCT c.id) as total_clips,
            COALESCE(SUM(v.file_size), 0) as storage_used_bytes,
            pg_size_pretty(COALESCE(SUM(v.file_size), 0)) as storage_used_human,
            AVG(c.ai_score) as avg_ai_score,
            SUM(c.views) as total_views,
            SUM(c.likes) as total_likes,
            SUM(c.shares) as total_shares
        FROM users u
        LEFT JOIN videos v ON u.id = v.user_id
        LEFT JOIN clips c ON v.id = c.video_id
        GROUP BY u.id, u.email, u.full_name;
    END IF;
END $$;

-- Clip performance view
CREATE OR REPLACE VIEW clip_performance AS
SELECT 
    c.*,
    v.title as source_video_title,
    v.filename as source_video_filename,
    (c.end_time - c.start_time) as clip_duration_seconds,
    CASE 
        WHEN c.views > 0 THEN (c.likes::float / c.views::float) * 100
        ELSE 0
    END as engagement_rate
FROM clips c
JOIN videos v ON c.video_id = v.id;

-- ============================================
-- Migration completed
-- ============================================

-- Add comments to track this migration
COMMENT ON TABLE clips IS 'AI-generated video clips - Migration 005';
COMMENT ON TABLE users IS 'User profiles and subscription info - Migration 005';
COMMENT ON TABLE videos IS 'Video uploads and processing status - Migration 005';

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Migration 005_create_clips_table.sql completed successfully';
    RAISE NOTICE 'Created clips table with full schema';
    RAISE NOTICE 'Created users table with subscription management';
    RAISE NOTICE 'Enhanced videos table with processing fields';
    RAISE NOTICE 'Added RLS policies for data security';
    RAISE NOTICE 'Created analytics views for reporting';
END $$; 