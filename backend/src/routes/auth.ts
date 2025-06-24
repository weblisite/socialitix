import { Router } from 'express';
import { supabaseAdmin, supabase } from '../config/supabase.js';
import { UserModel } from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, password, and name are required' });
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        return res.status(400).json({ message: 'User already exists' });
      }
      return res.status(400).json({ message: authError.message });
    }

    if (!authData.user) {
      return res.status(500).json({ message: 'Failed to create user' });
    }

    // Create user profile in our database
    const userProfile = await UserModel.create({
      id: authData.user.id,
      email: authData.user.email!,
      name,
      email_verified: true,
      subscription_tier: 'free',
      subscription_status: 'active',
      uploads_used: 0,
      uploads_limit: 52428800, // 50MB
      clips_used: 0,
      clips_limit: 3,
      storage_used: 0,
      storage_limit: 52428800, // 50MB
      role: 'admin',
      notifications_enabled: true,
      auto_subtitles: false,
      default_format: 'tiktok',
      default_quality: '720p'
    });

    if (!userProfile) {
      // Cleanup auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return res.status(500).json({ message: 'Failed to create user profile' });
    }

    // Generate session for the user
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email,
      password
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: userProfile.id,
        email: userProfile.email,
        name: userProfile.name,
        subscription_tier: userProfile.subscription_tier,
        subscription_status: userProfile.subscription_status
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!data.user || !data.session) {
      return res.status(400).json({ message: 'Login failed' });
    }

    // Get user profile from our database
    const userProfile = await UserModel.findById(data.user.id);
    if (!userProfile) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    // Update last login
    await UserModel.update(data.user.id, {
      last_login_at: new Date().toISOString()
    });

    res.json({
      message: 'Login successful',
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: {
        id: userProfile.id,
        email: userProfile.email,
        name: userProfile.name,
        subscription_tier: userProfile.subscription_tier,
        subscription_status: userProfile.subscription_status
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({ message: 'Refresh token required' });
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token
    });

    if (error || !data.session) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    res.json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const user = await UserModel.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { name, avatar, notifications_enabled, auto_subtitles, default_format, default_quality } = req.body;

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (avatar !== undefined) updates.avatar = avatar;
    if (notifications_enabled !== undefined) updates.notifications_enabled = notifications_enabled;
    if (auto_subtitles !== undefined) updates.auto_subtitles = auto_subtitles;
    if (default_format !== undefined) updates.default_format = default_format;
    if (default_quality !== undefined) updates.default_quality = default_quality;

    const updatedUser = await UserModel.update(userId, updates);
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      message: 'Profile updated successfully',
      user: updatedUser 
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Logout endpoint
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      // Sign out from Supabase
      await supabase.auth.signOut();
    }

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Generate API key
router.post('/api-key', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const apiKey = UserModel.generateApiKey();
    
    const updatedUser = await UserModel.update(userId, { api_key: apiKey });
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      message: 'API key generated successfully',
      api_key: apiKey
    });
  } catch (error) {
    console.error('API key generation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router; 