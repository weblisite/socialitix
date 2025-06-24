import { ClipModel, VideoModel } from '../_utils/models.js';
import { ShotstackService } from '../_utils/shotstack.js';
import { JobQueue } from '../_utils/jobQueue.js';
import { requireAuth } from '../_utils/auth.js';
import { withCors } from '../_utils/cors.js';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { 
      videoId, 
      startTime, 
      endTime, 
      title, 
      platform = 'tiktok',
      hook = '',
      style = {}
    } = req.body;
    
    const userId = req.user?.id;

    console.log('Generate clip request:', { 
      videoId, 
      startTime, 
      endTime, 
      title, 
      platform, 
      hook,
      userId 
    });

    // Validation
    if (!videoId || startTime === undefined || endTime === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: videoId, startTime, endTime' 
      });
    }

    if (!userId) {
      return res.status(401).json({ 
        error: 'User authentication required' 
      });
    }

    if (startTime >= endTime) {
      return res.status(400).json({ 
        error: 'Start time must be less than end time' 
      });
    }

    if (endTime - startTime > 60) {
      return res.status(400).json({ 
        error: 'Clip duration cannot exceed 60 seconds for viral content' 
      });
    }

    // Get the source video
    console.log('Fetching video:', videoId);
    const video = await VideoModel.findById(videoId);
    
    if (!video) {
      return res.status(404).json({ 
        error: 'Video not found' 
      });
    }

    if (video.user_id !== userId) {
      return res.status(403).json({ 
        error: 'Access denied: Not your video' 
      });
    }

    if (!video.url) {
      return res.status(400).json({ 
        error: 'Video URL not available. Upload may not be complete.' 
      });
    }

    // Create clip record in database first
    const clipData = {
      user_id: userId,
      video_id: videoId,
      title: title || `${video.title} - Clip`,
      description: `Viral ${platform} clip from ${startTime}s to ${endTime}s`,
      start_time: startTime,
      end_time: endTime,
      platform: platform,
      status: 'processing',
      hook: hook,
      type: 'short',
      ai_score: 0, // Will be updated after AI analysis
      views: 0,
      likes: 0,
      shares: 0
    };

    console.log('Creating clip record:', clipData);
    const clip = await ClipModel.create(clipData);
    console.log('Clip record created:', clip.id);

    // Generate clip using Shotstack
    console.log('Starting Shotstack render for clip:', clip.id);
    const renderResult = await ShotstackService.generateClip({
      videoUrl: video.url,
      startTime: startTime,
      endTime: endTime,
      platform: platform,
      hook: hook,
      style: style
    });

    console.log('Shotstack render started:', renderResult);

    // Update clip with render ID
    await ClipModel.update(clip.id, {
      file_path: renderResult.renderId, // Store render ID temporarily
      status: 'rendering'
    });

    // Queue a job to check render status
    console.log('Queuing render status check job');
    const statusJob = await JobQueue.addJob('check_render_status', {
      clipId: clip.id,
      renderId: renderResult.renderId,
      platform: platform,
      userId: userId
    }, 'high');

    console.log('Status check job queued:', statusJob.id);

    // Return immediate response
    res.status(201).json({
      message: 'Clip generation started successfully',
      clip: {
        id: clip.id,
        title: clip.title,
        description: clip.description,
        startTime: clip.start_time,
        endTime: clip.end_time,
        platform: clip.platform,
        status: 'rendering',
        hook: clip.hook,
        renderId: renderResult.renderId,
        estimatedTime: '30-60 seconds',
        created_at: clip.created_at
      },
      render: {
        id: renderResult.renderId,
        status: renderResult.status,
        message: renderResult.message
      },
      jobs: {
        statusCheck: statusJob.id
      }
    });

  } catch (error) {
    console.error('Error generating clip:', error);
    res.status(500).json({ 
      error: 'Failed to generate clip',
      message: error.message 
    });
  }
}

export default withCors(requireAuth(handler)); 