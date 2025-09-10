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

  async listPending(limit = 20) {
    return this.images.listPending(limit);
  }

  async selectByContext(context: string, limit = 1) {
    return this.images.selectByCategory(context, limit);
  }
}

