import { supabaseAdmin } from '../_utils/supabase.js';
import { requireAuth } from '../_utils/auth.js';
import { withCors } from '../_utils/cors.js';

async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const { data: clips, error } = await supabaseAdmin
        .from('clips')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)
        .range(offset, offset + limit - 1);

      if (error) throw error;

      res.json({
        clips: clips || [],
        pagination: {
          page,
          limit,
          total: clips?.length || 0,
          pages: Math.ceil((clips?.length || 0) / limit)
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