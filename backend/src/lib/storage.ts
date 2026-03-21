import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, CreateBucketCommand, HeadBucketCommand, PutBucketPolicyCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

// Detect storage provider
const isR2 = process.env.STORAGE_ENDPOINT?.includes('r2.cloudflarestorage.com');
const isMinIO = !isR2;

// Build endpoint URL
function buildEndpoint(): string {
  const endpoint = process.env.STORAGE_ENDPOINT || 'localhost';
  
  // If already full URL, use it
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  
  // Otherwise construct from parts
  const protocol = process.env.STORAGE_USE_SSL === 'true' ? 'https' : 'http';
  const port = process.env.STORAGE_PORT || (isR2 ? '443' : '9000');
  
  // R2 doesn't need port in URL
  if (isR2) {
    return `${protocol}://${endpoint}`;
  }
  
  return `${protocol}://${endpoint}:${port}`;
}

const ENDPOINT = buildEndpoint();
console.log('[Storage] Endpoint:', ENDPOINT);
console.log('[Storage] Provider:', isR2 ? 'R2' : 'MinIO');

// Configure S3 client
const s3Client = new S3Client({
  endpoint: ENDPOINT,
  region: isR2 ? 'auto' : 'us-east-1',
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY || 'minioadmin',
    secretAccessKey: process.env.STORAGE_SECRET_KEY || 'minioadmin',
  },
  forcePathStyle: isMinIO, // Required for MinIO, NOT for R2
});

const BUCKET = process.env.STORAGE_BUCKET || 'revio-papers';
const PUBLIC_URL = process.env.STORAGE_PUBLIC_URL;

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

// Ensure bucket exists
async function ensureBucketExists() {
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET }));
    console.log(`[Storage] Bucket exists: ${BUCKET}`);
  } catch (error: any) {
    if (error.name === 'NotFound' || error.name === 'NoSuchBucket') {
      await s3Client.send(new CreateBucketCommand({ Bucket: BUCKET }));
      console.log(`[Storage] Created bucket: ${BUCKET}`);
    } else {
      console.error(`[Storage] Error checking bucket:`, error.message);
      // Don't throw - R2 might have different error format
    }
  }
  
  // Try to set bucket policy (may fail on R2, that's OK)
  try {
    await s3Client.send(
      new PutBucketPolicyCommand({
        Bucket: BUCKET,
        Policy: JSON.stringify(BUCKET_POLICY),
      })
    );
  } catch (policyError) {
    console.log(`[Storage] Bucket policy not set (may not be supported)`);
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
    await ensureBucketExists();
    
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
    let url: string;
    if (PUBLIC_URL) {
      url = `${PUBLIC_URL}/${key}`;
    } else {
      // Use endpoint + bucket + key
      url = `${ENDPOINT}/${BUCKET}/${key}`;
    }

    console.log(`[Storage] Uploaded: ${key} -> ${url.substring(0, 80)}...`);
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
    console.log(`[Storage] Deleted: ${key}`);
  },
};
