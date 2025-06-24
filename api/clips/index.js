import { supabaseAdmin } from '../_utils/supabase.js';
import { requireAuth } from '../_utils/auth.js';
import { withCors } from '../_utils/cors.js';

// Helper function to format duration in seconds to MM:SS format
function formatDuration(seconds) {
  if (!seconds || seconds < 0) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const userId = req.user?.id;
      console.log('Clips GET request for user:', userId);
      
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      console.log('Fetching clips with params:', { page, limit, offset, userId });
      
      const { data: clips, error } = await supabaseAdmin
        .from('clips')
        .select(`
          *,
          videos!inner(title, filename)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Supabase error fetching clips:', error);
        throw error;
      }
      
      console.log('Raw clips data:', clips?.length || 0, 'clips found');

      // Transform the data to match frontend expectations
      const transformedClips = (clips || []).map(clip => ({
        id: clip.id,
        title: clip.title,
        thumbnail: clip.thumbnail || '', // Will be empty until thumbnails are generated
        duration: clip.duration ? formatDuration(clip.end_time - clip.start_time) : '0:00',
        createdDate: clip.created_at,
        sourceVideo: clip.videos?.title || clip.videos?.filename || 'Unknown',
        platform: clip.platform || 'tiktok',
        status: clip.status || 'processing',
        views: clip.views || 0,
        likes: clip.likes || 0,
        shares: clip.shares || 0,
        aiScore: clip.ai_score || 0,
        hook: clip.hook || clip.description || '',
        startTime: clip.start_time || 0,
        endTime: clip.end_time || 0,
        videoId: clip.video_id,
        type: clip.type || 'short'
      }));

      res.json({
        clips: transformedClips,
        pagination: {
          page,
          limit,
          total: transformedClips.length,
          pages: Math.ceil(transformedClips.length / limit)
        }
      });

    } catch (error) {
      console.error('Failed to fetch clips', error);
      res.status(500).json({ error: 'Failed to fetch clips' });
    }
  } else if (req.method === 'POST') {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { video_id, start_time, end_time, title, description } = req.body;

      if (!video_id || start_time === undefined || end_time === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const { data: clip, error } = await supabaseAdmin
        .from('clips')
        .insert({
          user_id: userId,
          video_id,
          start_time,
          end_time,
          title: title || `Clip ${Date.now()}`,
          description: description || '',
          status: 'processing'
        })
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({ clip });

    } catch (error) {
      console.error('Failed to create clip', error);
      res.status(500).json({ error: 'Failed to create clip' });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}

export default withCors(requireAuth(handler)); 