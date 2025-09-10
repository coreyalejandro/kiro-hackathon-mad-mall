type APIGatewayProxyResult = any;
import { getDAOFactory } from '../services/factory';
declare const console: any;

export const listPremiumSourcesHandler = async (): Promise<APIGatewayProxyResult> => {
  try {
    const factory = getDAOFactory();
    const result = await factory.premiumSourceDAO.getByProvider('createher');
    const result2 = await factory.premiumSourceDAO.getByProvider('nappy');
    return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ success: true, items: [...result.items, ...result2.items] }) };
  } catch (error: any) {
    console.error('listPremiumSourcesHandler error:', error);
    return { statusCode: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ code: 'INTERNAL_ERROR', message: error?.message || 'Failed to list premium sources' }) };
  }
};

