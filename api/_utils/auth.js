import { supabase } from './supabase.js';

export async function authenticateToken(req) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }

  const token = authHeader.substring(7);

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      throw new Error('Invalid token');
    }

    return { userId: user.id, user };
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export function requireAuth(handler) {
  return async (req, res) => {
    try {
      const auth = await authenticateToken(req);
      req.userId = auth.userId;
      req.user = auth.user;
      return handler(req, res);
    } catch (error) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: error.message 
      });
    }
  };
} 