// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { v4 as uuidv4 } from 'uuid';
import { DynamoDBService } from '@madmall/infrastructure';
import { ImageAssetRepository } from '../repository/image-asset-repository';
import { PexelsProvider } from '../providers/pexels-provider';
import { UnsplashProvider } from '../providers/unsplash-provider';
import { PlaceholderProvider } from '../providers/placeholder-provider';
import { Automatic1111Provider } from '../providers/automatic1111-provider';
import { CulturalValidationAgent } from '@madmall/bedrock-agents';
import { DspyBridge, CareRecommendation } from './dspy-bridge';
import { TitanKCache } from './kcache';

export interface TitanEngineConfig {
  region?: string;
  tableName?: string;
  endpoint?: string;
}

export class TitanEngine {
  private readonly dynamo: DynamoDBService;
  private readonly images: ImageAssetRepository;
  private readonly pexels: PexelsProvider;
  private readonly unsplash: UnsplashProvider;
  private readonly placeholder: PlaceholderProvider;
  private readonly a1111: Automatic1111Provider;
  private readonly culturalAgent: CulturalValidationAgent;
  private readonly dspy: DspyBridge;
  private readonly kcache: TitanKCache<CareRecommendation>;

  constructor(config: TitanEngineConfig) {
    // Use globalThis to avoid TS complaining about process types in some contexts
    const env = (globalThis as any).process?.env || {};
    this.dynamo = new DynamoDBService({
      region: config.region || env.AWS_REGION || 'us-east-1',
      tableName: config.tableName || env.DYNAMO_TABLE || `madmall-development-main`,
      endpoint: env.DYNAMODB_ENDPOINT || config.endpoint,
      maxRetries: 3,
      timeout: 3000,
      connectionPoolSize: 50,
      enableMetrics: true,
    });
    this.images = new ImageAssetRepository(this.dynamo);
    this.pexels = new PexelsProvider();
    this.unsplash = new UnsplashProvider();
    this.placeholder = new PlaceholderProvider();
    this.a1111 = new Automatic1111Provider();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const region = (globalThis as any).process?.env?.AWS_REGION || 'us-east-1';
    this.culturalAgent = new CulturalValidationAgent(region);
    this.dspy = new DspyBridge();
    this.kcache = new TitanKCache<CareRecommendation>({ namespace: 'titan-care', ttlSeconds: 300 });
  }

  static createDefault() {
    return new TitanEngine({});
  }

  async importFromPexels(params: { query: string; category: string; count?: number }) {
    const results = await this.pexels.search(params);
    const created = [] as any[];
    for (const r of results) {
      const id = uuidv4();
      const item = await this.images.createFromUrl({
        imageId: id,
        url: r.url,
        thumbnailUrl: r.thumbnailUrl,
        altText: r.altText,
        category: r.category,
        tags: r.tags,
        source: 'stock',
        sourceInfo: r.sourceInfo,
      });
      created.push(item);
    }
    return created;
  }

  async importFromUnsplash(params: { query: string; category: string; count?: number }) {
    const results = await this.unsplash.search(params);
    const created = [] as any[];
    for (const r of results) {
      const id = uuidv4();
      const item = await this.images.createFromUrl({
        imageId: id,
        url: r.url,
        thumbnailUrl: r.thumbnailUrl,
        altText: r.altText,
        category: r.category,
        tags: r.tags,
        source: 'stock',
        sourceInfo: r.sourceInfo,
      });
      created.push(item);
    }
    return created;
  }

  async importPlaceholder(params: { category: string; count?: number }) {
    const results = await this.placeholder.generate(params);
    const created = [] as any[];
    for (const r of results) {
      const id = uuidv4();
      const item = await this.images.createFromUrl({
        imageId: id,
        url: r.url,
        thumbnailUrl: r.thumbnailUrl,
        altText: r.altText,
        category: r.category,
        tags: r.tags,
        source: 'stock',
        sourceInfo: r.sourceInfo,
      });
      created.push(item);
    }
    return created;
  }

