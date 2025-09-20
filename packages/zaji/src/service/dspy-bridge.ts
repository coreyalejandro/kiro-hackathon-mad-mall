import { z } from 'zod';

const CareInputSchema = z.object({
  userId: z.string(),
  age: z.number(),
  diagnosisStage: z.string(),
  supportNeeds: z.array(z.string()).default([]),
  culturalContext: z.object({
    primaryCulture: z.string(),
    secondaryCultures: z.array(z.string()).default([]),
    region: z.string().default('US'),
    language: z.string().default('en'),
    religiousConsiderations: z.array(z.string()).default([]),
    sensitiveTopics: z.array(z.string()).default([]),
  }),
  history: z.array(z.any()).default([]),
});

export type CareInput = z.infer<typeof CareInputSchema>;

export interface CareItem {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  url?: string;
  confidence: number;
}

export interface CareRecommendation {
  userId: string;
  items: CareItem[];
  strategy: string;
  runtimeMs: number;
  meta: Record<string, unknown>;
}

export class DspyBridge {
  private readonly baseUrl: string;

  constructor(baseUrl?: string) {
    const env = (globalThis as any).process?.env || {};
    this.baseUrl = baseUrl || env.DSPY_SERVICE_URL || 'http://localhost:8001';
  }

  async recommendCare(input: CareInput): Promise<CareRecommendation> {
    const payload = CareInputSchema.parse(input);
    const res = await fetch(`${this.baseUrl}/recommendations/care`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error(`DSPy service error: ${res.status} ${await res.text()}`);
    }
    return (await res.json()) as CareRecommendation;
  }
}

