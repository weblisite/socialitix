import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

interface EngagementSegment {
  id: string;
  video_id: string;
  start_time: number;
  end_time: number;
  score: number;
  description?: string;
  videos: {
    id: string;
    title: string;
    filename: string;
    thumbnail_url?: string;
    duration: number;
    created_at: string;
    user_id: string;
  };
}

interface Hook {
  id: string;
  video_id: string;
  timestamp: number;
  text: string;
  confidence: number;
  description: string;
  videos: {
    id: string;
    title: string;
    filename: string;
    thumbnail_url?: string;
    duration: number;
    created_at: string;
    user_id: string;
  };
}

interface Clip {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  createdDate: string;
  sourceVideo: string;
  platform: string;
  status: string;
  views: number;
  likes: number;
  shares: number;
  aiScore: number;
  hook: string;
  startTime: number;
  endTime: number;
  videoId: string;
  type: string;
}

const router = Router();

// Get all clips for user
router.get('/', async (req: any, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Fetch clips from engagement_segments table (these represent potential clips)
    const { data: segments, error: segmentsError } = await supabase
      .from('engagement_segments')
      .select(`
        *,
        videos!inner(
          id,
          title,
          filename,
          thumbnail_url,
          duration,
          created_at,
          user_id
        )
      `)
      .eq('videos.user_id', userId)
      .order('score', { ascending: false });

    if (segmentsError) {
      logger.error('Failed to fetch engagement segments', { error: segmentsError });
      return res.status(500).json({ error: 'Failed to fetch clips' });
    }

         // Fetch hooks for additional clip data
     const { data: hooks, error: hooksError } = await supabase
       .from('hooks')
       .select(`
         *,
         videos!inner(
           id,
           title,
           filename,
           thumbnail_url,
           duration,
           created_at,
           user_id
         )
       `)
       .eq('videos.user_id', userId)
       .order('confidence', { ascending: false });

    if (hooksError) {
      logger.error('Failed to fetch hooks', { error: hooksError });
    }

    // Transform engagement segments into clips
    const clips: Clip[] = segments.map((segment: EngagementSegment) => ({
      id: `segment-${segment.id}`,
      title: `${segment.videos.title} - Segment`,
      thumbnail: segment.videos.thumbnail_url || 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400',
      duration: formatDuration(segment.end_time - segment.start_time),
      createdDate: segment.videos.created_at,
      sourceVideo: segment.videos.title,
      platform: 'tiktok', // Default platform - could be made configurable
      status: 'ready' as const,
      views: Math.floor(Math.random() * 50000), // Mock data for now
      likes: Math.floor(Math.random() * 5000),
      shares: Math.floor(Math.random() * 1000),
      aiScore: Math.round(segment.score * 100),
      hook: segment.description || 'AI-generated engaging moment',
      startTime: segment.start_time,
      endTime: segment.end_time,
      videoId: segment.video_id,
      type: 'engagement'
    }));

    // Add hooks as potential clips
    if (hooks) {
      const hookClips = hooks.map((hook: Hook) => ({
        id: `hook-${hook.id}`,
        title: `${hook.videos.title} - Hook`,
        thumbnail: hook.videos.thumbnail_url || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400',
        duration: '0:15', // Hooks are typically short
        createdDate: hook.videos.created_at,
        sourceVideo: hook.videos.title,
        platform: 'instagram' as const,
        status: 'ready' as const,
        views: Math.floor(Math.random() * 30000),
        likes: Math.floor(Math.random() * 3000),
        shares: Math.floor(Math.random() * 500),
        aiScore: Math.round(hook.confidence * 100),
        hook: hook.text || hook.description,
        startTime: hook.timestamp,
        endTime: hook.timestamp + 15, // Assume 15 second clips for hooks
        videoId: hook.video_id,
        type: 'hook'
      }));
      clips.push(...hookClips);
    }

    // Sort by AI score descending
    clips.sort((a: Clip, b: Clip) => b.aiScore - a.aiScore);

    res.json({
      clips: clips,
      total: clips.length
    });

  } catch (error) {
    logger.error('Failed to fetch clips', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: 'Failed to fetch clips' });
  }
});

