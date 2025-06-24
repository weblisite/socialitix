import { AssemblyAI } from 'assemblyai';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

export interface EngagementSegment {
  start: number;
  end: number;
  score: number;
  confidence: number;
  text: string;
  emotions?: string[];
  topics?: string[];
}

export interface Hook {
  timestamp: number;
  type: 'question' | 'statement' | 'visual' | 'audio' | 'transition';
  confidence: number;
  text: string;
  description: string;
  suggestedClipStart: number;
  suggestedClipEnd: number;
}

export interface AIAnalysisResult {
  engagementSegments: EngagementSegment[];
  hooks: Hook[];
  transcript: string;
  summary: string;
  keywords: string[];
  sentimentAnalysis: {
    overall: 'positive' | 'negative' | 'neutral';
    confidence: number;
  };
}

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY || 'demo-key'
});

export class AIService {
  static async analyzeAudio(audioUrl: string): Promise<AIAnalysisResult> {
    try {
      logger.info('Starting AssemblyAI analysis', { audioUrl });

      if (!process.env.ASSEMBLYAI_API_KEY || process.env.ASSEMBLYAI_API_KEY === 'demo-key') {
        logger.warn('AssemblyAI API key not configured, using mock analysis');
        return this.generateMockAnalysis();
      }

      const config = {
        audio_url: audioUrl,
        speaker_labels: true,
        auto_highlights: true,
        sentiment_analysis: true,
        entity_detection: true,
        iab_categories: true,
        content_safety: true,
        auto_chapters: false,
        summarization: true,
        summary_model: 'informative' as const,
        summary_type: 'bullets' as const
      };

      const transcript = await client.transcripts.transcribe(config);

      if (transcript.status === 'error') {
        throw new Error(`AssemblyAI transcription failed: ${transcript.error}`);
      }

      const result = await this.processTranscriptionResults(transcript);
      
      logger.info('AssemblyAI analysis completed successfully', { 
        segmentsFound: result.engagementSegments.length,
        hooksFound: result.hooks.length 
      });

      return result;

    } catch (error) {
      logger.error('AssemblyAI analysis failed', { error: error.message, audioUrl });
      return this.generateMockAnalysis();
    }
  }

  private static async processTranscriptionResults(transcript: any): Promise<AIAnalysisResult> {
    const engagementSegments: EngagementSegment[] = [];
    const hooks: Hook[] = [];

    if (transcript.auto_highlights?.results) {
      for (const highlight of transcript.auto_highlights.results) {
        engagementSegments.push({
          start: highlight.start / 1000,
          end: highlight.end / 1000,
          score: highlight.rank * 20 + 60,
          confidence: highlight.rank,
          text: highlight.text,
          topics: [highlight.text.split(' ').slice(0, 3).join(' ')]
        });
      }
    }

    if (transcript.sentiment_analysis_results) {
      for (const sentiment of transcript.sentiment_analysis_results) {
        if (sentiment.sentiment === 'POSITIVE' && sentiment.confidence > 0.7) {
          engagementSegments.push({
            start: sentiment.start / 1000,
            end: sentiment.end / 1000,
            score: 75 + (sentiment.confidence * 25),
            confidence: sentiment.confidence,
            text: sentiment.text,
            emotions: ['positive', 'excited']
          });
        }
      }
    }

    const sentences = transcript.text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].trim();
      const hook = this.detectHookInSentence(sentence, i * 3);
      
