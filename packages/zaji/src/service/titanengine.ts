import { v4 as uuidv4 } from 'uuid';
import { ImageAssetRepository } from '../repository/image-asset-repository';
import {
  PexelsProvider,
  UnsplashProvider,
  PlaceholderProvider,
  Automatic1111Provider,
  BedrockSDXLProvider
} from '../providers';
import { TitanKCache } from './kcache';
import { DspyBridge } from './dspy-bridge';
import { TitanAnalyticsProcessor } from './analytics-processor';
import { CulturalValidationAgent } from '@madmall/bedrock-agents';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

class DynamoDBService {
  client: DynamoDBClient;
  tableName: string;
  maxRetries: number;
  timeout: number;
  connectionPoolSize: number;
  enableMetrics: boolean;

  constructor(config: {
    region: string;
    tableName: string;
    endpoint?: string;
    maxRetries: number;
    timeout: number;
    connectionPoolSize: number;
    enableMetrics: boolean;
  }) {
    this.client = new DynamoDBClient({
      region: config.region,
      endpoint: config.endpoint,
      maxAttempts: config.maxRetries,
    });
    this.tableName = config.tableName;
    this.maxRetries = config.maxRetries;
    this.timeout = config.timeout;
    this.connectionPoolSize = config.connectionPoolSize;
    this.enableMetrics = config.enableMetrics;
  }
}

interface CareRecommendation {
  id: string;
  userId: string;
  recommendations: string[];
  confidence: number;
  timestamp: Date;
}

interface TitanEvent {
  userId: string;
  eventType: 'page' | 'interaction';
  name: string;
  timestamp?: number;
  data?: Record<string, unknown>;
}

interface TitanEngineConfig {
  region?: string;
  tableName?: string;
  endpoint?: string;
}

export class TitanEngine {
  private dynamo: DynamoDBService;
  private images: ImageAssetRepository;
  private pexels: PexelsProvider;
  private unsplash: UnsplashProvider;
  private placeholder: PlaceholderProvider;
  private a1111: Automatic1111Provider;
  private bedrock: BedrockSDXLProvider;
  private culturalAgent: CulturalValidationAgent;
  private dspy: DspyBridge;
  private kcache: TitanKCache<CareRecommendation>;
  private eventCache: TitanKCache<TitanEvent[]>;
  private analytics: TitanAnalyticsProcessor;

  constructor(config: TitanEngineConfig) {
    const env = globalThis?.process?.env || {};
    const region = config.region || env.AWS_REGION || 'us-east-1';

    // Initialize the DynamoDB Service
    this.dynamo = this.initializeDynamoDBService(config, env);

    // Initialize other services
    this.images = new ImageAssetRepository(this.dynamo);
    this.pexels = new PexelsProvider();
    this.unsplash = new UnsplashProvider();
    this.placeholder = new PlaceholderProvider();
    this.a1111 = new Automatic1111Provider();
    this.bedrock = new BedrockSDXLProvider();
    this.culturalAgent = new CulturalValidationAgent(region);
    this.dspy = new DspyBridge();

    // Initialize caches
    this.kcache = new TitanKCache<CareRecommendation>({
      namespace: 'titan-care',
      ttlSeconds: 300,
    });

    this.eventCache = new TitanKCache<TitanEvent[]>({
      namespace: 'titan-events',
      ttlSeconds: 300,
    });

    this.analytics = new TitanAnalyticsProcessor(this.eventCache);

    console.log('Titan Engine initialized successfully.');
  }

  private initializeDynamoDBService(config: TitanEngineConfig, env: Record<string, unknown>): DynamoDBService {
    return new DynamoDBService({
      region: String(config.region || env.AWS_REGION || 'us-east-1'),
      tableName: String(config.tableName || env.DYNAMO_TABLE || 'madmall-development-main'),
      endpoint: config.endpoint || String(env.DYNAMODB_ENDPOINT || ''),
      maxRetries: 3,
      timeout: 3000,
      connectionPoolSize: 50,
      enableMetrics: true,
    });
  }

  static createDefault() {
    return new TitanEngine({});
  }

  async importFromPexels(params: { query: string; category: string; count?: number }) {
    return this.importImages('pexels', params);
  }

  async importFromUnsplash(params: { query: string; category: string; count?: number }) {
    return this.importImages('unsplash', params);
  }

  async importPlaceholder(params: { category: string; count?: number }) {
    return this.importImages('placeholder', params);
  }

