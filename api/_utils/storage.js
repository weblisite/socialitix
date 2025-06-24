import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BUCKET_NAME = 'videos'; // Supabase storage bucket

export class StorageService {
  // Generate a presigned URL for direct upload from the client
  static async generateUploadUrl(fileName, fileType, userId) {
    try {
      // Create unique file path
      const fileExtension = fileName.split('.').pop();
      const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
      const filePath = `uploads/${userId}/${uniqueFileName}`;

      // Generate signed upload URL (valid for 1 hour)
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUploadUrl(filePath, {
          expiresIn: 3600, // 1 hour
          upsert: true
        });

      if (error) {
        console.error('Supabase upload URL error:', error);
        throw new Error('Failed to generate upload URL: ' + error.message);
      }

      return {
        uploadUrl: data.signedUrl,
        filePath: filePath,
        token: data.token,
        bucket: BUCKET_NAME,
      };
    } catch (error) {
      console.error('Error generating upload URL:', error);
      throw new Error('Failed to generate upload URL');
    }
  }

  // Generate a public URL for accessing files
  static async generateDownloadUrl(filePath, expiresIn = 3600) {
    try {
      // For public files, you can use getPublicUrl
      const { data } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      if (data?.publicUrl) {
        return data.publicUrl;
      }

      // For private files, use signed URL
      const { data: signedData, error } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        console.error('Supabase download URL error:', error);
        throw new Error('Failed to generate download URL: ' + error.message);
      }

      return signedData.signedUrl;
    } catch (error) {
      console.error('Error generating download URL:', error);
      throw new Error('Failed to generate download URL');
    }
  }

  // Upload a file directly (for small files or server-side uploads)
  static async uploadFile(filePath, fileBuffer, contentType, userId) {
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, fileBuffer, {
          contentType,
          metadata: {
            userId,
            uploadTime: new Date().toISOString(),
          },
          upsert: true
        });

      if (error) {
        console.error('Supabase upload error:', error);
        throw new Error('Failed to upload file: ' + error.message);
      }

      return {
        path: data.path,
        fullPath: data.fullPath,
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file');
    }
  }

  // Delete a file from Supabase Storage
  static async deleteFile(filePath) {
    try {
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        console.error('Supabase delete error:', error);
        throw new Error('Failed to delete file: ' + error.message);
      }

      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Failed to delete file');
    }
  }

  // Get file info from Supabase Storage
  static async getFileInfo(filePath) {
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list(filePath.split('/').slice(0, -1).join('/'), {
          search: filePath.split('/').pop()
        });

      if (error) {
        console.error('Supabase file info error:', error);
        throw new Error('Failed to get file info: ' + error.message);
      }

      const fileInfo = data?.[0];
      if (!fileInfo) {
        throw new Error('File not found');
      }

      return {
        name: fileInfo.name,
        size: fileInfo.metadata?.size || 0,
        type: fileInfo.metadata?.mimetype || 'application/octet-stream',
        lastModified: fileInfo.updated_at,
        metadata: fileInfo.metadata,
      };
    } catch (error) {
      console.error('Error getting file info:', error);
      throw new Error('Failed to get file info');
    }
  }

  // List files in a directory
  static async listFiles(directoryPath = '', userId = null) {
    try {
      const searchPath = userId ? `uploads/${userId}` : directoryPath;
      
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list(searchPath, {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) {
        console.error('Supabase list files error:', error);
        throw new Error('Failed to list files: ' + error.message);
      }

      return data.map(file => ({
        name: file.name,
        size: file.metadata?.size || 0,
        type: file.metadata?.mimetype || 'application/octet-stream',
        lastModified: file.updated_at,
        path: `${searchPath}/${file.name}`,
      }));
    } catch (error) {
      console.error('Error listing files:', error);
      throw new Error('Failed to list files');
    }
  }

  // Create storage bucket if it doesn't exist (admin operation)
  static async createBucket() {
    try {
      const { data, error } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: false, // Set to true if you want public access
        allowedMimeTypes: ['video/*', 'audio/*', 'image/*'],
        fileSizeLimit: 500 * 1024 * 1024, // 500MB limit
      });

      if (error && !error.message.includes('already exists')) {
        console.error('Supabase create bucket error:', error);
        throw new Error('Failed to create bucket: ' + error.message);
      }

      return data;
    } catch (error) {
      console.error('Error creating bucket:', error);
      throw new Error('Failed to create bucket');
    }
  }
} 