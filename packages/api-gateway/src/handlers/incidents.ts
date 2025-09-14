type APIGatewayProxyEvent = any;
type APIGatewayProxyResult = any;
import { getDAOFactory } from '../services/factory';
declare const console: any;

export const createIncidentHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return { statusCode: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ code: 'VALIDATION_ERROR', message: 'Request body is required' }) };
    }

    const body = JSON.parse(event.body);
    const { relatedImageId, triggeredBy, priority, summary, details } = body;
    if (!triggeredBy || !priority || !summary) {
      return { statusCode: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ code: 'VALIDATION_ERROR', message: 'triggeredBy, priority, summary are required' }) };
    }

    const factory = getDAOFactory();
    const incident = await factory.incidentDAO.createIncident({
      incidentId: `inc-${Date.now()}`,
      relatedImageId,
      triggeredBy,
      status: 'open',
      priority,
      summary,
      details,
    } as any);

    return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ success: true, incident }) };
  } catch (error: any) {
    console.error('createIncidentHandler error:', error);
    return { statusCode: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ code: 'INTERNAL_ERROR', message: error?.message || 'Failed to create incident' }) };
  }
};

export const listIncidentsHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const status = event.queryStringParameters?.status || 'open';
    const factory = getDAOFactory();
    const result = await factory.incidentDAO.getByStatus(status, { limit: 50 });
    return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ success: true, items: result.items, count: result.count }) };
  } catch (error: any) {
    console.error('listIncidentsHandler error:', error);
    return { statusCode: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ code: 'INTERNAL_ERROR', message: error?.message || 'Failed to list incidents' }) };
  }
};

