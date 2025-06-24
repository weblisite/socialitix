import { supabase } from '../_utils/supabase.js';
import { UserModel } from '../_utils/models.js';
import { withCors } from '../_utils/cors.js';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

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
}

export default withCors(handler); 