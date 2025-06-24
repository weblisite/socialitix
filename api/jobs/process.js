import { JobQueue } from '../_utils/jobQueue.js';
import { VideoModel } from '../_utils/models.js';
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

    // Get next job from queue
    const job = await JobQueue.getNextJob();
    
    if (!job) {
      return res.json({ 
        message: 'No jobs in queue',
        hasJob: false 
      });
    }

    console.log(`Processing job ${job.id} of type ${job.type}`);

    try {
      let result;
      
      switch (job.type) {
        case 'process_video':
          result = await processVideoJob(job.data);
          break;
          
        case 'ai_analysis':
          result = await aiAnalysisJob(job.data);
          break;
          
        case 'generate_clips':
          result = await generateClipsJob(job.data);
          break;
          
        default:
          throw new Error(`Unknown job type: ${job.type}`);
      }

      await JobQueue.completeJob(job.id, result);
      
      res.json({
        message: 'Job processed successfully',
        hasJob: true,
        jobId: job.id,
        jobType: job.type,
        result
      });

    } catch (jobError) {
      console.error(`Job ${job.id} failed:`, jobError);
      await JobQueue.failJob(job.id, jobError.message);
      
      res.status(500).json({
        error: 'Job processing failed',
        jobId: job.id,
        message: jobError.message
      });
    }

  } catch (error) {
    console.error('Error processing jobs:', error);
    res.status(500).json({ 
      error: 'Failed to process jobs',
      message: error.message 
    });
  }
}

async function processVideoJob(data) {
  const { videoId, s3Key, fileName, fileSize } = data;
  
  console.log(`Processing video ${videoId} from S3 key ${s3Key}`);
  
  // Update video status to processing
  await VideoModel.update(videoId, {
    analysis_status: 'processing',
    processing_progress: 10
  });

  // Generate download URL for the video file
  const downloadUrl = await StorageService.generateDownloadUrl(s3Key, 3600);
  
  // In a real implementation, you would:
  // 1. Download the video from S3
  // 2. Extract metadata using FFmpeg
  // 3. Generate thumbnails
  // 4. Upload thumbnails back to S3
  // 5. Update video record with metadata
  
  // For now, simulate processing
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Update progress
  await VideoModel.update(videoId, {
    processing_progress: 50
  });

  // Simulate metadata extraction
  const metadata = {
    duration: 120, // 2 minutes
    width: 1920,
    height: 1080,
    fps: 30,
    format: fileName.split('.').pop()?.toLowerCase() || 'mp4'
  };

  // Update progress
  await VideoModel.update(videoId, {
    processing_progress: 80
  });

  // Generate thumbnail URL (simulated)
  const thumbnailUrl = `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/thumbnails/${videoId}/thumbnail.jpg`;

  // Final update
  await VideoModel.update(videoId, {
    duration: metadata.duration,
    width: metadata.width,
    height: metadata.height,
    thumbnail_url: thumbnailUrl,
    analysis_status: 'completed',
    processing_progress: 100
  });

  return {
    success: true,
    metadata,
    thumbnailUrl,
    downloadUrl
  };
}

async function aiAnalysisJob(data) {
  const { videoId, s3Key } = data;
  
  console.log(`Running AI analysis for video ${videoId}`);
  
  // Simulate AI analysis
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const aiSuggestions = {
    clips: [
      {
        startTime: 10,
        endTime: 25,
        confidence: 0.92,
        title: "Funny Moment",
        description: "High engagement potential"
      },
      {
        startTime: 45,
        endTime: 60,
        confidence: 0.87,
        title: "Key Quote",
        description: "Shareable content"
      }
    ],
    bestMoments: [15, 50, 75],
    overallScore: 0.89
  };

  await VideoModel.update(videoId, {
    ai_suggestions: aiSuggestions
  });

  return {
    success: true,
    aiSuggestions
  };
}

async function generateClipsJob(data) {
  const { videoId, clips } = data;
  
  console.log(`Generating ${clips.length} clips for video ${videoId}`);
  
  // Simulate clip generation
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  const generatedClips = clips.map((clip, index) => ({
    id: `clip_${videoId}_${index}`,
    startTime: clip.startTime,
    endTime: clip.endTime,
    url: `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/clips/${videoId}/clip_${index}.mp4`,
    thumbnailUrl: `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/clips/${videoId}/clip_${index}_thumb.jpg`,
    status: 'completed'
  }));

  return {
    success: true,
    clips: generatedClips
  };
}

export default withCors(handler); 