      if (hook) {
        hooks.push(hook);
      }
    }

    engagementSegments.sort((a, b) => b.score - a.score);

    return {
      engagementSegments: engagementSegments.slice(0, 10),
      hooks: hooks.slice(0, 5),
      transcript: transcript.text || '',
      summary: transcript.summary || 'No summary available',
      keywords: this.extractKeywords(transcript.text || ''),
      sentimentAnalysis: {
        overall: this.calculateOverallSentiment(transcript.sentiment_analysis_results),
        confidence: 0.8
      }
    };
  }

  private static detectHookInSentence(sentence: string, timestamp: number): Hook | null {
    const lowerSentence = sentence.toLowerCase();
    
    if (lowerSentence.includes('?') || lowerSentence.startsWith('what') || 
        lowerSentence.startsWith('how') || lowerSentence.startsWith('why') ||
        lowerSentence.startsWith('when') || lowerSentence.startsWith('where')) {
      return {
        timestamp,
        type: 'question',
        confidence: 0.8,
        text: sentence,
        description: 'Engaging question that draws viewers in',
        suggestedClipStart: Math.max(0, timestamp - 2),
        suggestedClipEnd: timestamp + 15
      };
    }

    const statementTriggers = [
      'you won\'t believe', 'this is crazy', 'amazing', 'incredible', 
      'shocking', 'secret', 'truth', 'revealed', 'exposed'
    ];
    
    if (statementTriggers.some(trigger => lowerSentence.includes(trigger))) {
      return {
        timestamp,
        type: 'statement',
        confidence: 0.7,
        text: sentence,
        description: 'Bold statement that captures attention',
        suggestedClipStart: Math.max(0, timestamp - 1),
        suggestedClipEnd: timestamp + 12
      };
    }

    return null;
  }

  private static extractKeywords(text: string): string[] {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);

    const wordCount = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  private static calculateOverallSentiment(sentiments: any[]): 'positive' | 'negative' | 'neutral' {
    if (!sentiments || sentiments.length === 0) return 'neutral';

    const scores = {
      positive: 0,
      negative: 0,
      neutral: 0
    };

    sentiments.forEach(sentiment => {
      scores[sentiment.sentiment.toLowerCase() as keyof typeof scores]++;
    });

    const maxScore = Math.max(scores.positive, scores.negative, scores.neutral);
    
    if (scores.positive === maxScore) return 'positive';
    if (scores.negative === maxScore) return 'negative';
    return 'neutral';
  }

  private static generateMockAnalysis(): AIAnalysisResult {
    logger.warn('Using mock AI analysis as fallback');

    return {
      engagementSegments: [
        {
          start: 15,
          end: 30,
          score: 92,
          confidence: 0.85,
          text: "This is where the most engaging content happens",
          emotions: ['excited', 'positive']
        },
        {
          start: 45,
          end: 60,
          score: 88,
          confidence: 0.82,
          text: "Another high-engagement moment with great energy",
          emotions: ['positive']
        },
        {
          start: 120,
          end: 135,
          score: 85,
          confidence: 0.78,
          text: "Peak moment that captures viewer attention",
          emotions: ['surprised', 'positive']
        }
      ],
      hooks: [
        {
          timestamp: 5,
          type: 'question',
          confidence: 0.9,
          text: "Have you ever wondered why this happens?",
          description: "Engaging question hook",
          suggestedClipStart: 3,
          suggestedClipEnd: 18
        },
        {
          timestamp: 75,
          type: 'statement',
          confidence: 0.8,
          text: "This will blow your mind!",
          description: "Bold attention-grabbing statement",
          suggestedClipStart: 73,
          suggestedClipEnd: 88
        }
      ],
      transcript: "Mock transcript content for testing purposes...",
      summary: "This video contains engaging content with several high-energy moments and attention-grabbing hooks.",
      keywords: ['engaging', 'content', 'amazing', 'incredible', 'viral'],
      sentimentAnalysis: {
        overall: 'positive',
        confidence: 0.8
      }
    };
  }

  static async analyzeVisualContent(videoUrl: string): Promise<any> {
    logger.info('Video analysis not yet implemented', { videoUrl });
    
    return {
      scenes: [],
      faces: [],
      objects: [],
      text: []
    };
  }

  static async getTrendingHashtags(): Promise<string[]> {
    logger.info('Trending hashtags API not yet implemented');
    
    return ['#viral', '#trending', '#amazing', '#mustwatch', '#incredible'];
  }
}
