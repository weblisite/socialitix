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

    console.log('Complete upload request:', { filePath, fileName, title, userId });

    if (!filePath || !fileName) {
      return res.status(400).json({ 
        error: 'Missing required fields: filePath, fileName' 
      });
    }

    if (!userId) {
      return res.status(401).json({ 
        error: 'User authentication required' 
      });
    }

    // Step 1: Get file info from Supabase Storage
    console.log('Step 1: Getting file info for:', filePath);
    let fileInfo;
    try {
      fileInfo = await StorageService.getFileInfo(filePath);
      console.log('File info retrieved:', fileInfo);
    } catch (error) {
      console.error('Error getting file info:', error);
      return res.status(500).json({ 
        error: 'Failed to get file info',
        message: error.message,
        step: 'getFileInfo'
      });
    }
    
    // Step 2: Generate public URL for the uploaded file
    console.log('Step 2: Generating download URL for:', filePath);
    let publicUrl;
    try {
      publicUrl = await StorageService.generateDownloadUrl(filePath);
      console.log('Download URL generated:', publicUrl);
    } catch (error) {
      console.error('Error generating download URL:', error);
      return res.status(500).json({ 
        error: 'Failed to generate download URL',
        message: error.message,
        step: 'generateDownloadUrl'
      });
    }
    
    // Step 3: Create video record in database with minimal required fields
    const videoData = {
      user_id: userId,
      title: title || fileName,
      filename: fileName,
      original_filename: fileName,
      file_size: fileInfo?.size || 0,
      storage_path: filePath,
      storage_bucket: 'videos',
      url: publicUrl,
      analysis_status: 'ready',
      processing_progress: 100,
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

    console.log('Step 3: Creating video record with data:', JSON.stringify(videoData, null, 2));
    let video;
    try {
      video = await VideoModel.create(videoData);
      console.log('Video record created successfully:', video.id);
    } catch (error) {
      console.error('Error creating video record:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return res.status(500).json({ 
        error: 'Failed to create video record',
        message: error.message,
        step: 'createVideoRecord',
        details: error
      });
    }

    // Step 4: Queue AI analysis job (optional, non-blocking)
    console.log('Step 4: Queuing AI analysis job for video:', video.id);
    let aiJob = null;
    try {
      aiJob = await JobQueue.addJob('analyze_video', {
        videoId: video.id,
        userId: userId,
      }, 'normal');
      console.log('AI analysis job queued successfully:', aiJob.id);
    } catch (error) {
      console.error('Error queuing AI analysis job (non-critical):', error);
      // Don't fail the request if job queueing fails
    }

    // Success response
    const response = {
      message: 'Video upload completed and ready for clip generation',
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
        ai_analysis: aiJob?.id || null,
      }
    };

    console.log('Upload completed successfully:', response);
    res.status(201).json(response);

  } catch (error) {
    console.error('Unexpected error in complete-upload:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      step: 'unexpected'
    });
  }
}

export default withCors(requireAuth(handler)); 