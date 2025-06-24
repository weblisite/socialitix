const { supabase, authenticateUser, errorResponse, successResponse, handleCors, addCorsHeaders } = require('./utils/shared.js');
const { VideoProcessingService } = require('./utils/videoProcessing.js');
const { AIService } = require('./utils/aiService.js');

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
      },
      body: ''
    };
  }

  const path = event.path.replace('/.netlify/functions/api', '');
  const method = event.httpMethod;

  console.log(`${method} ${path}`);

  try {
    let response;

    // Route handling
    if (path.startsWith('/auth')) {
      response = await handleAuth(event, path, method);
    } else if (path.startsWith('/videos')) {
      response = await handleVideos(event, path, method);
    } else if (path.startsWith('/clips')) {
      response = await handleClips(event, path, method);
    } else if (path.startsWith('/analytics')) {
      response = await handleAnalytics(event, path, method);
    } else if (path.startsWith('/ai')) {
      response = await handleAI(event, path, method);
    } else if (path.startsWith('/subscriptions')) {
      response = await handleSubscriptions(event, path, method);
    } else if (path.startsWith('/webhooks')) {
      response = await handleWebhooks(event, path, method);
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
async function handleAuth(event, path, method) {
  if (path === '/auth/profile' && method === 'GET') {
    const auth = await authenticateUser(event);
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
async function handleVideos(event, path, method) {
  const auth = await authenticateUser(event);
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

  // POST /videos/upload - Upload video (simplified for now)
  if (path === '/videos/upload' && method === 'POST') {
    return successResponse({ 
      message: 'Video upload endpoint - implementation in progress',
      videoId: 'test-video-id',
      status: 'processing'
    });
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
      status: video.status || 'completed',
      processed_at: video.processed_at
    });
  }

  return errorResponse('Not found', 404);
}

// Clips handlers
async function handleClips(event, path, method) {
  const auth = await authenticateUser(event);
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
async function handleAnalytics(event, path, method) {
  const auth = await authenticateUser(event);
  if (!auth) return errorResponse('Unauthorized', 401);

  if (path === '/analytics/dashboard' && method === 'GET') {
    // Return mock analytics data for now
    return successResponse({
      totalVideos: 5,
      totalClips: 15,
      totalViews: 1250,
      avgEngagement: 8.5,
      recentVideos: [],
      topPerformingClips: []
    });
  }

  return errorResponse('Not found', 404);
}

// AI handlers
async function handleAI(event, path, method) {
  const auth = await authenticateUser(event);
  if (!auth) return errorResponse('Unauthorized', 401);

  if (path === '/ai/analyze' && method === 'POST') {
    // Return mock AI analysis for now
    return successResponse({
      analysis: 'AI analysis completed',
      segments: [],
      hooks: []
    });
  }

  return errorResponse('Not found', 404);
}

// Subscription handlers
async function handleSubscriptions(event, path, method) {
  const auth = await authenticateUser(event);
  if (!auth) return errorResponse('Unauthorized', 401);

  if (path === '/subscriptions/status' && method === 'GET') {
    return successResponse({
      plan: 'free',
      status: 'active',
      usage: { videos: 0, clips: 0 }
    });
  }

  return errorResponse('Not found', 404);
}

// Webhook handlers
async function handleWebhooks(event, path, method) {
  if (path === '/webhooks/stripe' && method === 'POST') {
    return successResponse({ received: true });
  }

  return errorResponse('Not found', 404);
} 