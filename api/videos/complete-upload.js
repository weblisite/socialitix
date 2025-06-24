import { VideoModel } from '../_utils/models.js';
import { StorageService } from '../_utils/storage.js';
import { JobQueue } from '../_utils/jobQueue.js';
import { requireAuth } from '../_utils/auth.js';
import { withCors } from '../_utils/cors.js';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { key, fileName, title } = req.body;
    const userId = req.user?.id;

    if (!key || !fileName) {
      return res.status(400).json({ 
        error: 'Missing required fields: key, fileName' 
      });
    }

    // Get file info from S3
    const fileInfo = await StorageService.getFileInfo(key);
    
    // Create video record in database
    const videoData = {
      user_id: userId,
      title: title || fileName,
      filename: fileName,
      original_filename: fileName,
      file_size: fileInfo.size,
      s3_key: key,
      s3_bucket: process.env.AWS_S3_BUCKET || 'socialitix-videos',
      url: `https://${process.env.AWS_S3_BUCKET || 'socialitix-videos'}.s3.amazonaws.com/${key}`,
      analysis_status: 'queued',
      processing_progress: 0,
      format: fileName.split('.').pop()?.toLowerCase() || 'mp4',
      duration: 0,
      width: 0,
      height: 0,
      ai_suggestions: {
        clips: [],
        bestMoments: [],
        overallScore: 0
      }
    };

    const video = await VideoModel.create(videoData);

    // Queue video processing job
    const processingJob = await JobQueue.addJob('process_video', {
      videoId: video.id,
      s3Key: key,
      userId: userId,
      fileName: fileName,
      fileSize: fileInfo.size,
    }, 'high');

    // Queue AI analysis job (lower priority)
    const aiJob = await JobQueue.addJob('ai_analysis', {
      videoId: video.id,
      s3Key: key,
      userId: userId,
    }, 'normal');

    res.status(201).json({
      message: 'Video upload completed and queued for processing',
      video: {
        id: video.id,
        title: video.title,
        filename: video.filename,
        status: video.analysis_status,
        progress: video.processing_progress,
        file_size: video.file_size,
        created_at: video.created_at,
      },
      jobs: {
        processing: processingJob.id,
        ai_analysis: aiJob.id,
      }
    });

  } catch (error) {
    console.error('Error completing upload:', error);
    res.status(500).json({ 
      error: 'Failed to complete upload',
      message: error.message 
    });
  }
}

export default withCors(requireAuth(handler)); 