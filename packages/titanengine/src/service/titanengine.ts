import { v4 as uuidv4 } from 'uuid';
import {
  DynamoDBService,
  ImageAssetRepository,
  PexelsProvider,
  UnsplashProvider,
  PlaceholderProvider,
  Automatic1111Provider,
  BedrockSDXLProvider,
  CulturalValidationAgent,
  DspyBridge,
  TitanKCache,
  TitanAnalyticsProcessor,
  CareRecommendation,
  TitanEvent,
} from './services'; // Adjust your import paths as necessary

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
      region: config.region || env.AWS_REGION || 'us-east-1',
      tableName: config.tableName || env.DYNAMO_TABLE || 'madmall-development-main',
      endpoint: env.DYNAMODB_ENDPOINT || config.endpoint,
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
}