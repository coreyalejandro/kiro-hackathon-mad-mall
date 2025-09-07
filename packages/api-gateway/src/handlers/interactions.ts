import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { 
  ContentInteractionOutput,
  InteractionType,
  ContentType
} from '../generated/types';
import { MockDataService } from '../services/mockDataService';

/**
 * Content interaction handler
 * Maps to POST /api/interact endpoint from Express server
 */
export const interactWithContentHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          code: 'VALIDATION_ERROR',
          message: 'Request body is required'
        })
      };
    }

    const body = JSON.parse(event.body);
    const { contentId, action, contentType } = body;
    
    if (!contentId || !action || !contentType) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          code: 'VALIDATION_ERROR',
          message: 'contentId, action, and contentType are required'
        })
      };
    }

    const mockDataService = new MockDataService();
    const result = await mockDataService.interactWithContent(contentId, action, contentType);
    
    const response: ContentInteractionOutput = {
      success: true,
      message: `Successfully ${action}d content`,
      updatedCounts: result
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      body: JSON.stringify(response)
    };
  } catch (error) {
    console.error('Interact with content handler error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        code: 'INTERNAL_ERROR',
        message: 'Failed to process content interaction',
        requestId: event.requestContext?.requestId
      })
    };
  }
};