import { NextResponse } from 'next/server';
import { TitanEngine } from '@/lib/titan-engine';

const engine = TitanEngine.createDefault();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'demo_user_001';
    const age = Number(searchParams.get('age') || 32);
    const diagnosisStage = searchParams.get('diagnosisStage') || 'managing_well';
    const supportNeeds = searchParams.getAll('supportNeeds');
    const culturalContext = {
      primaryCulture: searchParams.get('primaryCulture') || 'African American',
      secondaryCultures: searchParams.getAll('secondaryCulture'),
      region: searchParams.get('region') || 'US',
      language: searchParams.get('language') || 'en',
    } as any;
    const bypassCache = searchParams.get('bypassCache') === 'true';

    const result = await engine.generateCareModel({
      userId,
      culturalBackground: [culturalContext.primaryCulture, ...culturalContext.secondaryCultures],
      supportNeeds,
      context: `Age: ${age}, Stage: ${diagnosisStage}, Region: ${culturalContext.region}`
    });
    await engine.recordEvent({
      userId,
      eventType: 'interaction',
      name: 'care-model:generate',
      data: { age, diagnosisStage, supportNeeds },
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error('Failed to generate care model', err);
    return NextResponse.json({ error: 'Failed to generate care model' }, { status: 500 });
  }
}
