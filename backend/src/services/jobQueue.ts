import Bull from 'bull';
import { videoProcessingService } from './videoProcessingService.js';
import { VideoModel } from '../models/Video.js';
import { AIService } from './aiService.js';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'job-queue.log' })
  ]
});

// Redis connection configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  lazyConnect: true
};

// Create job queues
export const videoProcessingQueue = new Bull('video processing', {
  redis: redisConfig,
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 5,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  }
});

export const aiAnalysisQueue = new Bull('ai analysis', {
  redis: redisConfig,
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 5,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  }
});

// Job interfaces
interface VideoProcessingJobData {
  videoId: string;
  filePath: string;
  userId: string;
  options: {
    extractAudio?: boolean;
    generateThumbnails?: boolean;
    createClips?: boolean;
  };
}

interface AIAnalysisJobData {
  videoId: string;
  audioPath?: string;
  userId: string;
}

// Video processing job handler
videoProcessingQueue.process('process-video', async (job) => {
  const { videoId, filePath, userId, options }: VideoProcessingJobData = job.data;
  
  try {
    logger.info('Starting video processing job', { videoId, userId });
    
    // Update job progress
    await job.progress(10);
    
    // Update video status to processing
    await VideoModel.update(videoId, {
      analysis_status: 'processing',
      processing_progress: 10
    });
    
    // Process the video
    const result = await videoProcessingService.processVideo(videoId, filePath);
    
    await job.progress(60);
    
    if (!result.success) {
      throw new Error(result.error || 'Video processing failed');
    }
    
    // Update video with processing results
    const updateData: any = {
      analysis_status: 'processing',
      processing_progress: 60,
      thumbnail_url: result.thumbnailPath,
      duration: result.metadata?.duration,
      width: result.metadata?.width,
      height: result.metadata?.height,
      fps: result.metadata?.fps,
      bitrate: result.metadata?.bitrate
    };
    
    await VideoModel.update(videoId, updateData);
    await job.progress(70);
    
    // Queue AI analysis if audio was extracted
    if (result.audioPath && options.extractAudio !== false) {
      await aiAnalysisQueue.add('analyze-audio', {
        videoId,
        audioPath: result.audioPath,
        userId
      }, {
        priority: getUserPriority(userId),
        delay: 1000 // Small delay to ensure video update is complete
      });
    }
    
    await job.progress(100);
    logger.info('Video processing job completed', { videoId, userId });
    
    return {
      success: true,
      videoId,
      thumbnailPath: result.thumbnailPath,
      audioPath: result.audioPath,
      clips: result.clips
    };
    
  } catch (error) {
    logger.error('Video processing job failed', { 
      videoId, 
      userId, 
      error: error instanceof Error ? error.message : String(error) 
    });
    
    // Update video status to failed
    await VideoModel.update(videoId, {
      analysis_status: 'failed',
      processing_error: error instanceof Error ? error.message : String(error)
    });
    
    throw error;
  }
});

// AI analysis job handler
aiAnalysisQueue.process('analyze-audio', async (job) => {
  const { videoId, audioPath, userId }: AIAnalysisJobData = job.data;
  
  try {
    logger.info('Starting AI analysis job', { videoId, userId });
    
    await job.progress(10);
    
    // Perform AI analysis
    const aiService = new AIService();
    const analysis = await aiService.analyzeAudio(audioPath || '');
    
    await job.progress(50);
    
    // Update video with AI analysis results
    const updateData = {
      analysis_status: 'completed' as const,
      processing_progress: 100,
      transcript: analysis.transcript,
      ai_suggestions: {
        clips: analysis.clips || [],
        bestMoments: analysis.bestMoments || [],
        overallScore: analysis.overallScore || 0,
        hooks: analysis.hooks || [],
        topics: analysis.topics || []
      }
    };
    
    await VideoModel.update(videoId, updateData);
    await job.progress(80);
    
    // Save engagement segments to database
    if (analysis.engagementSegments && analysis.engagementSegments.length > 0) {
      for (const segment of analysis.engagementSegments) {
        // Insert engagement segment (would need proper database insertion)
        logger.info('Saving engagement segment', { videoId, segment });
      }
    }
    
    // Save hooks to database
    if (analysis.hooks && analysis.hooks.length > 0) {
      for (const hook of analysis.hooks) {
        // Insert hook (would need proper database insertion)
        logger.info('Saving hook', { videoId, hook });
      }
    }
    
    await job.progress(100);
    logger.info('AI analysis job completed', { videoId, userId });
    
    return {
      success: true,
      videoId,
      transcript: analysis.transcript,
      clips: analysis.clips,
      hooks: analysis.hooks
    };
    
  } catch (error) {
    logger.error('AI analysis job failed', { 
      videoId, 
      userId, 
      error: error instanceof Error ? error.message : String(error) 
    });
    
    // Update video status - still mark as completed but with analysis error
    await VideoModel.update(videoId, {
      analysis_status: 'completed',
      processing_progress: 100,
      processing_error: `AI analysis failed: ${error instanceof Error ? error.message : String(error)}`
    });
    
    throw error;
  }
});

// Utility functions
async function getUserPriority(userId: string): Promise<number> {
  // Get user's subscription tier to determine priority
  // Higher tier = higher priority (lower number in Bull)
  try {
    // This would typically fetch from database
    // For now, return default priority
    return 0; // Normal priority
  } catch (error) {
    logger.error('Failed to get user priority:', error);
    return 10; // Low priority fallback
  }
}

// Queue management functions
export async function addVideoProcessingJob(data: VideoProcessingJobData, priority: number = 0) {
  return videoProcessingQueue.add('process-video', data, {
    priority,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  });
}

export async function addAIAnalysisJob(data: AIAnalysisJobData, priority: number = 0) {
  return aiAnalysisQueue.add('analyze-audio', data, {
    priority,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  });
}

// Queue monitoring
export function getQueueStats() {
  return Promise.all([
    videoProcessingQueue.getJobCounts(),
    aiAnalysisQueue.getJobCounts()
  ]).then(([videoStats, aiStats]) => ({
    videoProcessing: videoStats,
    aiAnalysis: aiStats
  }));
}

// Graceful shutdown
export async function closeQueues() {
  await Promise.all([
    videoProcessingQueue.close(),
    aiAnalysisQueue.close()
  ]);
  logger.info('Job queues closed');
}

// Error handling
videoProcessingQueue.on('failed', (job, err) => {
  logger.error('Video processing job failed', {
    jobId: job.id,
    videoId: job.data.videoId,
    error: err.message
  });
});

aiAnalysisQueue.on('failed', (job, err) => {
  logger.error('AI analysis job failed', {
    jobId: job.id,
    videoId: job.data.videoId,
    error: err.message
  });
});

// Success logging
videoProcessingQueue.on('completed', (job, result) => {
  logger.info('Video processing job completed', {
    jobId: job.id,
    videoId: job.data.videoId,
    duration: Date.now() - job.timestamp
  });
});

aiAnalysisQueue.on('completed', (job, result) => {
  logger.info('AI analysis job completed', {
    jobId: job.id,
    videoId: job.data.videoId,
    duration: Date.now() - job.timestamp
  });
});

logger.info('Job queues initialized'); 