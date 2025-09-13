import { TitanEngine } from './titanengine';
import { CareRecommendation } from './dspy-bridge';

const recommendCareMock = jest.fn(async (input: any): Promise<CareRecommendation> => ({
  userId: input.userId,
  items: [],
  strategy: 'dspy',
  runtimeMs: 42,
  meta: { optimized: true },
}));

jest.mock('./dspy-bridge', () => ({
  DspyBridge: jest.fn().mockImplementation(() => ({
    recommendCare: recommendCareMock,
  })),
}));

describe('TitanEngine.generateCareModel', () => {
  beforeEach(() => {
    process.env.KCACHE_INMEMORY = 'true';
    recommendCareMock.mockClear();
  });

  it('propagates DSPy recommendations and caches results', async () => {
    const engine = TitanEngine.createDefault();
    const input = {
      userId: 'user1',
      age: 30,
      diagnosisStage: 'stage',
      supportNeeds: [],
      culturalContext: { primaryCulture: 'Test' },
    };

    const first = await engine.generateCareModel(input);
    expect(first.cached).toBe(false);
    expect(first.recommendation.meta.optimized).toBe(true);
    expect(recommendCareMock).toHaveBeenCalledTimes(1);

    const second = await engine.generateCareModel(input);
    expect(second.cached).toBe(true);
    expect(second.recommendation.meta.optimized).toBe(true);
    expect(recommendCareMock).toHaveBeenCalledTimes(1);
  });
});
