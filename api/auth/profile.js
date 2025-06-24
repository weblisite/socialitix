import { UserModel } from '../_utils/models.js';
import { requireAuth } from '../_utils/auth.js';
import { withCors } from '../_utils/cors.js';

async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const user = await UserModel.findById(req.userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ user });
    } catch (error) {
      console.error('Profile error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { name, avatar, notifications_enabled, auto_subtitles, default_format, default_quality } = req.body;

      const updates = {};
      if (name !== undefined) updates.name = name;
      if (avatar !== undefined) updates.avatar = avatar;
      if (notifications_enabled !== undefined) updates.notifications_enabled = notifications_enabled;
      if (auto_subtitles !== undefined) updates.auto_subtitles = auto_subtitles;
      if (default_format !== undefined) updates.default_format = default_format;
      if (default_quality !== undefined) updates.default_quality = default_quality;

      const updatedUser = await UserModel.update(req.userId, updates);
      
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
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}

export default withCors(requireAuth(handler)); 