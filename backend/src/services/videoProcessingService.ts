import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static';
import sharp from 'sharp';
import winston from 'winston';
import { AIService, AIAnalysisResult } from './aiService.js';

// Set FFmpeg and FFprobe paths to the static binaries
ffmpeg.setFfmpegPath(ffmpegStatic!);
ffmpeg.setFfprobePath(ffprobeStatic.path);

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'video-processing.log' })
  ]
});

export interface ProcessingOptions {
  extractAudio?: boolean;
  generateThumbnails?: boolean;
  analyzeWithAI?: boolean;
  outputFormats?: string[];
}

export interface ClipOptions {
  startTime: number;
  duration: number;
  outputPath: string;
  title?: string;
  description?: string;
}

export interface VideoInfo {
  duration: number;
  width: number;
  height: number;
  format: string;
  bitrate: number;
  fps: number;
  audioCodec?: string;
  videoCodec?: string;
}

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  fps: number;
  bitrate: number;
  format: string;
  size: number;
  hasAudio: boolean;
}

export interface ProcessingResult {
  success: boolean;
  videoId: string;
  metadata?: VideoMetadata;
  thumbnailPath?: string;
  audioPath?: string;
  error?: string;
  clips?: ClipSegment[];
}

export interface ClipSegment {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  outputPath: string;
  thumbnailPath?: string;
}

export class VideoProcessingService {
  private uploadsDir: string;
  private tempDir: string;
  private thumbnailsDir: string;
  private audioDir: string;
  private clipsDir: string;

  constructor() {
    this.uploadsDir = path.join(process.cwd(), 'uploads');
    this.tempDir = path.join(process.cwd(), 'temp');
    this.thumbnailsDir = path.join(this.tempDir, 'thumbnails');
    this.audioDir = path.join(this.tempDir, 'audio');
    this.clipsDir = path.join(this.tempDir, 'clips');

    // Ensure directories exist
    this.ensureDirectories();
    
    logger.info('VideoProcessingService initialized with ffmpeg-static');
  }

