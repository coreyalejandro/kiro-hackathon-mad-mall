type APIGatewayProxyEvent = any;
type APIGatewayProxyResult = any;
import { getDAOFactory } from '../services/factory';
declare const console: any;

export const enqueueAdvisoryReviewHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return { statusCode: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ code: 'VALIDATION_ERROR', message: 'Request body is required' }) };
    }

    const body = JSON.parse(event.body);
    const { targetType, targetId, submittedBy, notes } = body;
    if (!targetType || !targetId || !submittedBy) {
      return { statusCode: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ code: 'VALIDATION_ERROR', message: 'targetType, targetId, submittedBy are required' }) };
    }

    const factory = getDAOFactory();
    const review = await factory.advisoryReviewDAO.enqueue({
      reviewId: `rev-${Date.now()}`,
      targetType,
      targetId,
      submittedBy,
      status: 'queued',
      notes,
    } as any);

    return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ success: true, review }) };
  } catch (error: any) {
    console.error('enqueueAdvisoryReviewHandler error:', error);
    return { statusCode: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ code: 'INTERNAL_ERROR', message: error?.message || 'Failed to enqueue review' }) };
  }
};

export const listAdvisoryQueueHandler = async (): Promise<APIGatewayProxyResult> => {
  try {
    const factory = getDAOFactory();
    const result = await factory.advisoryReviewDAO.listQueue({ limit: 50 });
    return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ success: true, items: result.items, count: result.count }) };
  } catch (error: any) {
    console.error('listAdvisoryQueueHandler error:', error);
    return { statusCode: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ code: 'INTERNAL_ERROR', message: error?.message || 'Failed to list advisory queue' }) };
  }
};

