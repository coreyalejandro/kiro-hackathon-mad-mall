// Avoid direct type import to prevent type resolution issues
type APIGatewayProxyEvent = any;
type APIGatewayProxyResult = any;
import { getDAOFactory } from '../services/factory';
declare const console: any;

export const submitImageFeedbackHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return { statusCode: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ code: 'VALIDATION_ERROR', message: 'Request body is required' }) };
    }

    const body = JSON.parse(event.body);
    const { imageId, userId, rating, comment, categories, severity, isReport } = body;
    if (!imageId || !userId || typeof rating !== 'number') {
      return { statusCode: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ code: 'VALIDATION_ERROR', message: 'imageId, userId and rating are required' }) };
    }

    const factory = getDAOFactory();
    const feedback = await factory.feedbackDAO.createForImage({
      feedbackId: `fb-${Date.now()}`,
      imageId,
      userId,
      rating,
      comment,
      categories: categories || [],
      severity,
      isReport: !!isReport,
      status: 'new',
      metadata: { requestId: event.requestContext?.requestId },
    } as any);

    return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ success: true, feedback }) };
  } catch (error: any) {
    console.error('submitImageFeedbackHandler error:', error);
    return { statusCode: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ code: 'INTERNAL_ERROR', message: error?.message || 'Failed to submit feedback' }) };
  }
};

export const listImageFeedbackHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const imageId = event.queryStringParameters?.imageId;
    if (!imageId) {
      return { statusCode: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ code: 'VALIDATION_ERROR', message: 'imageId is required' }) };
    }

    const factory = getDAOFactory();
    const result = await factory.feedbackDAO.listForImage(imageId, { limit: 50 });
    return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ success: true, items: result.items, count: result.count, lastKey: result.lastEvaluatedKey }) };
  } catch (error: any) {
    console.error('listImageFeedbackHandler error:', error);
    return { statusCode: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ code: 'INTERNAL_ERROR', message: error?.message || 'Failed to list feedback' }) };
  }
};