  private ensureDirectories(): void {
    const dirs = [this.uploadsDir, this.tempDir, this.thumbnailsDir, this.audioDir, this.clipsDir];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        logger.info(`Created directory: ${dir}`);
      }
    });
  }

  async validateVideo(filePath: string): Promise<{ isValid: boolean; error?: string; metadata?: VideoMetadata }> {
    try {
      const metadata = await this.getVideoMetadata(filePath);
      
      // Validate file constraints
      const maxSize = 500 * 1024 * 1024; // 500MB
      const maxDuration = 3600; // 1 hour
      
      if (metadata.size > maxSize) {
        return { isValid: false, error: 'File size exceeds 500MB limit' };
      }
      
      if (metadata.duration > maxDuration) {
        return { isValid: false, error: 'Video duration exceeds 1 hour limit' };
      }
      
      // Check if it's a valid video format
      const supportedFormats = ['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv'];
      if (!supportedFormats.includes(metadata.format.toLowerCase())) {
        return { isValid: false, error: `Unsupported format: ${metadata.format}` };
      }
      
      return { isValid: true, metadata };
    } catch (error) {
      logger.error('Video validation failed:', error);
      return { isValid: false, error: 'Failed to validate video file' };
    }
  }

  async getVideoMetadata(filePath: string): Promise<VideoMetadata> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          logger.error('FFprobe error:', err);
          reject(err);
          return;
        }

        try {
          const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
          const audioStream = metadata.streams.find(stream => stream.codec_type === 'audio');
          const stats = fs.statSync(filePath);

          if (!videoStream) {
            reject(new Error('No video stream found'));
            return;
          }

          const result: VideoMetadata = {
            duration: metadata.format.duration || 0,
            width: videoStream.width || 0,
            height: videoStream.height || 0,
            fps: this.parseFps(videoStream.r_frame_rate || '0/1'),
            bitrate: parseInt(metadata.format.bit_rate || '0'),
            format: path.extname(filePath).slice(1).toLowerCase(),
            size: stats.size,
            hasAudio: !!audioStream
          };

          resolve(result);
        } catch (parseError) {
          logger.error('Metadata parsing error:', parseError);
          reject(parseError);
        }
      });
    });
  }

  private parseFps(frameRate: string): number {
    const [num, den] = frameRate.split('/').map(Number);
    return den ? Math.round(num / den) : 0;
  }

  async generateThumbnail(videoPath: string, outputPath: string, timeOffset: number = 10): Promise<string> {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .screenshots({
          timestamps: [timeOffset],
          filename: path.basename(outputPath),
          folder: path.dirname(outputPath),
          size: '320x240'
        })
        .on('end', () => {
          logger.info(`Thumbnail generated: ${outputPath}`);
          resolve(outputPath);
        })
        .on('error', (err) => {
          logger.error('Thumbnail generation failed:', err);
          reject(err);
        });
    });
  }

  async extractAudio(videoPath: string, outputPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .output(outputPath)
        .audioCodec('mp3')
        .noVideo()
        .on('end', () => {
          logger.info(`Audio extracted: ${outputPath}`);
          resolve(outputPath);
        })
        .on('error', (err) => {
          logger.error('Audio extraction failed:', err);
          reject(err);
        })
        .run();
    });
  }

  async createClip(videoPath: string, startTime: number, endTime: number, outputPath: string): Promise<ClipSegment> {
    return new Promise((resolve, reject) => {
      const duration = endTime - startTime;
      
      ffmpeg(videoPath)
        .seekInput(startTime)
        .duration(duration)
        .output(outputPath)
        .videoCodec('libx264')
        .audioCodec('aac')
        .on('end', async () => {
          try {
            // Generate thumbnail for the clip
            const thumbnailPath = outputPath.replace('.mp4', '_thumb.jpg');
            await this.generateThumbnail(outputPath, thumbnailPath, 1);
            
            const clipSegment: ClipSegment = {
              id: path.basename(outputPath, '.mp4'),
              startTime,
              endTime,
              duration,
              outputPath,
              thumbnailPath
            };
            
            logger.info(`Clip created: ${outputPath}`);
            resolve(clipSegment);
          } catch (thumbError) {
            logger.warn('Clip thumbnail generation failed:', thumbError);
            resolve({
              id: path.basename(outputPath, '.mp4'),
              startTime,
              endTime,
              duration,
              outputPath
            });
          }
        })
        .on('error', (err) => {
          logger.error('Clip creation failed:', err);
          reject(err);
        })
        .run();
    });
  }

  async processVideo(videoId: string, filePath: string): Promise<ProcessingResult> {
    try {
      logger.info(`Starting video processing for: ${videoId}`);
      
      // Validate video first
      const validation = await this.validateVideo(filePath);
      if (!validation.isValid) {
        return {
          success: false,
          videoId,
          error: validation.error
        };
      }

      const metadata = validation.metadata!;
      const videoName = path.basename(filePath, path.extname(filePath));
      
      // Generate thumbnail
      const thumbnailPath = path.join(this.thumbnailsDir, `${videoName}_thumb.jpg`);
      await this.generateThumbnail(filePath, thumbnailPath);
      
      // Extract audio if present
      let audioPath: string | undefined;
      if (metadata.hasAudio) {
        audioPath = path.join(this.audioDir, `${videoName}_audio.mp3`);
        await this.extractAudio(filePath, audioPath);
      }
      
      // Create sample clips (for demonstration)
      const clips: ClipSegment[] = [];
      if (metadata.duration > 30) {
        // Create 3 sample clips
        const clipDuration = 15; // 15 seconds each
        const intervals = [
          { start: 5, end: 20 },
          { start: Math.max(metadata.duration * 0.3, 25), end: Math.max(metadata.duration * 0.3 + clipDuration, 40) },
          { start: Math.max(metadata.duration * 0.7, 50), end: Math.max(metadata.duration * 0.7 + clipDuration, 65) }
        ];
        
        for (let i = 0; i < intervals.length; i++) {
          const { start, end } = intervals[i];
          if (end <= metadata.duration) {
            const clipPath = path.join(this.clipsDir, `${videoName}_clip_${i + 1}.mp4`);
            try {
              const clip = await this.createClip(filePath, start, end, clipPath);
              clips.push(clip);
            } catch (clipError) {
              logger.warn(`Failed to create clip ${i + 1}:`, clipError);
            }
          }
        }
      }
      
      logger.info(`Video processing completed for: ${videoId}`);
      
      return {
        success: true,
        videoId,
        metadata,
        thumbnailPath,
        audioPath,
        clips
      };
      
    } catch (error) {
      logger.error(`Video processing failed for ${videoId}:`, error);
      return {
        success: false,
        videoId,
        error: error instanceof Error ? error.message : 'Unknown processing error'
      };
    }
  }

  async enhanceVideo(inputPath: string, outputPath: string, options: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
    stabilize?: boolean;
  } = {}): Promise<string> {
    return new Promise((resolve, reject) => {
      let command = ffmpeg(inputPath);
      
      // Build video filters
      const filters = [];
      
      if (options.brightness !== undefined) {
        filters.push(`eq=brightness=${options.brightness}`);
      }
      
      if (options.contrast !== undefined) {
        filters.push(`eq=contrast=${options.contrast}`);
      }
      
      if (options.saturation !== undefined) {
        filters.push(`eq=saturation=${options.saturation}`);
      }
      
      if (options.stabilize) {
        filters.push('deshake');
      }
      
      if (filters.length > 0) {
        command = command.videoFilters(filters.join(','));
      }
      
      command
        .output(outputPath)
        .on('end', () => {
          logger.info(`Video enhancement completed: ${outputPath}`);
          resolve(outputPath);
        })
        .on('error', (err) => {
          logger.error('Video enhancement failed:', err);
          reject(err);
        })
        .run();
    });
  }

  async getProcessingStatus(videoId: string): Promise<{ status: 'processing' | 'completed' | 'failed' | 'not_found' }> {
    // This would typically check a database or processing queue
    // For now, return a simple implementation
    return { status: 'completed' };
  }

  async cleanup(videoId: string): Promise<void> {
    try {
      const patterns = [
        path.join(this.thumbnailsDir, `*${videoId}*`),
        path.join(this.audioDir, `*${videoId}*`),
        path.join(this.clipsDir, `*${videoId}*`)
      ];
      
      // Clean up temporary files
      for (const pattern of patterns) {
        const files = fs.readdirSync(path.dirname(pattern))
          .filter(file => file.includes(videoId))
          .map(file => path.join(path.dirname(pattern), file));
        
        for (const file of files) {
          if (fs.existsSync(file)) {
            fs.unlinkSync(file);
            logger.info(`Cleaned up: ${file}`);
          }
        }
      }
    } catch (error) {
      logger.error(`Cleanup failed for ${videoId}:`, error);
    }
  }
}

export const videoProcessingService = new VideoProcessingService();
