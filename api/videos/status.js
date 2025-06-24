import { VideoModel } from '../_utils/models.js';
import { requireAuth } from '../_utils/auth.js';
import { withCors } from '../_utils/cors.js';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Extract video ID from URL path
    const { videoId } = req.query;
    const userId = req.user?.id;

    if (!videoId) {
      return res.status(400).json({ 
        error: 'Video ID is required' 
      });
    }

    // Get video by ID and ensure it belongs to the user
    const video = await VideoModel.findById(videoId, userId);
    
    if (!video) {
      return res.status(404).json({ 
        error: 'Video not found or access denied' 
      });
    }

    res.json({
      id: video.id,
      status: video.analysis_status,
      progress: video.processing_progress || 0,
      duration: video.duration,
      width: video.width,
      height: video.height,
      thumbnail_url: video.thumbnail_url,
      ai_suggestions: video.ai_suggestions,
      error: video.processing_error,
    });

  } catch (error) {
    console.error('Error fetching video status:', error);
    res.status(500).json({ 
      error: 'Failed to fetch video status',
      message: error.message 
    });
  }
}

export default withCors(requireAuth(handler)); 