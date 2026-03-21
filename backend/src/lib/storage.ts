import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, CreateBucketCommand, HeadBucketCommand, PutBucketPolicyCommand, PutBucketAclCommand } from '@aws-sdk/client-s3';
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

// Bucket policy for public read access
const BUCKET_POLICY = {
  Version: '2012-10-17',
  Statement: [
    {
      Sid: 'PublicReadGetObject',
      Effect: 'Allow',
      Principal: '*',
      Action: ['s3:GetObject'],
      Resource: [`arn:aws:s3:::${BUCKET}/*`],
    },
  ],
};

// Ensure bucket exists and is public
async function ensureBucketExists() {
  let bucketExists = false;
  
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET }));
    bucketExists = true;
  } catch (error: any) {
    if (error.name === 'NotFound' || error.name === 'NoSuchBucket') {
      // Create the bucket
      await s3Client.send(new CreateBucketCommand({ Bucket: BUCKET }));
      console.log(`[Storage] Created bucket: ${BUCKET}`);
    } else {
      throw error;
    }
  }
  
  // Always ensure bucket policy is set (for existing buckets too)
  try {
    await s3Client.send(
      new PutBucketPolicyCommand({
        Bucket: BUCKET,
        Policy: JSON.stringify(BUCKET_POLICY),
      })
    );
    
    // Also set bucket ACL to public-read
    await s3Client.send(
      new PutBucketAclCommand({
        Bucket: BUCKET,
        ACL: 'public-read',
      })
    );
    
    if (bucketExists) {
      console.log(`[Storage] Updated bucket policy for: ${BUCKET}`);
    } else {
      console.log(`[Storage] Set public read access for: ${BUCKET}`);
    }
  } catch (policyError) {
    console.warn(`[Storage] Could not set bucket policy:`, policyError);
  }
}

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
    // Ensure bucket exists before uploading
    await ensureBucketExists();
    
    const key = `papers/${uuidv4()}-${originalName}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        ACL: 'public-read',
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
