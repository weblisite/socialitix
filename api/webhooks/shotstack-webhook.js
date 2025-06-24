import { ClipModel } from '../_utils/models.js';
import { JobQueue } from '../_utils/jobQueue.js';
import { withCors } from '../_utils/cors.js';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Verify webhook signature if needed
    const signature = req.headers['x-shotstack-signature'];
    const expectedSignature = process.env.SHOTSTACK_WEBHOOK_SECRET;
    
    if (expectedSignature && signature !== expectedSignature) {
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    const { 
      id: renderId,
      status, 
      url,
      error: renderError,
      data 
    } = req.body;

    if (!renderId || !status) {
      return res.status(400).json({ 
        error: 'Missing required fields: renderId, status' 
      });
    }

    console.log(`Shotstack webhook: Render ${renderId} status: ${status}`);

    // Find the clip by render ID (stored in file_path during processing)
    const clip = await ClipModel.findByRenderID(renderId);
    
    if (!clip) {
      console.warn(`No clip found for render ID: ${renderId}`);
      return res.status(404).json({ 
        error: 'Clip not found for render ID' 
      });
    }

    // Update clip based on render status
    if (status === 'done') {
      // Render completed successfully
      await ClipModel.update(clip.id, {
        status: 'completed',
        url: url,
        file_path: url, // Store final URL
        processing_progress: 100,
        error: null
      });

      // Queue AI analysis of the generated clip (optional)
      await JobQueue.addJob('analyze_clip', {
        clipId: clip.id,
        clipUrl: url,
        platform: clip.platform,
        userId: clip.user_id
      }, 'normal');

      console.log(`Clip ${clip.id} completed successfully: ${url}`);

    } else if (status === 'failed') {
      // Render failed
      await ClipModel.update(clip.id, {
        status: 'failed',
        error: renderError || 'Render failed',
        processing_progress: 0
      });

      console.error(`Clip ${clip.id} render failed:`, renderError);

    } else if (status === 'rendering') {
      // Still processing
      await ClipModel.update(clip.id, {
        status: 'rendering',
        processing_progress: 50
      });

      console.log(`Clip ${clip.id} is rendering...`);
    }

    res.json({ 
      message: 'Shotstack webhook processed successfully',
      renderId,
      status,
      clipId: clip.id
    });

  } catch (error) {
    console.error('Error processing Shotstack webhook:', error);
    res.status(500).json({ 
      error: 'Failed to process webhook',
      message: error.message 
    });
  }
}

export default withCors(handler); 