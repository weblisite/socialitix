import { VideoModel } from '../_utils/models.js';
import { JobQueue } from '../_utils/jobQueue.js';
import { AIService } from '../_utils/aiService.js';
import { requireAuth } from '../_utils/auth.js';
import { withCors } from '../_utils/cors.js';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { videoId, settings } = req.body;
    const userId = req.user?.id;

    if (!videoId) {
      return res.status(400).json({ 
        error: 'Video ID is required' 
      });
    }

    // Verify video belongs to user
    const video = await VideoModel.findById(videoId, userId);
    if (!video) {
      return res.status(404).json({ 
        error: 'Video not found or access denied' 
      });
    }

    // Get AI suggestions for clips if not already available
    let clipSuggestions = video.ai_suggestions?.clips || [];
    
    if (clipSuggestions.length === 0) {
      // Generate AI suggestions first
      const analysis = await AIService.analyzeVideo({
        videoId,
        duration: video.duration,
        metadata: { width: video.width, height: video.height }
      });
      
      clipSuggestions = analysis.suggestedClips || [];
      
      // Update video with suggestions
      await VideoModel.update(videoId, {
        ai_suggestions: {
          ...video.ai_suggestions,
          clips: clipSuggestions,
          bestMoments: analysis.bestMoments || [],
          overallScore: analysis.viralScore || 0
        }
      });
    }

    // Filter clips based on settings
    const filteredClips = clipSuggestions
      .filter(clip => clip.viralPotential >= (settings?.viralThreshold || 75) / 100)
      .slice(0, settings?.maxClips || 5);

    if (filteredClips.length === 0) {
      return res.status(400).json({
        error: 'No clips meet the specified criteria',
        suggestions: 'Try lowering the viral threshold or increasing max clips'
      });
    }

    // Queue clip generation job
    const job = await JobQueue.addJob('generate_clips', {
      videoId,
      userId,
      clips: filteredClips,
      settings: {
        platforms: settings?.platforms || ['TikTok', 'Instagram', 'YouTube'],
        clipDuration: settings?.clipDuration || 60,
        autoGenerate: settings?.autoGenerate || true
      }
    }, 'normal');

    res.json({
      message: 'Clip generation started',
      jobId: job.id,
      clipsQueued: filteredClips.length,
      clips: filteredClips.map(clip => ({
        title: clip.title,
        duration: clip.end - clip.start,
        viralPotential: clip.viralPotential,
        description: clip.description
      }))
    });

  } catch (error) {
    console.error('Clip generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate clips',
      message: error.message 
    });
  }
}

export default withCors(requireAuth(handler)); 