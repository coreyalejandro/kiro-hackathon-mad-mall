import { GET } from './route';

jest.mock('@madmall/titanengine', () => ({
  TitanEngine: {
    createDefault: () => ({
      generateCareModel: jest.fn().mockResolvedValue({
        recommendation: {
          userId: 'u1',
          items: [],
          strategy: 'dspy',
          runtimeMs: 10,
          meta: { optimized: true },
        },
        cached: false,
        cacheStats: {},
      }),
    }),
  },
}));

describe('care-model API route', () => {
  it('returns care model from TitanEngine', async () => {
    const res = await GET(new Request('http://localhost/api/care-model'));
    const json = await res.json();
    expect(json.recommendation.meta.optimized).toBe(true);
  });
});
