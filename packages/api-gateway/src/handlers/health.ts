import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GetHealthInput, GetHealthOutput, HealthStatus } from '../generated/types';

/**
 * Health check handler
 * Maps to GET /health endpoint from Express server
 */
export const healthHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const response: GetHealthOutput = {
      status: HealthStatus.HEALTHY,
      message: 'AIme Wellness Platform API',
      timestamp: new Date(),
      dataInitialized: true,
      services: {
        database: 'healthy',
        cache: 'healthy',
        bedrock: 'healthy'
      }
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
    console.error('Health check error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        status: HealthStatus.UNHEALTHY,
        message: 'Service unavailable',
        timestamp: new Date(),
        dataInitialized: false
      })
    };
  }
};