import { Router } from 'express';
import { AIService } from '../services/aiService.js';
import { authenticateToken } from '../middleware/auth.js';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

const router = Router();

// Analyze video audio for engagement and hooks
router.post('/analyze', async (req, res) => {
  try {
    const { audioUrl, videoId } = req.body;

    if (!audioUrl) {
      return res.status(400).json({ 
        error: 'audioUrl is required' 
      });
    }

    logger.info('Starting AI analysis', { 
      videoId, 
      audioUrl 
    });

    // Call AssemblyAI service
    const analysis = await AIService.analyzeAudio(audioUrl);

    logger.info('AI analysis completed', { 
      videoId,
      segmentsFound: analysis.engagementSegments.length,
      hooksFound: analysis.hooks.length
    });

    res.json({
      success: true,
      analysis: {
        engagementSegments: analysis.engagementSegments,
        hooks: analysis.hooks,
        transcript: analysis.transcript,
        summary: analysis.summary,
        keywords: analysis.keywords,
        sentiment: analysis.sentimentAnalysis
      }
    });

  } catch (error) {
    logger.error('AI analysis failed', { 
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(500).json({ 
      error: 'AI analysis failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get trending topics and hashtags
router.get('/trending', async (req, res) => {
  try {
    logger.info('Fetching trending topics');

    // Call AI service for trending hashtags
    const trendingHashtags = await AIService.getTrendingHashtags();

    res.json({
      success: true,
      trending: {
        hashtags: trendingHashtags,
        topics: [
          'AI Technology',
          'Social Media Tips',
          'Content Creation',
          'Video Marketing',
          'Digital Trends'
        ],
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Failed to fetch trending topics', { 
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(500).json({ 
      error: 'Failed to fetch trending topics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Test endpoint for AI analysis with sample audio
router.post('/test-analysis', async (req, res) => {
  try {
    logger.info('Testing AI analysis with sample audio');

    // Use a sample audio URL for testing
    const sampleAudioUrl = 'https://github.com/AssemblyAI-Examples/audio-examples/raw/main/20230607_me_canadian_wildfires.mp3';
    
    const analysis = await AIService.analyzeAudio(sampleAudioUrl);

    res.json({
      success: true,
      message: 'AI analysis test completed',
      sampleUrl: sampleAudioUrl,
      analysis: {
        engagementSegments: analysis.engagementSegments,
        hooks: analysis.hooks,
        transcript: analysis.transcript.substring(0, 500) + '...', // Truncate for readability
        summary: analysis.summary,
        keywords: analysis.keywords,
        sentiment: analysis.sentimentAnalysis
      }
    });

  } catch (error) {
    logger.error('AI analysis test failed', { 
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(500).json({ 
      error: 'AI analysis test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 