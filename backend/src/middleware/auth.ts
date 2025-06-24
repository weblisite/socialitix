import { Request, Response, NextFunction } from 'express'
import { supabase, hasValidSupabaseConfig } from '../config/supabase.js'
import { UserModel } from '../models/User.js'
import winston from 'winston'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

interface AuthRequest extends Request {
  userId?: string
  user?: any
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  // If Supabase is not configured, skip authentication for development
  if (!hasValidSupabaseConfig) {
    logger.warn('Supabase not configured, skipping authentication (development mode)');
    req.userId = 'eb5f1e41-b42a-48d0-9bda-05e8be30ae61'; // Use a consistent dev user ID
    req.user = { 
      id: 'eb5f1e41-b42a-48d0-9bda-05e8be30ae61', 
      email: 'dev@example.com',
      name: 'Development User',
      subscription_tier: 'pro'
    };
    return next();
  }

  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    // In development mode without Supabase, allow requests without tokens
    if (!hasValidSupabaseConfig) {
      req.userId = 'eb5f1e41-b42a-48d0-9bda-05e8be30ae61';
      req.user = { 
        id: 'eb5f1e41-b42a-48d0-9bda-05e8be30ae61', 
        email: 'dev@example.com',
        name: 'Development User',
        subscription_tier: 'pro'
      };
      return next();
    }
    return res.status(401).json({ message: 'Access token required' })
  }

  try {
    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      // In development mode, if token validation fails, use dev user
      if (!hasValidSupabaseConfig) {
        req.userId = 'eb5f1e41-b42a-48d0-9bda-05e8be30ae61';
        req.user = { 
          id: 'eb5f1e41-b42a-48d0-9bda-05e8be30ae61', 
          email: 'dev@example.com',
          name: 'Development User',
          subscription_tier: 'pro'
        };
        return next();
      }
      return res.status(403).json({ message: 'Invalid or expired token' })
    }

    // Get user data from our database
    const userData = await UserModel.findById(user.id)
    if (!userData) {
      // In development mode, create a default user if not found
      if (!hasValidSupabaseConfig) {
        req.userId = user.id;
        req.user = { 
          id: user.id, 
          email: user.email || 'dev@example.com',
          name: user.user_metadata?.name || 'Development User',
          subscription_tier: 'pro'
        };
        return next();
      }
      return res.status(404).json({ message: 'User not found' })
    }

    req.userId = user.id
    req.user = userData
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown auth error';
    logger.error('Authentication error:', { error: errorMessage });
    
    // In development mode, fallback to dev user on any auth error
    if (!hasValidSupabaseConfig) {
      req.userId = 'eb5f1e41-b42a-48d0-9bda-05e8be30ae61';
      req.user = { 
        id: 'eb5f1e41-b42a-48d0-9bda-05e8be30ae61', 
        email: 'dev@example.com',
        name: 'Development User',
        subscription_tier: 'pro'
      };
      return next();
    }
    
    return res.status(403).json({ message: 'Invalid or expired token' })
  }
}

export const authenticateApiKey = async (req: AuthRequest, res: Response, next: NextFunction) => {
  // If Supabase is not configured, skip API key authentication for development
  if (!hasValidSupabaseConfig) {
    logger.warn('Supabase not configured, skipping API key authentication (development mode)');
    req.userId = 'dev-user-id';
    req.user = { id: 'dev-user-id', email: 'dev@example.com' };
    return next();
  }

  const apiKey = req.headers['x-api-key'] as string

  if (!apiKey) {
    return res.status(401).json({ message: 'API key required' })
  }

  try {
    const user = await UserModel.findByApiKey(apiKey)
    if (!user) {
      return res.status(403).json({ message: 'Invalid API key' })
    }

    req.userId = user.id
    req.user = user
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown API key error';
    logger.error('API key authentication error:', { error: errorMessage });
    return res.status(500).json({ message: 'Authentication error' })
  }
}

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  // If Supabase is not configured, set default user for development
  if (!hasValidSupabaseConfig) {
    req.userId = 'dev-user-id';
    req.user = { id: 'dev-user-id', email: 'dev@example.com' };
    return next();
  }

  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return next()
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (!error && user) {
      const userData = await UserModel.findById(user.id)
      if (userData) {
        req.userId = user.id
        req.user = userData
      }
    }
    
    next()
  } catch (error) {
    next()
  }
} 