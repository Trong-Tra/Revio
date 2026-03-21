import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

// Configure S3 client for MinIO
const s3Client = new S3Client({
  endpoint: process.env.STORAGE_USE_SSL === 'true'
    ? `https://${process.env.STORAGE_ENDPOINT}:${process.env.STORAGE_PORT}`
    : `http://${process.env.STORAGE_ENDPOINT}:${process.env.STORAGE_PORT}`,
  region: 'us-east-1', // MinIO doesn't use regions, but SDK requires it
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY || 'minioadmin',
    secretAccessKey: process.env.STORAGE_SECRET_KEY || 'minioadmin',
  },
  forcePathStyle: true, // Required for MinIO
});

const BUCKET = process.env.STORAGE_BUCKET || 'revio-papers';

export interface UploadResult {
  key: string;
  url: string;
}

export const storage = {
  async uploadFile(
    buffer: Buffer,
    originalName: string,
    contentType: string
  ): Promise<UploadResult> {
    const key = `papers/${uuidv4()}-${originalName}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      })
    );

    // Build public URL
    const protocol = process.env.STORAGE_USE_SSL === 'true' ? 'https' : 'http';
    const url = `${protocol}://${process.env.STORAGE_ENDPOINT}:${process.env.STORAGE_PORT}/${BUCKET}/${key}`;

    return { key, url };
  },

  async getSignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
    });

    return getSignedUrl(s3Client, command, { expiresIn });
  },

  async deleteFile(key: string): Promise<void> {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: key,
      })
    );
  },
};
