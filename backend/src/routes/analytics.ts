import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

const router = Router();

interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

// Get user analytics dashboard data
router.get('/dashboard', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get video statistics
    const { data: videos, error: videosError } = await supabase
      .from('videos')
      .select('id, created_at, duration, file_size, analysis_status, view_count')
      .eq('user_id', userId);

    if (videosError) {
      logger.error('Failed to fetch videos for analytics:', videosError);
      return res.status(500).json({ error: 'Failed to fetch analytics data' });
    }

    // Get engagement segments statistics
    const { data: segments, error: segmentsError } = await supabase
      .from('engagement_segments')
      .select(`
        id, score, start_time, end_time,
        videos!inner(user_id)
      `)
      .eq('videos.user_id', userId);

    if (segmentsError) {
      logger.error('Failed to fetch engagement segments:', segmentsError);
    }

    // Get hooks statistics
    const { data: hooks, error: hooksError } = await supabase
      .from('hooks')
      .select(`
        id, confidence, timestamp,
        videos!inner(user_id)
      `)
      .eq('videos.user_id', userId);

    if (hooksError) {
      logger.error('Failed to fetch hooks:', hooksError);
    }

    // Calculate analytics
    const totalVideos = videos?.length || 0;
    const totalDuration = videos?.reduce((sum, video) => sum + (video.duration || 0), 0) || 0;
    const totalSize = videos?.reduce((sum, video) => sum + (video.file_size || 0), 0) || 0;
    const totalViews = videos?.reduce((sum, video) => sum + (video.view_count || 0), 0) || 0;
    
    const completedVideos = videos?.filter(v => v.analysis_status === 'completed').length || 0;
    const processingVideos = videos?.filter(v => v.analysis_status === 'processing').length || 0;
    const failedVideos = videos?.filter(v => v.analysis_status === 'failed').length || 0;

    const averageEngagementScore = segments && segments.length > 0 
      ? segments.reduce((sum, seg) => sum + (seg.score || 0), 0) / segments.length 
      : 0;

    const averageHookConfidence = hooks && hooks.length > 0
      ? hooks.reduce((sum, hook) => sum + (hook.confidence || 0), 0) / hooks.length
      : 0;

    // Video upload trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentVideos = videos?.filter(video => 
      new Date(video.created_at) >= thirtyDaysAgo
    ) || [];

    // Group by day for trend chart
    const uploadTrends = recentVideos.reduce((acc: any, video) => {
      const date = new Date(video.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const analytics = {
      overview: {
        totalVideos,
        totalDuration: Math.round(totalDuration),
        totalSize: Math.round(totalSize / (1024 * 1024)), // MB
        totalViews,
        completedVideos,
        processingVideos,
        failedVideos,
        successRate: totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0
      },
      engagement: {
        averageEngagementScore: Math.round(averageEngagementScore * 100) / 100,
        totalEngagementSegments: segments?.length || 0,
        averageHookConfidence: Math.round(averageHookConfidence * 100) / 100,
        totalHooks: hooks?.length || 0
      },
      trends: {
        uploadTrends: Object.entries(uploadTrends).map(([date, count]) => ({
          date,
          uploads: count
        })).sort((a, b) => a.date.localeCompare(b.date))
      },
      performance: {
        averageProcessingTime: 0, // TODO: Calculate from processing logs
        averageVideoLength: totalVideos > 0 ? Math.round(totalDuration / totalVideos) : 0,
        averageFileSize: totalVideos > 0 ? Math.round(totalSize / totalVideos / (1024 * 1024)) : 0
      }
    };

    res.json({ analytics });

  } catch (error) {
    logger.error('Analytics dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

// Get video performance metrics
router.get('/videos/:id/metrics', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    const videoId = req.params.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Verify video ownership
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .eq('user_id', userId)
      .single();

    if (videoError || !video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Get engagement segments for this video
    const { data: segments, error: segmentsError } = await supabase
      .from('engagement_segments')
      .select('*')
      .eq('video_id', videoId)
      .order('start_time');

    // Get hooks for this video
    const { data: hooks, error: hooksError } = await supabase
      .from('hooks')
      .select('*')
      .eq('video_id', videoId)
      .order('timestamp');

    const metrics = {
      video: {
        id: video.id,
        title: video.title,
        duration: video.duration,
        views: video.view_count || 0,
        likes: video.like_count || 0,
        shares: video.share_count || 0,
        comments: video.comment_count || 0
      },
      engagement: {
        segments: segments || [],
        hooks: hooks || [],
        averageEngagement: segments && segments.length > 0 
          ? segments.reduce((sum, seg) => sum + seg.score, 0) / segments.length 
          : 0,
        peakEngagement: segments && segments.length > 0 
          ? Math.max(...segments.map(seg => seg.score)) 
          : 0,
        engagementDistribution: segments?.map(seg => ({
          timestamp: seg.start_time,
          score: seg.score,
          duration: seg.end_time - seg.start_time
        })) || []
      },
      recommendations: {
        bestClipTimes: segments?.filter(seg => seg.score > 0.7)
          .slice(0, 5)
          .map(seg => ({
            startTime: seg.start_time,
            endTime: seg.end_time,
            score: seg.score,
            reason: seg.description || 'High engagement segment'
          })) || [],
        improvementAreas: [] // TODO: Add AI-based improvement suggestions
      }
    };

    res.json({ metrics });

  } catch (error) {
    logger.error('Video metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch video metrics' });
  }
});

// Track video view
router.post('/videos/:id/view', authenticateToken, async (req: any, res) => {
  try {
    const videoId = req.params.id;
    const userId = req.user?.id;

    // Update view count
    const { error } = await supabase
      .from('videos')
      .update({ 
        view_count: supabase.raw('COALESCE(view_count, 0) + 1'),
        last_viewed_at: new Date().toISOString()
      })
      .eq('id', videoId);

    if (error) {
      logger.error('Failed to track video view:', error);
      return res.status(500).json({ error: 'Failed to track view' });
    }

    // Log view event for analytics
    logger.info('Video view tracked', { videoId, userId });

    res.json({ success: true, message: 'View tracked' });

  } catch (error) {
    logger.error('View tracking error:', error);
    res.status(500).json({ error: 'Failed to track view' });
  }
});

// Get engagement trends
router.get('/engagement/trends', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const days = parseInt(req.query.days as string) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get engagement data over time
    const { data: engagementData, error } = await supabase
      .from('engagement_segments')
      .select(`
        score, start_time, end_time, created_at,
        videos!inner(user_id, created_at)
      `)
      .eq('videos.user_id', userId)
      .gte('videos.created_at', startDate.toISOString());

    if (error) {
      logger.error('Failed to fetch engagement trends:', error);
      return res.status(500).json({ error: 'Failed to fetch engagement trends' });
    }

    // Group by day and calculate average engagement
    const trendData = engagementData?.reduce((acc: any, segment) => {
      const date = new Date(segment.videos.created_at).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { scores: [], count: 0 };
      }
      acc[date].scores.push(segment.score);
      acc[date].count++;
      return acc;
    }, {}) || {};

    const trends = Object.entries(trendData).map(([date, data]: [string, any]) => ({
      date,
      averageEngagement: data.scores.reduce((sum: number, score: number) => sum + score, 0) / data.scores.length,
      segmentCount: data.count
    })).sort((a, b) => a.date.localeCompare(b.date));

    res.json({ trends });

  } catch (error) {
    logger.error('Engagement trends error:', error);
    res.status(500).json({ error: 'Failed to fetch engagement trends' });
  }
});

export default router; 