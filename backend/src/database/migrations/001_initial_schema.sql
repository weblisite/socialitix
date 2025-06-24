-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret-here';

-- Create custom types
CREATE TYPE subscription_tier AS ENUM ('free', 'basic', 'pro', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'trial', 'cancelled');
CREATE TYPE user_role AS ENUM ('admin', 'editor', 'viewer');
CREATE TYPE video_format AS ENUM ('tiktok', 'instagram', 'twitter', 'youtube');
CREATE TYPE video_quality AS ENUM ('720p', '1080p', '4k');
CREATE TYPE analysis_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE video_source AS ENUM ('upload', 'youtube');
CREATE TYPE hook_type AS ENUM ('question', 'statement', 'visual', 'audio', 'transition');
CREATE TYPE emotional_tone AS ENUM ('positive', 'negative', 'neutral', 'excited', 'calm');

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  avatar TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  
  -- Subscription details
  subscription_tier subscription_tier DEFAULT 'free',
  subscription_status subscription_status DEFAULT 'active',
  polar_subscription_id TEXT,
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  
  -- Usage tracking
  uploads_used INTEGER DEFAULT 0,
  uploads_limit BIGINT DEFAULT 52428800, -- 50MB for free tier
  clips_used INTEGER DEFAULT 0,
  clips_limit INTEGER DEFAULT 3, -- 3 clips for free tier
  storage_used BIGINT DEFAULT 0,
  storage_limit BIGINT DEFAULT 52428800, -- 50MB for free tier
  
  -- Team and role
  team_id UUID,
  role user_role DEFAULT 'admin',
  
  -- Preferences
  notifications_enabled BOOLEAN DEFAULT TRUE,
  auto_subtitles BOOLEAN DEFAULT FALSE,
  default_format video_format DEFAULT 'tiktok',
  default_quality video_quality DEFAULT '720p',
  
  -- API and authentication
  api_key TEXT UNIQUE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Videos table
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_id UUID,
  
  -- Basic video info
  title VARCHAR(200) NOT NULL,
  description TEXT,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  duration NUMERIC NOT NULL,
  
  -- Video properties
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  format TEXT NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  
  -- Source information
  source video_source DEFAULT 'upload',
  youtube_url TEXT,
  
  -- AI Analysis
  analysis_status analysis_status DEFAULT 'pending',
  transcript TEXT,
  processing_progress INTEGER DEFAULT 0,
  processing_error TEXT,
  
  -- AI Suggestions
  ai_suggestions JSONB DEFAULT '{"clips": [], "bestMoments": [], "overallScore": 0}',
  
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Engagement segments table
CREATE TABLE engagement_segments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  start_time NUMERIC NOT NULL,
  end_time NUMERIC NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  reasons TEXT[] DEFAULT '{}',
  
  -- Audio features
  volume INTEGER CHECK (volume >= 0 AND volume <= 100),
  pitch INTEGER CHECK (pitch >= 0 AND pitch <= 1000),
  speech_rate NUMERIC CHECK (speech_rate >= 0 AND speech_rate <= 10),
  emotional_tone emotional_tone,
  
  -- Visual features
  motion_intensity INTEGER CHECK (motion_intensity >= 0 AND motion_intensity <= 100),
  face_count INTEGER DEFAULT 0,
  scene_change BOOLEAN DEFAULT FALSE,
  text_present BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hooks table
CREATE TABLE hooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  timestamp NUMERIC NOT NULL,
  type hook_type NOT NULL,
  confidence NUMERIC NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  text TEXT,
  description TEXT NOT NULL,
  suggested_clip_start NUMERIC NOT NULL,
  suggested_clip_end NUMERIC NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teams table (for future use)
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_api_key ON users(api_key) WHERE api_key IS NOT NULL;
CREATE INDEX idx_users_subscription_tier ON users(subscription_tier);
CREATE INDEX idx_users_team_id ON users(team_id);

CREATE INDEX idx_videos_user_id ON videos(user_id);
CREATE INDEX idx_videos_team_id ON videos(team_id) WHERE team_id IS NOT NULL;
CREATE INDEX idx_videos_analysis_status ON videos(analysis_status);
CREATE INDEX idx_videos_created_at ON videos(created_at);
CREATE INDEX idx_videos_source ON videos(source);

CREATE INDEX idx_engagement_segments_video_id ON engagement_segments(video_id);
CREATE INDEX idx_engagement_segments_score ON engagement_segments(score);

CREATE INDEX idx_hooks_video_id ON hooks(video_id);
CREATE INDEX idx_hooks_type ON hooks(type);
CREATE INDEX idx_hooks_confidence ON hooks(confidence);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE hooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for videos table
CREATE POLICY "Users can view their own videos" ON videos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own videos" ON videos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own videos" ON videos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own videos" ON videos
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for engagement_segments table
CREATE POLICY "Users can view engagement segments of their videos" ON engagement_segments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM videos 
      WHERE videos.id = engagement_segments.video_id 
      AND videos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert engagement segments for their videos" ON engagement_segments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM videos 
      WHERE videos.id = engagement_segments.video_id 
      AND videos.user_id = auth.uid()
    )
  );

-- RLS Policies for hooks table
CREATE POLICY "Users can view hooks of their videos" ON hooks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM videos 
      WHERE videos.id = hooks.video_id 
      AND videos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert hooks for their videos" ON hooks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM videos 
      WHERE videos.id = hooks.video_id 
      AND videos.user_id = auth.uid()
    )
  );

-- RLS Policies for teams table
CREATE POLICY "Team owners can manage their teams" ON teams
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Team members can view their teams" ON teams
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.team_id = teams.id 
      AND users.id = auth.uid()
    )
  ); 