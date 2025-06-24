import { StorageService } from '../_utils/storage.js';
import { requireAuth } from '../_utils/auth.js';
import { withCors } from '../_utils/cors.js';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { fileName, fileType, fileSize } = req.body;
    const userId = req.user?.id;

    if (!fileName || !fileType) {
      return res.status(400).json({ 
        error: 'Missing required fields: fileName, fileType' 
      });
    }

    // Validate file type
    if (!fileType.startsWith('video/') && !fileType.startsWith('audio/') && !fileType.startsWith('image/')) {
      return res.status(400).json({ 
        error: 'Only video, audio, and image files are allowed' 
      });
    }

    // Validate file size (500MB limit - Supabase Storage limit)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (fileSize && fileSize > maxSize) {
      return res.status(400).json({ 
        error: 'File size exceeds 500MB limit' 
      });
    }

    // Generate presigned upload URL using Supabase Storage
    const uploadData = await StorageService.generateUploadUrl(
      fileName,
      fileType,
      userId
    );

    res.json({
      uploadUrl: uploadData.uploadUrl,
      filePath: uploadData.filePath,
      token: uploadData.token,
      bucket: uploadData.bucket,
      expiresIn: 3600, // 1 hour
      metadata: {
        userId,
        fileName,
        fileType,
        uploadTime: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('Error generating upload URL:', error);
    res.status(500).json({ 
      error: 'Failed to generate upload URL',
      message: error.message 
    });
  }
}

export default withCors(requireAuth(handler)); 