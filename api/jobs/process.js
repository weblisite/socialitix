import { JobQueue } from '../_utils/jobQueue.js';
import { VideoModel, ClipModel } from '../_utils/models.js';
import { AIService } from '../_utils/aiService.js';
import { ShotstackService } from '../_utils/shotstack.js';
import { StorageService } from '../_utils/storage.js';
import { withCors } from '../_utils/cors.js';

// This endpoint can be called by external job processors or cron jobs
async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Optional: Verify authorization for job processing
    const authToken = req.headers.authorization;
    if (process.env.JOB_PROCESSOR_TOKEN && authToken !== `Bearer ${process.env.JOB_PROCESSOR_TOKEN}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('Processing jobs...');

    // Get next job from queue
    const job = await JobQueue.getNextJob();
    
    if (!job) {
      return res.json({ message: 'No jobs to process' });
    }

    console.log(`Processing job ${job.id}: ${job.type}`);

    let result;
    switch (job.type) {
      case 'analyze_video':
        result = await processVideoAnalysis(job);
        break;
      
      case 'check_render_status':
        result = await processRenderStatusCheck(job);
        break;
        
      case 'generate_clips':
        result = await processClipGeneration(job);
        break;
        
      default:
        throw new Error(`Unknown job type: ${job.type}`);
    }

    // Mark job as completed
    await JobQueue.completeJob(job.id, result);
    
    console.log(`Job ${job.id} completed successfully`);
    
    res.json({
      message: 'Job processed successfully',
      jobId: job.id,
      type: job.type,
      result
    });

  } catch (error) {
    console.error('Job processing error:', error);
    
    // Mark job as failed if we have job info
    if (error.jobId) {
      await JobQueue.failJob(error.jobId, error.message);
    }
    
    res.status(500).json({ 
      error: 'Job processing failed',
      message: error.message 
    });
  }
}

// AI-powered video content analysis
async function processVideoAnalysis(job) {
  try {
    const { videoId, userId } = job.data;
    
    console.log(`Analyzing video ${videoId} for user ${userId}`);
    
    // Get video details
    const video = await VideoModel.findById(videoId);
    if (!video) {
      throw new Error('Video not found');
    }

    // Perform AI analysis using video URL directly
    const analysis = await AIService.analyzeVideo({
      videoId,
      videoUrl: video.url,
      metadata: {
        filename: video.filename,
        fileSize: video.file_size,
        format: video.format
      }
    });

    // Update video with analysis results
    await VideoModel.update(videoId, {
      analysis_status: 'completed',
      ai_suggestions: analysis,
      processing_progress: 100
    });

    return {
      videoId,
      analysis,
      clipsGenerated: analysis.suggestedClips?.length || 0
    };

  } catch (error) {
    error.jobId = job.id;
    throw error;
  }
}

// Check Shotstack render status and update clip records
async function processRenderStatusCheck(job) {
  try {
    const { clipId, renderId, platform, userId } = job.data;
    
    console.log(`Checking render status for clip ${clipId}, render ${renderId}`);
    
    // Check render status with Shotstack
    const renderStatus = await ShotstackService.checkRenderStatus(renderId);
    
    console.log(`Render ${renderId} status:`, renderStatus.status);
    
    // Get the clip record
    const clip = await ClipModel.findById(clipId);
    if (!clip) {
      throw new Error(`Clip ${clipId} not found`);
    }

    if (renderStatus.status === 'done') {
      // Render completed successfully
      console.log(`Render ${renderId} completed. Video URL: ${renderStatus.url}`);
      
      // Update clip with final URL and status
      await ClipModel.update(clipId, {
        status: 'completed',
        url: renderStatus.url,
        file_path: renderStatus.url, // Store final URL
        file_size: 0, // Shotstack doesn't provide file size
        duration: clip.end_time - clip.start_time,
        format: 'mp4',
        processing_progress: 100
      });

      // Queue AI analysis of the generated clip (optional)
      await JobQueue.addJob('analyze_clip', {
        clipId: clipId,
        clipUrl: renderStatus.url,
        platform: platform,
        userId: userId
      }, 'normal');

      return {
        clipId,
        status: 'completed',
        url: renderStatus.url,
        message: 'Clip generated successfully'
      };

    } else if (renderStatus.status === 'failed') {
      // Render failed
      console.error(`Render ${renderId} failed:`, renderStatus.error);
      
      await ClipModel.update(clipId, {
        status: 'failed',
        error: renderStatus.error || 'Render failed',
        processing_progress: 0
      });

      return {
        clipId,
        status: 'failed',
        error: renderStatus.error || 'Render failed'
      };

    } else if (renderStatus.status === 'rendering' || renderStatus.status === 'queued') {
      // Still processing - update progress and requeue
      const progress = renderStatus.status === 'rendering' ? 50 : 25;
      
      await ClipModel.update(clipId, {
        processing_progress: progress
      });

      // Requeue the job to check again in 10 seconds
      await JobQueue.addJob('check_render_status', {
        clipId,
        renderId,
        platform,
        userId
      }, 'high');

      return {
        clipId,
        status: renderStatus.status,
        progress: progress,
        message: 'Render in progress, checking again soon'
      };
    }

    return {
      clipId,
      status: renderStatus.status,
      message: 'Status check completed'
    };

  } catch (error) {
    error.jobId = job.id;
    throw error;
  }
}

// Generate multiple clips using Shotstack cloud processing
async function processClipGeneration(job) {
  try {
    const { videoId, userId, clips, settings } = job.data;
    
    console.log(`Generating ${clips.length} clips for video ${videoId}`);
    
    const video = await VideoModel.findById(videoId);
    if (!video) {
      throw new Error('Video not found');
    }

    const results = [];
    
    for (const clipData of clips) {
      try {
        console.log(`Generating clip: ${clipData.title}`);
        
        // Create clip record
        const clip = await ClipModel.create({
          user_id: userId,
          video_id: videoId,
          title: clipData.title,
          description: clipData.description,
          start_time: clipData.start,
          end_time: clipData.end,
          platform: settings.platforms[0] || 'tiktok', // Use first platform
          status: 'processing',
          type: 'short',
          ai_score: clipData.viralPotential || 0
        });

        // Generate clip with Shotstack
        const renderResult = await ShotstackService.generateClip({
          videoUrl: video.url,
          startTime: clipData.start,
          endTime: clipData.end,
          platform: settings.platforms[0] || 'tiktok',
          hook: clipData.hook || '',
          style: clipData.style || {}
        });

        // Update clip with render ID
        await ClipModel.update(clip.id, {
          file_path: renderResult.renderId,
          status: 'rendering'
        });

        // Queue status check
        await JobQueue.addJob('check_render_status', {
          clipId: clip.id,
          renderId: renderResult.renderId,
          platform: settings.platforms[0] || 'tiktok',
          userId: userId
        }, 'high');

        results.push({
          clipId: clip.id,
          renderId: renderResult.renderId,
          title: clipData.title,
          status: 'queued'
        });

      } catch (clipError) {
        console.error('Error generating individual clip:', clipError);
        results.push({
          title: clipData.title,
          status: 'failed',
          error: clipError.message
        });
      }
    }

    return {
      videoId,
      clipsRequested: clips.length,
      clipsQueued: results.filter(r => r.status === 'queued').length,
      clipsFailed: results.filter(r => r.status === 'failed').length,
      results
    };

  } catch (error) {
    error.jobId = job.id;
    throw error;
  }
}

export default withCors(handler); 