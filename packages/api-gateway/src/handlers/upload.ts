import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({ region: process.env.AWS_REGION });
const BUCKET_NAME = process.env.USER_CONTENT_BUCKET_NAME;
const KMS_KEY_ID = process.env.CONTENT_KMS_KEY_ID;

interface UploadRequest {
  fileName: string;
  fileType: string;
  fileSize: number;
  category: 'profile' | 'story' | 'product' | 'general';
  userId: string;
}

export const getUploadUrlHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ code: 'VALIDATION_ERROR', message: 'Request body is required' })
      };
    }

    const { fileName, fileType, fileSize, category, userId }: UploadRequest = JSON.parse(event.body);

    // Validate input
    if (!fileName || !fileType || !fileSize || !category || !userId) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ 
          code: 'VALIDATION_ERROR', 
          message: 'fileName, fileType, fileSize, category, and userId are required' 
        })
      };
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(fileType)) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ 
          code: 'INVALID_FILE_TYPE', 
          message: 'Only JPEG, PNG, WebP, and GIF images are allowed' 
        })
      };
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (fileSize > maxSize) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ 
          code: 'FILE_TOO_LARGE', 
          message: 'File size must be less than 10MB' 
        })
      };
    }

    // Generate unique file key
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const key = `${category}/${userId}/${uniqueFileName}`;

    // Create presigned URL for upload
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: fileType,
      ServerSideEncryption: 'aws:kms',
      SSEKMSKeyId: KMS_KEY_ID,
      Metadata: {
        'original-name': fileName,
        'user-id': userId,
        'category': category,
        'upload-timestamp': new Date().toISOString()
      }
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 }); // 5 minutes

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        success: true,
        uploadUrl,
        key,
        expiresIn: 300
      })
    };

  } catch (error: any) {
    console.error('getUploadUrlHandler error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        code: 'INTERNAL_ERROR', 
        message: error?.message || 'Failed to generate upload URL' 
      })
    };
  }
};

export const confirmUploadHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ code: 'VALIDATION_ERROR', message: 'Request body is required' })
      };
    }

    const { key, userId } = JSON.parse(event.body);

    if (!key || !userId) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ 
          code: 'VALIDATION_ERROR', 
          message: 'key and userId are required' 
        })
      };
    }

    // Generate public URL for the uploaded image
    const publicUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    // TODO: Trigger cultural validation workflow here
    // This would typically involve sending the image to the validation service

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        success: true,
        imageUrl: publicUrl,
        key,
        status: 'uploaded',
        validationStatus: 'pending'
      })
    };

  } catch (error: any) {
    console.error('confirmUploadHandler error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        code: 'INTERNAL_ERROR', 
        message: error?.message || 'Failed to confirm upload' 
      })
    };
  }
};

export const bulkUploadHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ code: 'VALIDATION_ERROR', message: 'Request body is required' })
      };
    }

    const { files, category, userId } = JSON.parse(event.body);

    if (!files || !Array.isArray(files) || !category || !userId) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ 
          code: 'VALIDATION_ERROR', 
          message: 'files (array), category, and userId are required' 
        })
      };
    }

    // Limit bulk uploads to 10 files
    if (files.length > 10) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ 
          code: 'TOO_MANY_FILES', 
          message: 'Maximum 10 files allowed per bulk upload' 
        })
      };
    }

    const uploadUrls = [];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 10 * 1024 * 1024;

    for (const file of files) {
      const { fileName, fileType, fileSize } = file;

      // Validate each file
      if (!allowedTypes.includes(fileType)) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ 
            code: 'INVALID_FILE_TYPE', 
            message: `Invalid file type for ${fileName}. Only JPEG, PNG, WebP, and GIF images are allowed` 
          })
        };
      }

      if (fileSize > maxSize) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ 
            code: 'FILE_TOO_LARGE', 
            message: `File ${fileName} is too large. Maximum size is 10MB` 
          })
        };
      }

      // Generate unique file key
      const fileExtension = fileName.split('.').pop();
      const uniqueFileName = `${uuidv4()}.${fileExtension}`;
      const key = `${category}/${userId}/${uniqueFileName}`;

      // Create presigned URL for upload
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: fileType,
        ServerSideEncryption: 'aws:kms',
        SSEKMSKeyId: KMS_KEY_ID,
        Metadata: {
          'original-name': fileName,
          'user-id': userId,
          'category': category,
          'upload-timestamp': new Date().toISOString()
        }
      });

      const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

      uploadUrls.push({
        fileName,
        key,
        uploadUrl
      });
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        success: true,
        uploads: uploadUrls,
        expiresIn: 300
      })
    };

  } catch (error: any) {
    console.error('bulkUploadHandler error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        code: 'INTERNAL_ERROR', 
        message: error?.message || 'Failed to generate bulk upload URLs' 
      })
    };
  }
};