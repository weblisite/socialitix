import { VideoModel } from '../_utils/models.js';
import { requireAuth } from '../_utils/auth.js';
import { withCors } from '../_utils/cors.js';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const videos = await VideoModel.findByUserId(userId, limit, offset);

    // Transform database videos to match frontend expectations
    const transformedVideos = videos.map(video => ({
      id: video.id,
      title: video.title,
      filename: video.filename,
      original_filename: video.original_filename,
      status: video.analysis_status,
      progress: video.processing_progress,
      duration: video.duration,
      file_size: video.file_size,
      url: video.url,
      thumbnail_url: video.thumbnail_url,
      created_at: video.created_at,
      updated_at: video.updated_at
    }));

    res.json({
      videos: transformedVideos,
      pagination: {
        page,
        limit,
        total: videos.length,
        pages: Math.ceil(videos.length / limit)
      }
    });

  } catch (error) {
    console.error('Failed to fetch videos', error);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
}

export default withCors(requireAuth(handler)); 