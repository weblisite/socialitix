-- Create job queue table for background processing
CREATE TABLE IF NOT EXISTS job_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL,
    data JSONB NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    result JSONB
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_job_queue_status ON job_queue(status);
CREATE INDEX IF NOT EXISTS idx_job_queue_priority ON job_queue(priority);
CREATE INDEX IF NOT EXISTS idx_job_queue_type ON job_queue(type);
CREATE INDEX IF NOT EXISTS idx_job_queue_created_at ON job_queue(created_at);

-- Create composite index for job selection
CREATE INDEX IF NOT EXISTS idx_job_queue_selection 
ON job_queue(status, priority, created_at) 
WHERE status = 'pending' AND attempts < max_attempts;

-- Add RLS policies
ALTER TABLE job_queue ENABLE ROW LEVEL SECURITY;

-- Only allow backend services to manage jobs
CREATE POLICY "Backend services can manage jobs" ON job_queue
    FOR ALL USING (auth.role() = 'service_role');

-- Add columns to videos table for cloud storage
ALTER TABLE videos 
ADD COLUMN IF NOT EXISTS s3_key TEXT,
ADD COLUMN IF NOT EXISTS s3_bucket TEXT,
ADD COLUMN IF NOT EXISTS processing_progress INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS processing_error TEXT; 