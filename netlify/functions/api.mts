import type { Context, Config } from "@netlify/functions";
import { supabase, authenticateUser, errorResponse, successResponse, handleCors, addCorsHeaders } from './utils/shared.mjs';
import { VideoProcessingService } from './utils/videoProcessing.mjs';
import { AIService } from './utils/aiService.mjs';

export default async (req: Request, context: Context) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const url = new URL(req.url);
  const path = url.pathname.replace('/.netlify/functions/api', '');
  const method = req.method;

  console.log(`${method} ${path}`);

  try {
    let response: Response;

    // Route handling
    if (path.startsWith('/auth')) {
      response = await handleAuth(req, path, method);
    } else if (path.startsWith('/videos')) {
      response = await handleVideos(req, path, method);
    } else if (path.startsWith('/clips')) {
      response = await handleClips(req, path, method);
    } else if (path.startsWith('/analytics')) {
      response = await handleAnalytics(req, path, method);
    } else if (path.startsWith('/ai')) {
      response = await handleAI(req, path, method);
    } else if (path.startsWith('/subscriptions')) {
      response = await handleSubscriptions(req, path, method);
    } else if (path.startsWith('/webhooks')) {
      response = await handleWebhooks(req, path, method);
    } else if (path === '/health') {
      response = successResponse({ status: 'ok', timestamp: new Date().toISOString() });
    } else {
      response = errorResponse('Not found', 404);
    }

    return addCorsHeaders(response);
  } catch (error) {
    console.error('API Error:', error);
    const response = errorResponse('Internal server error', 500);
    return addCorsHeaders(response);
  }
};

// Auth handlers
async function handleAuth(req: Request, path: string, method: string): Promise<Response> {
  if (path === '/auth/profile' && method === 'GET') {
    const auth = await authenticateUser(req);
    if (!auth) return errorResponse('Unauthorized', 401);

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', auth.userId)
      .single();

    return successResponse({ user: user || { id: auth.userId } });
  }

  return errorResponse('Not found', 404);
}

// Video handlers
async function handleVideos(req: Request, path: string, method: string): Promise<Response> {
  const auth = await authenticateUser(req);
  if (!auth) return errorResponse('Unauthorized', 401);

  // GET /videos - List videos
  if (path === '/videos' && method === 'GET') {
    const { data: videos } = await supabase
      .from('videos')
      .select('*')
      .eq('user_id', auth.userId)
      .order('created_at', { ascending: false });

    return successResponse({ videos: videos || [] });
  }

  // POST /videos/upload - Upload video
  if (path === '/videos/upload' && method === 'POST') {
    try {
      const formData = await req.formData();
      const file = formData.get('video') as File;
      
      if (!file) {
        return errorResponse('No video file provided');
      }

      // Validate file
      if (!file.type.startsWith('video/')) {
        return errorResponse('Invalid file type. Please upload a video file.');
      }

      if (file.size > 500 * 1024 * 1024) { // 500MB limit
        return errorResponse('File too large. Maximum size is 500MB.');
      }

      // Save file to temp directory
      const buffer = await file.arrayBuffer();
      const fileName = `video-${Date.now()}-${Math.floor(Math.random() * 1000000000)}.mp4`;
      const filePath = `/tmp/${fileName}`;
      
      // Write file using Node.js fs
      const fs = await import('fs');
      await fs.promises.writeFile(filePath, new Uint8Array(buffer));

      // Create video record
      const { data: video, error } = await supabase
        .from('videos')
        .insert({
          user_id: auth.userId,
          title: file.name,
          file_path: filePath,
          file_size: file.size,
          status: 'processing'
        })
        .select()
        .single();

      if (error) {
        return errorResponse('Failed to create video record');
      }

      // Start video processing in background
      const videoProcessor = new VideoProcessingService();
      videoProcessor.processVideo(filePath, video.id).catch(console.error);

      return successResponse({ 
        message: 'Video uploaded successfully',
        videoId: video.id,
        status: 'processing'
      });
    } catch (error) {
      console.error('Upload error:', error);
      return errorResponse('Upload failed', 500);
    }
  }

  // GET /videos/:id/status - Check processing status
  if (path.match(/^\/videos\/[^\/]+\/status$/) && method === 'GET') {
    const videoId = path.split('/')[2];
    
    const { data: video } = await supabase
      .from('videos')
      .select('status, processed_at')
      .eq('id', videoId)
      .eq('user_id', auth.userId)
      .single();

    if (!video) {
      return errorResponse('Video not found', 404);
    }

    return successResponse({ 
      status: video.status,
      processed_at: video.processed_at
    });
  }

  return errorResponse('Not found', 404);
}

