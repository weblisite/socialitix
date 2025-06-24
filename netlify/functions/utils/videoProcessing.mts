import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import ffprobePath from 'ffprobe-static';
import { supabase } from './shared.mjs';
import { promises as fs } from 'fs';
import path from 'path';

// Set FFmpeg paths
if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
}
if (ffprobePath) {
  ffmpeg.setFfprobePath(ffprobePath);
}

export interface VideoProcessingResult {
  success: boolean;
  thumbnailPath?: string;
  audioPath?: string;
  duration?: number;
  error?: string;
}

export class VideoProcessingService {
  private tempDir: string;

  constructor() {
    this.tempDir = '/tmp';
  }

  async processVideo(filePath: string, videoId: string): Promise<VideoProcessingResult> {
    try {
      console.log(`Starting video processing for: ${videoId}`);

      // Get video metadata
      const metadata = await this.getVideoMetadata(filePath);
      const duration = metadata.format?.duration || 0;

      // Generate thumbnail
      const thumbnailPath = await this.generateThumbnail(filePath, videoId);

      // Extract audio
      const audioPath = await this.extractAudio(filePath, videoId);

      // Update database with processing results
      await supabase
        .from('videos')
        .update({
          status: 'completed',
          duration: Math.round(duration),
          thumbnail_url: thumbnailPath,
          processed_at: new Date().toISOString()
        })
        .eq('id', videoId);

      console.log(`Video processing completed for: ${videoId}`);

      return {
        success: true,
        thumbnailPath,
        audioPath,
        duration
      };
    } catch (error) {
      console.error('Video processing error:', error);
      
      // Update database with error status
      await supabase
        .from('videos')
        .update({ status: 'failed' })
        .eq('id', videoId);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async getVideoMetadata(filePath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) reject(err);
        else resolve(metadata);
      });
    });
  }

  private async generateThumbnail(filePath: string, videoId: string): Promise<string> {
    const thumbnailPath = path.join(this.tempDir, `${videoId}_thumb.jpg`);

    return new Promise((resolve, reject) => {
      ffmpeg(filePath)
        .screenshots({
          timestamps: ['10%'],
          filename: `${videoId}_thumb.jpg`,
          folder: this.tempDir,
          size: '320x240'
        })
        .on('end', () => {
          console.log(`Thumbnail generated: ${thumbnailPath}`);
          resolve(thumbnailPath);
        })
        .on('error', reject);
    });
  }

  private async extractAudio(filePath: string, videoId: string): Promise<string> {
    const audioPath = path.join(this.tempDir, `${videoId}_audio.wav`);

    return new Promise((resolve, reject) => {
      ffmpeg(filePath)
        .output(audioPath)
        .audioCodec('pcm_s16le')
        .audioChannels(1)
        .audioFrequency(16000)
        .on('end', () => {
          console.log(`Audio extracted: ${audioPath}`);
          resolve(audioPath);
        })
        .on('error', reject)
        .run();
    });
  }

  async createClips(videoId: string, segments: any[]): Promise<string[]> {
    try {
      const { data: video } = await supabase
        .from('videos')
        .select('file_path')
        .eq('id', videoId)
        .single();

      if (!video) {
        throw new Error('Video not found');
      }

      const clipPaths: string[] = [];

      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        const clipPath = path.join(this.tempDir, `${videoId}_clip_${i}.mp4`);

        await this.createClip(video.file_path, clipPath, segment.start, segment.end);
        clipPaths.push(clipPath);
      }

      return clipPaths;
    } catch (error) {
      console.error('Clip creation error:', error);
      throw error;
    }
  }

  private async createClip(inputPath: string, outputPath: string, start: number, duration: number): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .seekInput(start)
        .duration(duration)
        .output(outputPath)
        .videoCodec('libx264')
        .audioCodec('aac')
        .on('end', () => resolve())
        .on('error', reject)
        .run();
    });
  }
} 