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
    const { filePath, fileName, title } = req.body;
    const userId = req.user?.id;

    if (!filePath || !fileName) {
      return res.status(400).json({ 
        error: 'Missing required fields: filePath, fileName' 
      });
    }

    // Get file info from Supabase Storage
    const fileInfo = await StorageService.getFileInfo(filePath);
    
    // Generate public URL for the uploaded file
    const publicUrl = await StorageService.generateDownloadUrl(filePath);
    
    // Create video record in database
    const videoData = {
      user_id: userId,
      title: title || fileName,
      filename: fileName,
      original_filename: fileName,
      file_size: fileInfo.size,
      storage_path: filePath,
      storage_bucket: 'videos',
      url: publicUrl,
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
      filePath: filePath,
      userId: userId,
      fileName: fileName,
      fileSize: fileInfo.size,
    }, 'high');

    // Queue AI analysis job (lower priority)
    const aiJob = await JobQueue.addJob('ai_analysis', {
      videoId: video.id,
      filePath: filePath,
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
        url: video.url,
        storage_path: video.storage_path,
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