// Clips handlers
async function handleClips(req: Request, path: string, method: string): Promise<Response> {
  const auth = await authenticateUser(req);
  if (!auth) return errorResponse('Unauthorized', 401);

  // GET /clips - List clips
  if (path === '/clips' && method === 'GET') {
    const { data: clips } = await supabase
      .from('engagement_segments')
      .select(`
        *,
        videos (title, thumbnail_url),
        hooks (hook_text, hook_type)
      `)
      .eq('videos.user_id', auth.userId)
      .order('engagement_score', { ascending: false });

    return successResponse({ clips: clips || [] });
  }

  return errorResponse('Not found', 404);
}

// Analytics handlers
async function handleAnalytics(req: Request, path: string, method: string): Promise<Response> {
  const auth = await authenticateUser(req);
  if (!auth) return errorResponse('Unauthorized', 401);

  if (path === '/analytics/dashboard' && method === 'GET') {
    // Get video stats
    const { data: videoStats } = await supabase
      .from('videos')
      .select('status')
      .eq('user_id', auth.userId);

    const totalVideos = videoStats?.length || 0;
    const processedVideos = videoStats?.filter(v => v.status === 'completed').length || 0;
    const processingVideos = videoStats?.filter(v => v.status === 'processing').length || 0;

    // Get clips stats
    const { data: clipsStats } = await supabase
      .from('engagement_segments')
      .select('engagement_score, videos!inner(user_id)')
      .eq('videos.user_id', auth.userId);

    const totalClips = clipsStats?.length || 0;
    const avgEngagement = clipsStats?.length 
      ? clipsStats.reduce((sum, clip) => sum + (clip.engagement_score || 0), 0) / clipsStats.length 
      : 0;

    return successResponse({
      totalVideos,
      processedVideos,
      processingVideos,
      totalClips,
      avgEngagement: Math.round(avgEngagement * 100) / 100
    });
  }

  return errorResponse('Not found', 404);
}

// AI handlers
async function handleAI(req: Request, path: string, method: string): Promise<Response> {
  const auth = await authenticateUser(req);
  if (!auth) return errorResponse('Unauthorized', 401);

  if (path === '/ai/test-analysis' && method === 'POST') {
    try {
      const aiService = new AIService();
      const analysis = await aiService.testAnalysis();
      
      return successResponse({ 
        success: true,
        analysis,
        message: 'AI analysis test completed successfully'
      });
    } catch (error) {
      console.error('AI test analysis error:', error);
      return errorResponse('AI analysis test failed', 500);
    }
  }

  if (path === '/ai/generate' && method === 'POST') {
    // Handle AI generation
    return successResponse({ received: true });
  }

  return errorResponse('Not found', 404);
}

// Subscriptions handlers
async function handleSubscriptions(req: Request, path: string, method: string): Promise<Response> {
  const auth = await authenticateUser(req);
  if (!auth) return errorResponse('Unauthorized', 401);

  if (path === '/subscriptions/status' && method === 'GET') {
    // Mock subscription data for now
    return successResponse({
      plan: 'free',
      status: 'active',
      videos_limit: 10,
      videos_used: 3
    });
  }

  return errorResponse('Not found', 404);
}

// Webhooks handlers
async function handleWebhooks(req: Request, path: string, method: string): Promise<Response> {
  if (path === '/webhooks/stripe' && method === 'POST') {
    // Handle Stripe webhooks
    return successResponse({ received: true });
  }

  return errorResponse('Not found', 404);
}

export const config: Config = {
  path: "/api/*"
}; 