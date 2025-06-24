import fetch from 'node-fetch';

const SHOTSTACK_API_URL = 'https://api.shotstack.io/edit/stage'; // Use 'stage' for development, 'v1' for production
const SHOTSTACK_API_KEY = process.env.SHOTSTACK_API_KEY;

export class ShotstackService {
  
  /**
   * Generate a viral clip from a video using Shotstack
   * @param {Object} params - Clip generation parameters
   * @param {string} params.videoUrl - URL of the source video
   * @param {number} params.startTime - Start time in seconds
   * @param {number} params.endTime - End time in seconds
   * @param {string} params.platform - Target platform (tiktok, instagram, youtube)
   * @param {string} params.hook - AI-generated hook text
   * @param {Object} params.style - Styling options
   * @returns {Promise<Object>} Render response with render ID
   */
  static async generateClip({
    videoUrl,
    startTime,
    endTime,
    platform = 'tiktok',
    hook = '',
    style = {}
  }) {
    try {
      // Platform-specific dimensions and settings
      const platformSettings = this.getPlatformSettings(platform);
      
      // Create the edit timeline
      const timeline = {
        soundtrack: null,
        background: '#000000',
        tracks: [
          {
            clips: [
              // Main video clip
              {
                asset: {
                  type: 'video',
                  src: videoUrl,
                  trim: startTime,
                  volume: 1
                },
                start: 0,
                length: endTime - startTime,
                effect: style.effect || 'zoomIn', // Add viral effects
                transition: {
                  in: 'fade',
                  out: 'fade'
                }
              }
            ]
          },
          // Text overlay track for hook
          ...(hook ? [{
            clips: [
              {
                asset: {
                  type: 'title',
                  text: hook,
                  style: 'future', // Viral text style
                  color: '#ffffff',
                  size: 'large',
                  background: 'rgba(0,0,0,0.7)',
                  position: 'center'
                },
                start: 0,
                length: Math.min(3, endTime - startTime), // Show hook for first 3 seconds
                transition: {
                  in: 'slideUp',
                  out: 'slideDown'
                }
              }
            ]
          }] : []),
          // Trending hashtags overlay
          {
            clips: [
              {
                asset: {
                  type: 'title',
                  text: this.getTrendingHashtags(platform),
                  style: 'minimal',
                  color: '#ffffff',
                  size: 'small',
                  position: 'bottomLeft'
                },
                start: endTime - startTime - 2, // Last 2 seconds
                length: 2,
                transition: {
                  in: 'fade',
                  out: 'fade'
                }
              }
            ]
          }
        ]
      };

      // Output settings
      const output = {
        format: 'mp4',
        resolution: platformSettings.resolution,
        aspectRatio: platformSettings.aspectRatio,
        size: platformSettings.size,
        fps: 30,
        scaleTo: 'crop' // Ensure proper cropping for platform
      };

      // Merge settings
      const merge = {
        concat: false
      };

      // Create the edit payload
      const editPayload = {
        timeline,
        output,
        merge
      };

      console.log('Shotstack edit payload:', JSON.stringify(editPayload, null, 2));

      // Send to Shotstack API
      const response = await fetch(`${SHOTSTACK_API_URL}/render`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': SHOTSTACK_API_KEY
        },
        body: JSON.stringify(editPayload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Shotstack API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const result = await response.json();
      console.log('Shotstack render started:', result);

      return {
        success: true,
        renderId: result.response.id,
        message: result.response.message,
        status: 'queued'
      };

    } catch (error) {
      console.error('Error generating clip with Shotstack:', error);
      throw new Error(`Failed to generate clip: ${error.message}`);
    }
  }

  /**
   * Check the status of a Shotstack render
   * @param {string} renderId - The render ID from Shotstack
   * @returns {Promise<Object>} Render status and URL if completed
   */
  static async checkRenderStatus(renderId) {
    try {
      const response = await fetch(`${SHOTSTACK_API_URL}/render/${renderId}`, {
        method: 'GET',
        headers: {
          'x-api-key': SHOTSTACK_API_KEY
        }
      });

      if (!response.ok) {
        throw new Error(`Shotstack status check failed: ${response.status}`);
      }

      const result = await response.json();
      const render = result.response;

      return {
        id: render.id,
        status: render.status, // queued, fetching, rendering, saving, done, failed
        progress: render.data?.progress || 0,
        url: render.url, // Available when status is 'done'
        error: render.error,
        created: render.created,
        updated: render.updated
      };

    } catch (error) {
      console.error('Error checking render status:', error);
      throw new Error(`Failed to check render status: ${error.message}`);
    }
  }

  /**
   * Generate multiple viral clips from a single video
   * @param {Object} params - Parameters for multi-clip generation
   * @param {string} params.videoUrl - Source video URL
   * @param {Array} params.moments - Array of {startTime, endTime, hook} objects
   * @param {string} params.platform - Target platform
   * @returns {Promise<Array>} Array of render IDs
   */
  static async generateMultipleClips({ videoUrl, moments, platform = 'tiktok' }) {
    try {
      const renderPromises = moments.map(moment => 
        this.generateClip({
          videoUrl,
          startTime: moment.startTime,
          endTime: moment.endTime,
          platform,
          hook: moment.hook || '',
          style: moment.style || {}
        })
      );

      const results = await Promise.all(renderPromises);
      console.log(`Generated ${results.length} clips for platform: ${platform}`);
      
      return results;
    } catch (error) {
      console.error('Error generating multiple clips:', error);
      throw error;
    }
  }

  /**
   * Get platform-specific settings for optimal viral performance
   * @param {string} platform - Platform name (tiktok, instagram, youtube)
   * @returns {Object} Platform settings
   */
  static getPlatformSettings(platform) {
    const settings = {
      tiktok: {
        resolution: 'hd',
        aspectRatio: '9:16',
        size: {
          width: 1080,
          height: 1920
        }
      },
      instagram: {
        resolution: 'hd',
        aspectRatio: '9:16',
        size: {
          width: 1080,
          height: 1920
        }
      },
      youtube: {
        resolution: 'hd',
        aspectRatio: '9:16', // YouTube Shorts
        size: {
          width: 1080,
          height: 1920
        }
      },
      twitter: {
        resolution: 'hd',
        aspectRatio: '16:9',
        size: {
          width: 1280,
          height: 720
        }
      }
    };

    return settings[platform] || settings.tiktok;
  }

  /**
   * Get trending hashtags for platform
   * @param {string} platform - Platform name
   * @returns {string} Hashtag string
   */
  static getTrendingHashtags(platform) {
    const hashtags = {
      tiktok: '#viral #fyp #trending #foryou',
      instagram: '#viral #reels #trending #explore',
      youtube: '#shorts #viral #trending',
      twitter: '#viral #trending #video'
    };

    return hashtags[platform] || hashtags.tiktok;
  }

  /**
   * Create a compilation video from multiple clips
   * @param {Array} clipUrls - Array of clip URLs to combine
   * @param {string} platform - Target platform
   * @returns {Promise<Object>} Render response
   */
  static async createCompilation(clipUrls, platform = 'tiktok') {
    try {
      const platformSettings = this.getPlatformSettings(platform);
      
      // Create clips for timeline
      const clips = clipUrls.map((url, index) => ({
        asset: {
          type: 'video',
          src: url,
          volume: 1
        },
        start: index * 15, // 15 seconds per clip
        length: 15,
        transition: {
          in: 'fade',
          out: 'fade'
        }
      }));

      const timeline = {
        background: '#000000',
        tracks: [
          {
            clips: clips
          }
        ]
      };

      const output = {
        format: 'mp4',
        resolution: platformSettings.resolution,
        aspectRatio: platformSettings.aspectRatio,
        size: platformSettings.size,
        fps: 30
      };

      const editPayload = {
        timeline,
        output
      };

      const response = await fetch(`${SHOTSTACK_API_URL}/render`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': SHOTSTACK_API_KEY
        },
        body: JSON.stringify(editPayload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Shotstack compilation error: ${JSON.stringify(errorData)}`);
      }

      const result = await response.json();
      return result;

    } catch (error) {
      console.error('Error creating compilation:', error);
      throw error;
    }
  }
} 