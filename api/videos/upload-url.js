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
    if (!fileType.startsWith('video/')) {
      return res.status(400).json({ 
        error: 'Only video files are allowed' 
      });
    }

    // Validate file size (500MB limit)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (fileSize && fileSize > maxSize) {
      return res.status(400).json({ 
        error: 'File size exceeds 500MB limit' 
      });
    }

    // Generate presigned upload URL
    const uploadData = await StorageService.generateUploadUrl(
      fileName,
      fileType,
      userId
    );

    res.json({
      uploadUrl: uploadData.uploadUrl,
      key: uploadData.key,
      bucket: uploadData.bucket,
      fields: {
        'Content-Type': fileType,
        'x-amz-meta-user-id': userId,
        'x-amz-meta-upload-time': new Date().toISOString(),
      },
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