  async validateImageContent(image: { url: string; altText: string; category: string }) {
    const input = {
      content: image.altText,
      contentType: 'image_description',
      culturalContext: {
        primaryCulture: 'African American',
        secondaryCultures: [],
        region: 'US',
        language: 'en',
        religiousConsiderations: [],
        sensitiveTopics: ['health', 'body_image'],
      },
      targetAudience: {
        ageRange: { min: 18, max: 80 },
        diagnosisStage: 'managing_well',
        supportNeeds: ['emotional_support', 'health_education'],
      },
    } as any;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const execRegion = (globalThis as any).process?.env?.AWS_REGION || 'us-east-1';
    const result = await this.culturalAgent.execute(input, { region: execRegion } as any);
    if (result.response.success && result.response.data) {
      const scores = result.response.data as any;
      return {
        cultural: scores.culturalRelevanceScore,
        sensitivity: scores.sensitivityScore,
        inclusivity: scores.inclusivityScore,
        issues: (scores.issues || []).map((i: any) => `${i.type}:${i.severity}`),
      };
    }
    return { cultural: 0, sensitivity: 0, inclusivity: 0, issues: ['validation_failed'] };
  }

  async auditImageAssets(limit = 20) {
    const pending = await this.images.listPending(limit);
    for (const img of pending) {
      const scores = await this.validateImageContent({
        url: img.url,
        altText: img.altText,
        category: img.category,
      });
      const isBlackWoman =
        scores.cultural >= 0.8 &&
        scores.inclusivity >= 0.8 &&
        !(scores.issues || []).some((i: string) => i.includes('cultural_mismatch'));
      if (!isBlackWoman) {
        const [placeholder] = await this.placeholder.generate({ category: img.category, count: 1 });
        await this.images.update(img.PK, img.SK, {
          url: placeholder.url,
          thumbnailUrl: placeholder.thumbnailUrl,
          altText: placeholder.altText,
          tags: placeholder.tags as any,
          source: placeholder.source as any,
          sourceInfo: placeholder.sourceInfo as any,
        } as any);
        await this.images.markValidated(img.imageId, { ...scores, validator: 'audit' }, 'flagged');
      } else {
        await this.images.markValidated(img.imageId, { ...scores, validator: 'audit' }, 'active');
      }
    }
  }

  async generateCareModel(input: {
    userId: string;
    age: number;
    diagnosisStage: string;
    supportNeeds: string[];
    culturalContext: {
      primaryCulture: string;
      secondaryCultures?: string[];
      region?: string;
      language?: string;
      religiousConsiderations?: string[];
      sensitiveTopics?: string[];
    };
    history?: any[];
  }, options?: { bypassCache?: boolean }): Promise<{ recommendation: CareRecommendation; cached: boolean; cacheStats: any }>{
    const key = [
      input.userId,
      input.age,
      input.diagnosisStage,
      ...(input.supportNeeds || []),
      input.culturalContext.primaryCulture,
      input.culturalContext.region || 'US',
      input.culturalContext.language || 'en',
    ];
    await this.kcache.connect();
    const producer = async () => {
      const rec = await this.dspy.recommendCare({
        userId: input.userId,
        age: input.age,
        diagnosisStage: input.diagnosisStage,
        supportNeeds: input.supportNeeds || [],
        culturalContext: {
          primaryCulture: input.culturalContext.primaryCulture,
          secondaryCultures: input.culturalContext.secondaryCultures || [],
          region: input.culturalContext.region || 'US',
          language: input.culturalContext.language || 'en',
          religiousConsiderations: input.culturalContext.religiousConsiderations || [],
          sensitiveTopics: input.culturalContext.sensitiveTopics || [],
        },
        history: input.history || [],
      });
      return rec;
    };

    let result: { data: CareRecommendation; cached: boolean };
    if (options?.bypassCache) {
      const data = await producer();
      result = { data, cached: false };
    } else {
      result = await this.kcache.withCache(key, producer, 300);
    }

    return { recommendation: result.data, cached: result.cached, cacheStats: this.kcache.getStats() };
  }

  async listPending(limit = 20) {
    return this.images.listPending(limit);
  }

  async selectByContext(context: string, limit = 1) {
    return this.images.selectByCategory(context, limit);
  }
}