  private async importImages(source: 'pexels' | 'unsplash' | 'placeholder', params: { query?: string; category: string; count?: number }) {
    let results: any[];
    try {
      if (source === 'pexels') {
        results = await this.pexels.search({
          query: params.query,
          category: params.category,
          count: params.count,
        });
      } else if (source === 'unsplash') {
        results = await this.unsplash.search({
          query: params.query,
          category: params.category,
          count: params.count,
        });
      } else {
        results = await this.placeholder.generate({
          category: params.category,
          count: params.count,
        });
      }
    } catch (error) {
      console.error(`Error fetching images from ${source}:`, error);
      throw new Error(`Failed to import images from ${source}`);
    }

    return this.createImagesFromResults(results);
  }

  private async createImagesFromResults(results: any[]): Promise<any[]> {
    const createdImages: Promise<any>[] = results.map(async (r) => {
      const id = uuidv4();
      try {
        return await this.images.createFromUrl({
          imageId: id,
          url: r.url,
          thumbnailUrl: r.thumbnailUrl,
          altText: r.altText,
          category: r.category,
          tags: r.tags,
          source: 'stock',
          sourceInfo: r.sourceInfo,
        });
      } catch (error) {
        console.error("Error creating image from URL:", error);
        return null; // Skip this item on error
      }
    });

    // Filter out any null items (failed creations)
    const resultsArray = await Promise.all(createdImages);
    return resultsArray.filter(Boolean); // Returns an array with successful creations
  }

  async validateImageContent(image: {
    url: string;
    altText: string;
    category: string;
    imageId?: string;
  }) {
    const response = await this.culturalAgent.execute({
      content: image.url,
      contentType: 'image_url',
      culturalContext: {
        primaryCulture: 'african_american',
        secondaryCultures: [],
        region: 'us',
        language: 'en',
        religiousConsiderations: [],
        sensitiveTopics: [],
      },
      targetAudience: {
        ageRange: { min: 20, max: 60 },
        diagnosisStage: 'in_treatment',
        supportNeeds: ['community'],
      },
    }, {
      sessionId: 'validation-session',
      correlationId: `validate-${image.imageId || 'unknown'}`,
      timestamp: new Date(),
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Image validation failed');
    }

    const data = response.data;
    const scores = {
      cultural: data.culturalRelevanceScore,
      sensitivity: data.sensitivityScore,
      inclusivity: data.inclusivityScore,
      issues: data.issues.map((i) => i.description),
      validator: 'cultural-validation-agent',
    };

    if (image.imageId) {
      const status = data.isAppropriate ? 'active' : 'flagged';
      await this.images.markValidated(image.imageId, scores, status);
    }

    return { ...scores, isAppropriate: data.isAppropriate };
  }

  async recordEvent(event: TitanEvent) {
    await this.analytics.record(event);
  }

  async getEvents(userId: string): Promise<TitanEvent[]> {
    return this.analytics.getEvents(userId);
  }

  async listPending(limit = 20) {
    return this.images.listPending(limit);
  }

  async listFlagged(limit = 20) {
    return this.images.listFlagged(limit);
  }

  async selectByContext(context: string, limit = 10) {
    return this.images.listByCategory(context.split('.')[0] || 'general', limit);
  }

  async auditImageAssets(limit = 20) {
    const pending = await this.images.listPending(limit);
    for (const img of pending) {
      const result = await this.validateImageContent(img as any);
      if (!result.isAppropriate || result.cultural < 0.7) {
        await this.images.markValidated(img.imageId, result, 'removed');
        const [placeholder] = await this.placeholder.generate({
          category: img.category,
          count: 1,
        });
        if (placeholder) {
          await this.images.createFromUrl({
            imageId: uuidv4(),
            url: placeholder.url,
            thumbnailUrl: placeholder.thumbnailUrl,
            altText: placeholder.altText,
            category: img.category,
            tags: placeholder.tags,
            source: 'stock',
            sourceInfo: placeholder.sourceInfo,
          });
        }
      }
    }

    const flagged = await this.images.listFlagged(limit);
    for (const img of flagged) {
      const [placeholder] = await this.placeholder.generate({
        category: img.category,
        count: 1,
      });
      await this.images.markValidated(
        img.imageId,
        {
          cultural: 0,
          sensitivity: 0,
          inclusivity: 0,
          issues: ['replaced with placeholder'],
          validator: 'auditImageAssets',
        },
        'removed'
      );
      if (placeholder) {
        await this.images.createFromUrl({
          imageId: uuidv4(),
          url: placeholder.url,
          thumbnailUrl: placeholder.thumbnailUrl,
          altText: placeholder.altText,
          category: img.category,
          tags: placeholder.tags,
          source: 'placeholder',
          sourceInfo: placeholder.sourceInfo,
        });
      }
    }
  }
}