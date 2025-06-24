-- Migration: 005_create_clips_table_simple.sql
-- Description: Create clips table - Simple version without complex dependencies
-- Date: 2024-01-20

-- ============================================
-- Create clips table (essential for API to work)
-- ============================================

CREATE TABLE IF NOT EXISTS clips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    thumbnail TEXT,
    start_time NUMERIC NOT NULL, -- Start time in seconds
    end_time NUMERIC NOT NULL,   -- End time in seconds
    platform TEXT DEFAULT 'tiktok',
    status TEXT DEFAULT 'processing',
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    ai_score INTEGER DEFAULT 0,
    hook TEXT DEFAULT '',
    type TEXT DEFAULT 'short',
    file_path TEXT, -- Path to the generated clip file
    file_size BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create essential indexes for clips table
CREATE INDEX IF NOT EXISTS idx_clips_user_id ON clips(user_id);
CREATE INDEX IF NOT EXISTS idx_clips_video_id ON clips(video_id);
CREATE INDEX IF NOT EXISTS idx_clips_status ON clips(status);
CREATE INDEX IF NOT EXISTS idx_clips_created_at ON clips(created_at);

-- ============================================
-- Enable RLS (Row Level Security) on clips table
-- ============================================

ALTER TABLE clips ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Create RLS policies for clips
-- ============================================

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own clips" ON clips;
DROP POLICY IF EXISTS "Users can insert their own clips" ON clips;
DROP POLICY IF EXISTS "Users can update their own clips" ON clips;
DROP POLICY IF EXISTS "Users can delete their own clips" ON clips;

-- Create new policies
CREATE POLICY "Users can view their own clips" ON clips
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clips" ON clips
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clips" ON clips
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clips" ON clips
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- Create helper function for updated_at
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for clips updated_at
DROP TRIGGER IF EXISTS update_clips_updated_at ON clips;
CREATE TRIGGER update_clips_updated_at
    BEFORE UPDATE ON clips
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Migration completed
-- ============================================

-- Add comment to track this migration
COMMENT ON TABLE clips IS 'AI-generated video clips - Migration 005 Simple';

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Migration 005_create_clips_table_simple.sql completed successfully';
    RAISE NOTICE 'Created clips table with essential schema';
    RAISE NOTICE 'Added RLS policies for data security';
    RAISE NOTICE 'Ready for API to work with clips';
END $$; 