import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import type { Context } from '@netlify/functions';

// Initialize Supabase client
export const supabase = createClient(
  Netlify.env.get('SUPABASE_URL') || '',
  Netlify.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

// Auth middleware for Netlify Functions
export async function authenticateUser(req: Request): Promise<{ userId: string } | null> {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      // Development fallback
      if (Netlify.env.get('NODE_ENV') === 'development') {
        return { userId: 'eb5f1e41-b42a-48d0-9bda-05e8be30ae61' };
      }
      return null;
    }

    const token = authHeader.substring(7);
    const jwtSecret = Netlify.env.get('JWT_SECRET') || 'your-secret-key';
    
    const decoded = jwt.verify(token, jwtSecret) as any;
    return { userId: decoded.userId || decoded.sub };
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

// Error response helper
export function errorResponse(message: string, status: number = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Success response helper
export function successResponse(data: any, status: number = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

// CORS headers helper
export function addCorsHeaders(response: Response) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

// Handle preflight requests
export function handleCors(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }
  return null;
} 