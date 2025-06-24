import { ClipModel } from '../_utils/models.js';
import { ShotstackService } from '../_utils/shotstack.js';
import { requireAuth } from '../_utils/auth.js';
import { withCors } from '../_utils/cors.js';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { clipId } = req.query;
    const userId = req.user?.id;

    if (!clipId) {
      return res.status(400).json({ 
        error: 'Clip ID is required' 
      });
    }

    if (!userId) {
      return res.status(401).json({ 
        error: 'User authentication required' 
      });
    }

    console.log(`Checking status for clip ${clipId} by user ${userId}`);

    // Get clip from database
    const clip = await ClipModel.findById(clipId);
    
    if (!clip) {
      return res.status(404).json({ 
        error: 'Clip not found' 
      });
    }

    if (clip.user_id !== userId) {
      return res.status(403).json({ 
        error: 'Access denied: Not your clip' 
      });
    }

    // If clip is already completed, return the stored data
    if (clip.status === 'completed') {
      return res.json({
        id: clip.id,
        status: 'completed',
        url: clip.url,
        title: clip.title,
        description: clip.description,
        platform: clip.platform,
        duration: clip.duration,
        progress: 100,
        created_at: clip.created_at,
        completed_at: clip.updated_at
      });
    }

    // If clip failed, return error info
    if (clip.status === 'failed') {
      return res.json({
        id: clip.id,
        status: 'failed',
        error: clip.error || 'Clip generation failed',
        title: clip.title,
        platform: clip.platform,
        created_at: clip.created_at
      });
    }

    // If clip is still processing, check with Shotstack
    if (clip.status === 'rendering' || clip.status === 'processing') {
      const renderId = clip.file_path; // We stored the render ID here temporarily
      
      if (renderId && renderId.length > 10) { // Shotstack render IDs are longer
        try {
          console.log(`Checking Shotstack render status for ${renderId}`);
          const renderStatus = await ShotstackService.checkRenderStatus(renderId);
          
          // Update clip with latest status
          if (renderStatus.status === 'done') {
            await ClipModel.update(clipId, {
              status: 'completed',
              url: renderStatus.url,
              file_path: renderStatus.url,
              processing_progress: 100
            });
            
            return res.json({
              id: clip.id,
              status: 'completed',
              url: renderStatus.url,
              title: clip.title,
              description: clip.description,
              platform: clip.platform,
              duration: clip.end_time - clip.start_time,
              progress: 100,
              created_at: clip.created_at,
              completed_at: new Date().toISOString()
            });
          } else if (renderStatus.status === 'failed') {
            await ClipModel.update(clipId, {
              status: 'failed',
              error: renderStatus.error || 'Render failed'
            });
            
            return res.json({
              id: clip.id,
              status: 'failed',
              error: renderStatus.error || 'Render failed',
              title: clip.title,
              platform: clip.platform,
              created_at: clip.created_at
            });
          } else {
            // Still processing
            const progress = renderStatus.progress || clip.processing_progress || 0;
            
            await ClipModel.update(clipId, {
              processing_progress: progress
            });
            
            return res.json({
              id: clip.id,
              status: renderStatus.status,
              progress: progress,
              title: clip.title,
              description: clip.description,
              platform: clip.platform,
              estimatedTime: '30-60 seconds',
              created_at: clip.created_at,
              message: 'Clip is being generated...'
            });
          }
        } catch (shotStackError) {
          console.error('Error checking Shotstack status:', shotStackError);
          // Fall through to return database status
        }
      }
    }

    // Return current database status
    res.json({
      id: clip.id,
      status: clip.status,
      progress: clip.processing_progress || 0,
      title: clip.title,
      description: clip.description,
      platform: clip.platform,
      url: clip.url,
      error: clip.error,
      created_at: clip.created_at,
      updated_at: clip.updated_at
    });

  } catch (error) {
    console.error('Error checking clip status:', error);
    res.status(500).json({ 
      error: 'Failed to check clip status',
      message: error.message 
    });
  }
}

export default withCors(requireAuth(handler)); 