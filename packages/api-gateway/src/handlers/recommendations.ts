import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { TitanEngine } from '@madmall/titanengine';

const engine = TitanEngine.createDefault();

export const getCareRecommendationsHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const qs = event.queryStringParameters || {};
    const userId = qs.userId || 'demo';
    const age = parseInt(qs.age || '35');
    const diagnosisStage = qs.diagnosisStage || 'diagnosed';
    const supportNeeds = (qs.supportNeeds || '').split(',').filter(Boolean);
    const primaryCulture = qs.primaryCulture || 'African American';
    const region = qs.region || 'US';
    const language = qs.language || 'en';

    const { recommendation, cached, cacheStats } = await engine.generateCareModel({
      userId,
      age,
      diagnosisStage,
      supportNeeds,
      culturalContext: { primaryCulture, region, language },
    }, { bypassCache: String(qs.bypassCache || '').toLowerCase() === 'true' });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ recommendation, cached, cacheStats }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: (error as Error).message }),
    };
  }
};

export const getCareStatsHandler = async (
  _event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Placeholder; could be wired to CloudWatch/metrics later
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ status: 'ok' }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: (error as Error).message }),
    };
  }
};

