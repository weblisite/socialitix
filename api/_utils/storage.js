import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-west-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'socialitix-videos';

export class StorageService {
  // Generate a presigned URL for direct upload from the client
  static async generateUploadUrl(fileName, fileType, userId) {
    try {
      const key = `uploads/${userId}/${Date.now()}-${fileName}`;
      
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: fileType,
        Metadata: {
          'user-id': userId,
          'upload-time': new Date().toISOString(),
        },
      });

      const signedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 3600, // 1 hour
      });

      return {
        uploadUrl: signedUrl,
        key,
        bucket: BUCKET_NAME,
      };
    } catch (error) {
      console.error('Error generating upload URL:', error);
      throw new Error('Failed to generate upload URL');
    }
  }

  // Generate a presigned URL for downloading/viewing files
  static async generateDownloadUrl(key, expiresIn = 3600) {
    try {
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      const signedUrl = await getSignedUrl(s3Client, command, {
        expiresIn,
      });

      return signedUrl;
    } catch (error) {
      console.error('Error generating download URL:', error);
      throw new Error('Failed to generate download URL');
    }
  }

  // Delete a file from S3
  static async deleteFile(key) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      await s3Client.send(command);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Failed to delete file');
    }
  }

  // Get file info from S3
  static async getFileInfo(key) {
    try {
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      const response = await s3Client.send(command);
      return {
        size: response.ContentLength,
        type: response.ContentType,
        lastModified: response.LastModified,
        metadata: response.Metadata,
      };
    } catch (error) {
      console.error('Error getting file info:', error);
      throw new Error('Failed to get file info');
    }
  }
} 