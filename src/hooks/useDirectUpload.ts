import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface UploadResult {
  success: boolean;
  videoId?: string;
  error?: string;
}

interface UseDirectUploadProps {
  onProgress?: (progress: UploadProgress) => void;
  onComplete?: (result: UploadResult) => void;
}

export const useDirectUpload = ({ onProgress, onComplete }: UseDirectUploadProps = {}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadFile = async (file: File, title?: string): Promise<UploadResult> => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Check file size
      const maxSize = 500 * 1024 * 1024; // 500MB
      if (file.size > maxSize) {
        throw new Error('File size exceeds 500MB limit');
      }

      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('User not authenticated');
      }

      // Step 1: Get presigned upload URL from backend
      const uploadUrlResponse = await fetch('/api/videos/upload-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        }),
      });

      if (!uploadUrlResponse.ok) {
        const error = await uploadUrlResponse.json();
        throw new Error(error.error || 'Failed to get upload URL');
      }

      const { uploadUrl, filePath, token } = await uploadUrlResponse.json();

      // Step 2: Upload directly to Supabase Storage
      const uploadResult = await uploadToSupabase(file, uploadUrl, onProgress);
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Upload failed');
      }

      // Step 3: Notify backend of completed upload
      const completeResponse = await fetch('/api/videos/complete-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          filePath,
          fileName: file.name,
          title: title || file.name,
        }),
      });

      if (!completeResponse.ok) {
        const error = await completeResponse.json();
        throw new Error(error.error || 'Failed to complete upload');
      }

      const result = await completeResponse.json();
      
      const finalResult = {
        success: true,
        videoId: result.video?.id,
      };

      onComplete?.(finalResult);
      return finalResult;

    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
      
      onComplete?.(errorResult);
      return errorResult;
    } finally {
      setIsUploading(false);
    }
  };

  const uploadToSupabase = async (
    file: File, 
    uploadUrl: string, 
    onProgress?: (progress: UploadProgress) => void
  ): Promise<{ success: boolean; error?: string }> => {
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = {
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100),
          };
          
          setUploadProgress(progress.percentage);
          onProgress?.(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({ success: true });
        } else {
          resolve({ 
            success: false, 
            error: `Upload failed with status ${xhr.status}` 
          });
        }
      };

      xhr.onerror = () => {
        resolve({ 
          success: false, 
          error: 'Network error during upload' 
        });
      };

      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });
  };

  // Alternative method using Supabase client directly (for smaller files)
  const uploadFileDirectly = async (file: File, title?: string): Promise<UploadResult> => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('User not authenticated');
      }

      // Generate unique file path
      const fileExtension = file.name.split('.').pop();
      const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
      const filePath = `uploads/${session.user.id}/${uniqueFileName}`;

      // Upload directly using Supabase client
      const { data, error } = await supabase.storage
        .from('videos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

      setUploadProgress(100);

      // Notify backend of completed upload
      const completeResponse = await fetch('/api/videos/complete-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          filePath: data.path,
          fileName: file.name,
          title: title || file.name,
        }),
      });

      if (!completeResponse.ok) {
        const error = await completeResponse.json();
        throw new Error(error.error || 'Failed to complete upload');
      }

      const result = await completeResponse.json();
      
      const finalResult = {
        success: true,
        videoId: result.video?.id,
      };

      onComplete?.(finalResult);
      return finalResult;

    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
      
      onComplete?.(errorResult);
      return errorResult;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadFile,
    uploadFileDirectly,
    isUploading,
    uploadProgress,
  };
}; 