import { DynamoDBService } from '@madmall/infrastructure';
import { BaseDynamoDAO } from '@madmall/infrastructure/dao/base-dao';
import { DataValidator } from '@madmall/shared-types/database/validation';
import { DynamoDBImageAsset, KeyPatterns } from '@madmall/shared-types/database/base-entity';

export class ImageAssetRepository extends BaseDynamoDAO<DynamoDBImageAsset> {
  constructor(dynamoService: DynamoDBService) {
    super(dynamoService, 'IMAGE');
  }

  protected validateEntitySpecific(entity: DynamoDBImageAsset) {
    return DataValidator.validateImageAsset(entity);
  }

  async createFromUrl(params: {
    imageId: string;
    url: string;
    thumbnailUrl?: string;
    altText: string;
    category: string;
    tags?: string[];
    source: DynamoDBImageAsset['source'];
    sourceInfo?: DynamoDBImageAsset['sourceInfo'];
  }): Promise<DynamoDBImageAsset> {
    const now = new Date().toISOString();
    const item: DynamoDBImageAsset = {
      ...KeyPatterns.IMAGE_METADATA(params.imageId),
      GSI1PK: KeyPatterns.IMAGES_BY_CATEGORY(params.category).GSI1PK,
      GSI1SK: `CREATED#${now}`,
      GSI3PK: KeyPatterns.IMAGE_STATUS('pending_review').GSI3PK,
      GSI3SK: `UPDATED#${now}`,
      entityType: 'IMAGE',
      version: 1,
      createdAt: now,
      updatedAt: now,
      imageId: params.imageId,
      url: params.url,
      thumbnailUrl: params.thumbnailUrl,
      altText: params.altText,
      category: params.category,
      tags: params.tags || [],
      source: params.source,
      sourceInfo: params.sourceInfo,
      status: 'pending_review',
    };

    return this.create(item as any);
  }

  async markValidated(imageId: string, scores: {
    cultural: number; sensitivity: number; inclusivity: number; issues?: string[]; validator?: string;
  }, status: 'active' | 'flagged' | 'removed' = 'active'): Promise<DynamoDBImageAsset> {
    const pk = `IMAGE#${imageId}`;
    const sk = 'METADATA';
    return this.update(pk, sk, {
      validation: {
        culturalScore: scores.cultural,
        sensitivityScore: scores.sensitivity,
        inclusivityScore: scores.inclusivity,
        lastValidatedAt: new Date().toISOString(),
        validator: scores.validator,
        issues: scores.issues,
      },
      status,
      GSI3PK: KeyPatterns.IMAGE_STATUS(status).GSI3PK,
      GSI3SK: `UPDATED#${new Date().toISOString()}`,
    } as any);
  }

  async listPending(limit = 20) {
    const { items } = await this.queryGSI('GSI3', KeyPatterns.IMAGE_STATUS('pending_review').GSI3PK, undefined, { limit });
    return items as DynamoDBImageAsset[];
  }

  async selectByCategory(category: string, limit = 1) {
    const { items } = await this.queryGSI('GSI1', KeyPatterns.IMAGES_BY_CATEGORY(category).GSI1PK, undefined, {
      limit,
      scanIndexForward: false,
    });
    return items as DynamoDBImageAsset[];
  }
}

