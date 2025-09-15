import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';

const s3Client = new S3Client({ region: process.env.AWS_REGION });
const BUCKET_NAME = process.env.USER_CONTENT_BUCKET_NAME;

export interface ImageProcessingOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  fit?: 'cover' | 'contain' | 'fill';
}

export class ImageProcessingService {
  async processImage(key: string, options: ImageProcessingOptions): Promise<string> {
    try {
      // Get original image from S3
      const getCommand = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key
      });
      
      const response = await s3Client.send(getCommand);
      const imageBuffer = await this.streamToBuffer(response.Body as any);

      // Process image with Sharp
      let sharpInstance = sharp(imageBuffer);

      if (options.width || options.height) {
        sharpInstance = sharpInstance.resize(options.width, options.height, {
          fit: options.fit || 'cover',
          withoutEnlargement: true
        });
      }

      if (options.format) {
        switch (options.format) {
          case 'jpeg':
            sharpInstance = sharpInstance.jpeg({ quality: options.quality || 85 });
            break;
          case 'png':
            sharpInstance = sharpInstance.png({ quality: options.quality || 85 });
            break;
          case 'webp':
            sharpInstance = sharpInstance.webp({ quality: options.quality || 85 });
            break;
        }
      }

      const processedBuffer = await sharpInstance.toBuffer();

      // Generate processed image key
      const processedKey = this.generateProcessedKey(key, options);

      // Upload processed image back to S3
      const putCommand = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: processedKey,
        Body: processedBuffer,
        ContentType: `image/${options.format || 'jpeg'}`,
        ServerSideEncryption: 'aws:kms',
        SSEKMSKeyId: process.env.CONTENT_KMS_KEY_ID
      });

      await s3Client.send(putCommand);

      return processedKey;
    } catch (error) {
      console.error('Image processing error:', error);
      throw new Error('Failed to process image');
    }
  }

  async generateThumbnails(key: string): Promise<{ small: string; medium: string; large: string }> {
    const thumbnails = await Promise.all([
      this.processImage(key, { width: 150, height: 150, format: 'webp', quality: 80 }),
      this.processImage(key, { width: 400, height: 400, format: 'webp', quality: 85 }),
      this.processImage(key, { width: 800, height: 800, format: 'webp', quality: 90 })
    ]);

    return {
      small: thumbnails[0],
      medium: thumbnails[1],
      large: thumbnails[2]
    };
  }

  private generateProcessedKey(originalKey: string, options: ImageProcessingOptions): string {
    const pathParts = originalKey.split('/');
    const fileName = pathParts.pop();
    const basePath = pathParts.join('/');
    
    const suffix = `_${options.width || 'auto'}x${options.height || 'auto'}_${options.quality || 85}q.${options.format || 'jpeg'}`;
    const nameWithoutExt = fileName?.split('.')[0];
    
    return `${basePath}/processed/${nameWithoutExt}${suffix}`;
  }

  private async streamToBuffer(stream: any): Promise<Buffer> {
    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }
}