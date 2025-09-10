type APIGatewayProxyEvent = any;
type APIGatewayProxyResult = any;
import { getDAOFactory } from '../services/factory';
declare const console: any;

export const getPersonalizationHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.queryStringParameters?.userId;
    if (!userId) {
      return { statusCode: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ code: 'VALIDATION_ERROR', message: 'userId is required' }) };
    }
    const factory = getDAOFactory();
    const profile = await factory.personalizationDAO.getForUser(userId);
    return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ success: true, profile }) };
  } catch (error: any) {
    console.error('getPersonalizationHandler error:', error);
    return { statusCode: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ code: 'INTERNAL_ERROR', message: error?.message || 'Failed to get personalization' }) };
  }
};

export const updatePersonalizationHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return { statusCode: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ code: 'VALIDATION_ERROR', message: 'Request body is required' }) };
    }
    const { userId, preferences, engagement, abTests, cohorts } = JSON.parse(event.body);
    if (!userId) {
      return { statusCode: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ code: 'VALIDATION_ERROR', message: 'userId is required' }) };
    }
    const factory = getDAOFactory();
    const updated = await factory.personalizationDAO.upsertForUser(userId, { preferences, engagement, abTests, cohorts } as any);
    return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ success: true, profile: updated }) };
  } catch (error: any) {
    console.error('updatePersonalizationHandler error:', error);
    return { statusCode: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ code: 'INTERNAL_ERROR', message: error?.message || 'Failed to update personalization' }) };
  }
};

