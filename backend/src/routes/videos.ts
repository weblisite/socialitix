import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { promises as fs } from 'fs';
import { authenticateToken } from '../middleware/auth.js';
import { videoProcessingService } from '../services/videoProcessingService.js';
import { VideoModel } from '../models/Video.js';
import winston from 'winston';

// Extend Request interface to include user data
interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

const router = express.Router();

// Video processing service is already initialized via import

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = './uploads';
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error instanceof Error ? error : new Error(String(error)), uploadDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `video-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/mkv', 'video/webm'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only video files are allowed.'));
    }
  }
});

// Get user's videos
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const videos = await VideoModel.findByUserId(userId, limit, offset);

    // Transform database videos to match frontend expectations
    const transformedVideos = videos.map(video => ({
      id: video.id,
      title: video.title,
      filename: video.filename,
      original_filename: video.original_filename,
      status: video.analysis_status,
      progress: video.processing_progress,
      duration: video.duration,
      file_size: video.file_size,
      url: video.url,
      thumbnail_url: video.thumbnail_url,
      created_at: video.created_at,
      updated_at: video.updated_at
    }));

    res.json({
      videos: transformedVideos,
      pagination: {
        page,
        limit,
        total: videos.length,
        pages: Math.ceil(videos.length / limit)
      }
    });

  } catch (error) {
    logger.error('Failed to fetch videos', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// Upload and process video
router.post('/upload', authenticateToken, upload.single('video'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const videoPath = req.file.path;
    
    logger.info('Video upload received', { 
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      userId
    });

    // Validate video file
    const validation = await videoProcessingService.validateVideo(videoPath);
    if (!validation.isValid) {
      await fs.unlink(videoPath); // Clean up invalid file
      return res.status(400).json({ error: validation.error || 'Invalid video file' });
    }

    // Create video record in database
    const videoData = {
      user_id: userId,
      title: req.file.originalname,
      filename: req.file.filename,
      original_filename: req.file.originalname,
      file_size: req.file.size,
      duration: 0, // Will be updated after processing
      width: 0, // Will be updated after processing
      height: 0, // Will be updated after processing
      format: path.extname(req.file.originalname).substring(1),
      url: `/uploads/${req.file.filename}`,
      analysis_status: 'processing' as const,
      processing_progress: 0,
      ai_suggestions: {
        clips: [],
        bestMoments: [],
        overallScore: 0
      }
    };

    const savedVideo = await VideoModel.create(videoData);
    if (!savedVideo) {
      await fs.unlink(videoPath); // Clean up file if database save failed
      return res.status(500).json({ error: 'Failed to save video to database' });
    }

    const videoId = savedVideo.id;

    // Start processing (extract audio, generate thumbnails, AI analysis)
    const processingOptions = {
      extractAudio: true,
      generateThumbnails: true,
      analyzeWithAI: true
    };

    logger.info('Starting video processing', { videoId });
    
    // Process video in background (in production, use a job queue)
    videoProcessingService.processVideo(videoId, videoPath)
      .then(async (result: any) => {
        logger.info('Video processing completed', { 
          videoId, 
          success: result.success,
          audioPath: result.audioPath,
          thumbnailPath: result.thumbnailPath
        });

        // Update video record with processing results
        await VideoModel.update(videoId, {
          analysis_status: result.success ? 'completed' : 'failed',
          processing_progress: 100,
          processing_error: result.success ? undefined : 'Processing failed'
        });
      })
      .catch(async error => {
        logger.error('Video processing failed', { 
          videoId, 
          error: error instanceof Error ? error.message : String(error) 
        });

        // Update video record with error
        await VideoModel.update(videoId, {
          analysis_status: 'failed',
          processing_error: error instanceof Error ? error.message : String(error)
        });
      });

    res.status(201).json({
      success: true,
      message: 'Video uploaded and processing started',
      video: {
        id: videoId,
        title: savedVideo.title,
        filename: savedVideo.filename,
        original_filename: savedVideo.original_filename,
        status: savedVideo.analysis_status,
        progress: savedVideo.processing_progress,
        file_size: savedVideo.file_size,
        url: savedVideo.url,
        uploadedAt: savedVideo.created_at
      }
    });

  } catch (error) {
    logger.error('Video upload failed', { error: error instanceof Error ? error.message : String(error) });
    
    // Clean up uploaded file if it exists
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        logger.error('Failed to cleanup uploaded file', { error: cleanupError });
      }
    }
    
    res.status(500).json({ error: 'Video upload failed' });
  }
});

// Get video details
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const videoId = req.params.id;
    const video = await VideoModel.findById(videoId);

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Check if user owns this video
    if (video.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Transform database video to match frontend expectations
    const transformedVideo = {
      id: video.id,
      title: video.title,
      filename: video.filename,
      original_filename: video.original_filename,
      status: video.analysis_status,
      progress: video.processing_progress,
      duration: video.duration,
      file_size: video.file_size,
      url: video.url,
      thumbnail_url: video.thumbnail_url,
      transcript: video.transcript,
      ai_suggestions: video.ai_suggestions,
      tags: video.tags,
      created_at: video.created_at,
      updated_at: video.updated_at,
      engagementSegments: [], // TODO: fetch from engagement_segments table
      hooks: [] // TODO: fetch from hooks table
    };

    res.json({ video: transformedVideo });
  } catch (error) {
    logger.error('Failed to fetch video details', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: 'Failed to fetch video details' });
  }
});

// Create clip from video
router.post('/:id/clips', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const videoId = req.params.id; // Fix: use req.params.id instead of destructuring
    const { startTime, duration, quality = 'medium', resolution, aspectRatio, outputFormat = 'mp4' } = req.body;

    if (!startTime || !duration) {
      return res.status(400).json({ error: 'startTime and duration are required' });
    }

    // In a real implementation, you'd get the video path from database
    const videoPath = `./uploads/video-${videoId}.mp4`; // Mock path
    const outputPath = `./temp/clips/clip-${Date.now()}.${outputFormat}`;
    
    const clipOptions = {
      startTime: parseFloat(startTime),
      duration: parseFloat(duration),
      outputPath,
      title: `Clip from ${videoId}`,
      description: `Generated clip from ${startTime}s to ${startTime + duration}s`
    };

    logger.info('Creating video clip', { videoId, clipOptions });

    const result = await videoProcessingService.createClip(videoPath, clipOptions.startTime, clipOptions.startTime + clipOptions.duration, clipOptions.outputPath);
    
    res.json({
      success: true,
      message: 'Clip created successfully',
      clip: {
        id: result.id,
        videoId,
        path: result.outputPath,
        startTime: result.startTime,
        endTime: result.endTime,
        duration: result.duration,
        thumbnailPath: result.thumbnailPath,
        createdAt: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Clip creation failed', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: 'Failed to create clip' });
  }
});

// Test video processing endpoint
router.post('/test-processing', async (req, res) => {
  try {
    // Create a simple test video file path (you'd need a real video file for testing)
    const testVideoPath = './test-assets/sample-video.mp4';
    const outputDir = './temp';
    
    const processingOptions = {
      extractAudio: true,
      generateThumbnails: true,
      analyzeWithAI: true
    };

    const result = await videoProcessingService.processVideo('test-video', testVideoPath);
    
    res.json({
      success: true,
      message: 'Video processing test completed',
      result: {
        success: result.success,
        audioExtracted: !!result.audioPath,
        thumbnailsGenerated: !!result.thumbnailPath,
        clipsGenerated: result.clips ? result.clips.length : 0,
        metadata: result.metadata,
        error: result.error
      }
    });

  } catch (error) {
    logger.error('Video processing test failed', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: 'Video processing test failed' });
  }
});

// Debug endpoint to test video status
router.get('/debug/status/:id', async (req, res) => {
  try {
    const videoId = req.params.id;
    logger.info('Debug video status request', { videoId });
    
    const video = await VideoModel.findById(videoId);
    
    if (!video) {
      return res.json({ 
        found: false, 
        videoId,
        message: 'Video not found in database' 
      });
    }
    
    res.json({
      found: true,
      videoId,
      video: {
        id: video.id,
        status: video.analysis_status,
        progress: video.processing_progress,
        user_id: video.user_id,
        created_at: video.created_at
      }
    });
    
  } catch (error) {
    logger.error('Debug status check failed', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: 'Debug status check failed' });
  }
});

export default router;
