import { AIService } from '../_utils/aiService.js';
import { VideoModel } from '../_utils/models.js';
import { requireAuth } from '../_utils/auth.js';
import { withCors } from '../_utils/cors.js';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { videoId, audioUrl } = req.body;
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

    // Run AI analysis
    const analysis = await AIService.analyzeVideo({
      videoId,
      audioUrl: audioUrl || video.url,
      duration: video.duration,
      metadata: {
        width: video.width,
        height: video.height,
        format: video.format
      }
    });

    // Update video with AI analysis results
    await VideoModel.update(videoId, {
      ai_suggestions: {
        clips: analysis.suggestedClips || [],
        bestMoments: analysis.bestMoments || [],
        overallScore: analysis.viralScore || 0,
        platforms: analysis.platforms || {},
        keywords: analysis.keywords || [],
        sentiment: analysis.sentimentAnalysis || {}
      }
    });

    res.json({
      message: 'AI analysis completed',
      analysis: {
        viralScore: analysis.viralScore,
        suggestedClips: analysis.suggestedClips,
        bestMoments: analysis.bestMoments,
        platforms: analysis.platforms,
        trendingHashtags: await AIService.getTrendingHashtags()
      }
    });

  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({ 
      error: 'AI analysis failed',
      message: error.message 
    });
  }
}

export default withCors(requireAuth(handler)); 