// Create new clip from engagement segment or hook
router.post('/', async (req: any, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { videoId, startTime, endTime, title, platform = 'tiktok' } = req.body;

    if (!videoId || startTime === undefined || endTime === undefined) {
      return res.status(400).json({ error: 'videoId, startTime, and endTime are required' });
    }

    // Verify user owns the video
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .select('id, user_id, title, filename')
      .eq('id', videoId)
      .eq('user_id', userId)
      .single();

    if (videoError || !video) {
      return res.status(404).json({ error: 'Video not found or access denied' });
    }

    // In a real implementation, you would:
    // 1. Create the actual clip file using video processing
    // 2. Store clip metadata in a clips table
    // 3. Return the clip details

    // For now, return mock success response
    const clipId = `clip-${Date.now()}`;
    const clip = {
      id: clipId,
      title: title || `${video.title} - Clip`,
      videoId: videoId,
      startTime: startTime,
      endTime: endTime,
      duration: formatDuration(endTime - startTime),
      platform: platform,
      status: 'processing',
      createdAt: new Date().toISOString()
    };

    res.status(201).json({
      success: true,
      message: 'Clip creation started',
      clip: clip
    });

  } catch (error) {
    logger.error('Failed to create clip', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: 'Failed to create clip' });
  }
});

// Test endpoint to create sample engagement segments and hooks
router.post('/test-data', async (req: any, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get user's videos
    const { data: videos, error: videosError } = await supabase
      .from('videos')
      .select('id, title, duration')
      .eq('user_id', userId);

    if (videosError || !videos || videos.length === 0) {
      return res.status(404).json({ error: 'No videos found for user' });
    }

    // Create sample engagement segments and hooks for each video
    const segments = [];
    const hooks = [];

    for (const video of videos) {
      const videoDuration = video.duration || 30; // Default to 30 seconds if no duration

      // Create 2-3 engagement segments per video
      const numSegments = Math.min(3, Math.floor(videoDuration / 10)); // One segment per 10 seconds, max 3
      
      for (let i = 0; i < numSegments; i++) {
        const startTime = (videoDuration / numSegments) * i;
        const endTime = Math.min(startTime + 8 + Math.random() * 7, videoDuration); // 8-15 second segments
        
        segments.push({
          video_id: video.id,
          start_time: startTime,
          end_time: endTime,
          score: Math.floor(70 + Math.random() * 30), // Score between 70-100
          reasons: ['high_engagement', 'visual_interest'],
          volume: Math.floor(60 + Math.random() * 40),
          speech_rate: 1.2 + Math.random() * 0.8,
          emotional_tone: ['positive', 'excited', 'neutral'][Math.floor(Math.random() * 3)],
          motion_intensity: Math.floor(50 + Math.random() * 50),
          face_count: Math.floor(Math.random() * 3),
          scene_change: Math.random() > 0.5,
          text_present: Math.random() > 0.7
        });
      }

      // Create 1-2 hooks per video
      const numHooks = Math.min(2, Math.floor(videoDuration / 15)); // One hook per 15 seconds, max 2
      
      for (let i = 0; i < numHooks; i++) {
        const timestamp = (videoDuration / (numHooks + 1)) * (i + 1); // Distribute hooks evenly
        
        const hookTexts = [
          "Wait, you won't believe what happens next...",
          "This changes everything!",
          "The secret nobody talks about...",
          "Here's what they don't want you to know...",
          "This will blow your mind..."
        ];
        
        const hookDescriptions = [
          "Strong opening hook with curiosity gap",
          "Attention-grabbing statement",
          "Mystery and intrigue builder",
          "Controversial angle hook",
          "Surprise element introduction"
        ];

        hooks.push({
          video_id: video.id,
          timestamp: timestamp,
          type: ['question', 'statement', 'visual'][Math.floor(Math.random() * 3)],
          confidence: 0.7 + Math.random() * 0.3, // Confidence between 0.7-1.0
          text: hookTexts[Math.floor(Math.random() * hookTexts.length)],
          description: hookDescriptions[Math.floor(Math.random() * hookDescriptions.length)],
          suggested_clip_start: Math.max(0, timestamp - 2),
          suggested_clip_end: Math.min(videoDuration, timestamp + 13) // 15 second clips
        });
      }
    }

    // Insert engagement segments
    const { error: segmentsError } = await supabase
      .from('engagement_segments')
      .insert(segments);

    if (segmentsError) {
      logger.error('Failed to insert engagement segments', { error: segmentsError });
      return res.status(500).json({ error: 'Failed to create test segments' });
    }

    // Insert hooks
    const { error: hooksError } = await supabase
      .from('hooks')
      .insert(hooks);

    if (hooksError) {
      logger.error('Failed to insert hooks', { error: hooksError });
      return res.status(500).json({ error: 'Failed to create test hooks' });
    }

    res.json({
      success: true,
      message: 'Test data created successfully',
      created: {
        videos: videos.length,
        segments: segments.length,
        hooks: hooks.length
      }
    });

  } catch (error) {
    logger.error('Failed to create test data', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: 'Failed to create test data' });
  }
});

// Helper function to format duration
function formatDuration(seconds: number): string {
  if (seconds === 0) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export default router; 