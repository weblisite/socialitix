import { VideoModel } from '../_utils/models.js';
import { JobQueue } from '../_utils/jobQueue.js';
import { withCors } from '../_utils/cors.js';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Verify webhook signature if needed
    const signature = req.headers['x-webhook-signature'];
    const expectedSignature = process.env.WEBHOOK_SECRET;
    
    if (expectedSignature && signature !== expectedSignature) {
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    const { 
      jobId, 
      videoId, 
      status, 
      progress, 
      result, 
      error: processingError 
    } = req.body;

    if (!jobId || !videoId || !status) {
      return res.status(400).json({ 
        error: 'Missing required fields: jobId, videoId, status' 
      });
    }

    // Update job status
    if (status === 'completed') {
      await JobQueue.completeJob(jobId, result);
    } else if (status === 'failed') {
      await JobQueue.failJob(jobId, processingError || 'Processing failed');
    }

    // Update video status
    const videoUpdates = {
      analysis_status: status,
      processing_progress: progress || (status === 'completed' ? 100 : 0),
    };

    if (status === 'failed') {
      videoUpdates.processing_error = processingError || 'Processing failed';
    }

    if (status === 'completed' && result) {
      // Update video with processing results
      if (result.duration) videoUpdates.duration = result.duration;
      if (result.width) videoUpdates.width = result.width;
      if (result.height) videoUpdates.height = result.height;
      if (result.thumbnail_url) videoUpdates.thumbnail_url = result.thumbnail_url;
      if (result.ai_suggestions) videoUpdates.ai_suggestions = result.ai_suggestions;
    }

    await VideoModel.update(videoId, videoUpdates);

    // If processing completed successfully, trigger AI analysis if not already done
    if (status === 'completed' && result && !result.ai_analysis_triggered) {
      await JobQueue.addJob('ai_analysis', {
        videoId,
        s3Key: result.s3Key,
        duration: result.duration,
        metadata: result.metadata,
      }, 'normal');
    }

    res.json({ 
      message: 'Webhook processed successfully',
      videoId,
      status 
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ 
      error: 'Failed to process webhook',
      message: error.message 
    });
  }
}

export default withCors(handler); 