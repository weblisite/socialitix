import { AssemblyAI } from 'assemblyai';

export interface AIAnalysisResult {
  transcript: string;
  engagementSegments: Array<{
    start: number;
    end: number;
    confidence: number;
    text: string;
    sentiment: string;
    engagement_score: number;
  }>;
  hooks: Array<{
    text: string;
    timestamp: number;
    type: string;
    confidence: number;
  }>;
  keywords: string[];
  sentiment: {
    overall: string;
    confidence: number;
  };
}

export class AIService {
  private client: AssemblyAI;

  constructor() {
    const apiKey = Netlify.env.get('ASSEMBLYAI_API_KEY');
    if (!apiKey) {
      throw new Error('AssemblyAI API key not configured');
    }
    this.client = new AssemblyAI({ apiKey });
  }

  async analyzeAudio(audioPath: string): Promise<AIAnalysisResult> {
    try {
      console.log('Starting AI analysis with AssemblyAI');

      // Transcribe the audio with sentiment analysis
      const transcript = await this.client.transcripts.transcribe({
        audio: audioPath,
        sentiment_analysis: true,
        auto_highlights: true,
        entity_detection: true,
        speaker_labels: true
      });

      if (transcript.status === 'error') {
        throw new Error(`Transcription failed: ${transcript.error}`);
      }

      // Extract engagement segments based on sentiment and highlights
      const engagementSegments = this.extractEngagementSegments(transcript);
      
      // Detect hooks (engaging openings, questions, surprising statements)
      const hooks = this.detectHooks(transcript);
      
      // Extract keywords from highlights
      const keywords = transcript.auto_highlights_result?.results?.map(h => h.text) || [];
      
      // Overall sentiment
      const sentiment = {
        overall: this.calculateOverallSentiment(transcript.sentiment_analysis_results || []),
        confidence: 0.8
      };

      return {
        transcript: transcript.text || '',
        engagementSegments,
        hooks,
        keywords,
        sentiment
      };
    } catch (error) {
      console.error('AI analysis error:', error);
      throw error;
    }
  }

  async testAnalysis(): Promise<AIAnalysisResult> {
    // Return mock data for testing without requiring audio file
    return {
      transcript: "Welcome to this amazing video where we'll discover incredible insights about viral content creation. This is going to be mind-blowing! Let me ask you a question - have you ever wondered what makes content go viral? The secret is in the first 3 seconds. People make decisions incredibly fast, and if you don't hook them immediately, they're gone. Here's what most creators get wrong...",
      engagementSegments: [
        {
          start: 0,
          end: 8,
          confidence: 0.92,
          text: "Welcome to this amazing video where we'll discover incredible insights",
          sentiment: "positive",
          engagement_score: 0.85
        },
        {
          start: 15,
          end: 25,
          confidence: 0.88,
          text: "have you ever wondered what makes content go viral?",
          sentiment: "neutral",
          engagement_score: 0.78
        },
        {
          start: 30,
          end: 40,
          confidence: 0.95,
          text: "The secret is in the first 3 seconds",
          sentiment: "positive",
          engagement_score: 0.92
        }
      ],
      hooks: [
        {
          text: "This is going to be mind-blowing!",
          timestamp: 8,
          type: "excitement",
          confidence: 0.9
        },
        {
          text: "have you ever wondered what makes content go viral?",
          timestamp: 18,
          type: "question",
          confidence: 0.85
        },
        {
          text: "Here's what most creators get wrong",
          timestamp: 45,
          type: "revelation",
          confidence: 0.88
        }
      ],
      keywords: ["viral", "content", "secret", "creators", "engagement", "hook"],
      sentiment: {
        overall: "positive",
        confidence: 0.82
      }
    };
  }

  private extractEngagementSegments(transcript: any): any[] {
    const segments = [];
    const sentiments = transcript.sentiment_analysis_results || [];
    
    // Group consecutive high-engagement segments
    let currentSegment = null;
    
    for (const sentiment of sentiments) {
      const isEngaging = sentiment.sentiment === 'POSITIVE' && sentiment.confidence > 0.7;
      
      if (isEngaging) {
        if (!currentSegment) {
          currentSegment = {
            start: sentiment.start / 1000, // Convert to seconds
            end: sentiment.end / 1000,
            confidence: sentiment.confidence,
            text: sentiment.text,
            sentiment: sentiment.sentiment.toLowerCase(),
            engagement_score: sentiment.confidence * 0.9
          };
        } else {
          // Extend current segment
          currentSegment.end = sentiment.end / 1000;
          currentSegment.text += ' ' + sentiment.text;
          currentSegment.confidence = Math.max(currentSegment.confidence, sentiment.confidence);
        }
      } else {
        if (currentSegment) {
          segments.push(currentSegment);
          currentSegment = null;
        }
      }
    }
    
    // Add final segment if exists
    if (currentSegment) {
      segments.push(currentSegment);
    }
    
    return segments.slice(0, 10); // Limit to top 10 segments
  }

  private detectHooks(transcript: any): any[] {
    const hooks = [];
    const text = transcript.text || '';
    const words = transcript.words || [];
    
    // Hook patterns
    const hookPatterns = [
      { pattern: /\b(amazing|incredible|mind-blowing|shocking|unbelievable)\b/gi, type: 'excitement' },
      { pattern: /\b(have you ever|did you know|what if|imagine)\b/gi, type: 'question' },
      { pattern: /\b(secret|truth|reality|fact|here's what)\b/gi, type: 'revelation' },
      { pattern: /\b(wait|stop|hold on|before you)\b/gi, type: 'interruption' }
    ];
    
    for (const { pattern, type } of hookPatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match.index !== undefined) {
          // Find approximate timestamp for this text position
          const wordIndex = Math.floor((match.index / text.length) * words.length);
          const timestamp = words[wordIndex]?.start / 1000 || 0;
          
          hooks.push({
            text: match[0],
            timestamp,
            type,
            confidence: 0.8
          });
        }
      }
    }
    
    return hooks.slice(0, 5); // Limit to top 5 hooks
  }

  private calculateOverallSentiment(sentiments: any[]): string {
    if (sentiments.length === 0) return 'neutral';
    
    const counts = { positive: 0, negative: 0, neutral: 0 };
    
    for (const sentiment of sentiments) {
      const type = sentiment.sentiment.toLowerCase();
      if (type in counts) {
        counts[type as keyof typeof counts]++;
      }
    }
    
    const max = Math.max(counts.positive, counts.negative, counts.neutral);
    
    if (counts.positive === max) return 'positive';
    if (counts.negative === max) return 'negative';
    return 'neutral';
  }
} 