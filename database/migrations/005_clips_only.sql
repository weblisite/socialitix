-- Migration: 005_clips_only.sql
-- Description: Create ONLY the clips table - minimal migration to fix API
-- Date: 2024-01-20

-- ============================================
-- Create clips table ONLY
-- ============================================

CREATE TABLE IF NOT EXISTS clips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    thumbnail TEXT,
    start_time NUMERIC NOT NULL,
    end_time NUMERIC NOT NULL,
    platform TEXT DEFAULT 'tiktok',
    status TEXT DEFAULT 'processing',
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    ai_score INTEGER DEFAULT 0,
    hook TEXT DEFAULT '',
    type TEXT DEFAULT 'short',
    file_path TEXT,
    file_size BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_clips_user_id ON clips(user_id);
CREATE INDEX IF NOT EXISTS idx_clips_video_id ON clips(video_id);
CREATE INDEX IF NOT EXISTS idx_clips_created_at ON clips(created_at);

-- Enable RLS
ALTER TABLE clips ENABLE ROW LEVEL SECURITY;

-- Create policies (only for clips table)
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

-- Create update trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for clips
DROP TRIGGER IF EXISTS update_clips_updated_at ON clips;
CREATE TRIGGER update_clips_updated_at
    BEFORE UPDATE ON clips
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Done
SELECT 'Clips table created successfully!' as result; 