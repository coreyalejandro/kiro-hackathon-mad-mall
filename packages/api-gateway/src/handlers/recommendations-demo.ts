import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { TitanEngine } from '@madmall/titanengine';

const engine = TitanEngine.createDefault();

export const compareCareRecommendationHandler = async (
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

    const startCached = Date.now();
    const cachedRun = await engine.generateCareModel({
      userId, age, diagnosisStage, supportNeeds,
      culturalContext: { primaryCulture, region, language },
    });
    const cachedMs = Date.now() - startCached;

    const startFresh = Date.now();
    const freshRun = await engine.generateCareModel({
      userId, age, diagnosisStage, supportNeeds,
      culturalContext: { primaryCulture, region, language },
    }, { bypassCache: true });
    const freshMs = Date.now() - startFresh;

    // Confidence scoring as average of item confidences
    const avg = (items: Array<{ confidence: number }>) => items.reduce((s, i) => s + (i.confidence || 0), 0) / Math.max(1, items.length);

    const cachedConfidence = avg(cachedRun.recommendation.items);
    const freshConfidence = avg(freshRun.recommendation.items);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        cached: {
          ...cachedRun,
          totalMs: cachedMs,
          confidence: Number(cachedConfidence.toFixed(3)),
        },
        fresh: {
          ...freshRun,
          totalMs: freshMs,
          confidence: Number(freshConfidence.toFixed(3)),
        },
        speedup: cachedMs > 0 ? Number((freshMs / cachedMs).toFixed(2)) : null,
      }),
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

