import { supabaseAdmin, supabase } from '../_utils/supabase.js';
import { UserModel } from '../_utils/models.js';
import { withCors } from '../_utils/cors.js';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

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
      email: authData.user.email,
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
}

export default withCors(handler); 