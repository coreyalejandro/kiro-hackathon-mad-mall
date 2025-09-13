import { DynamoDBService } from '@madmall/infrastructure';
import { BaseDynamoDAO } from '@madmall/infrastructure/dao/base-dao';
import { DynamoDBImageAsset } from '@madmall/shared-types/database/base-entity';
export declare class ImageAssetRepository extends BaseDynamoDAO<DynamoDBImageAsset> {
    constructor(dynamoService: DynamoDBService);
    protected validateEntitySpecific(entity: DynamoDBImageAsset): import("@madmall/shared-types/database/validation").ValidationResult;
    createFromUrl(params: {
        imageId: string;
        url: string;
        thumbnailUrl?: string;
        altText: string;
        category: string;
        tags?: string[];
        source: DynamoDBImageAsset['source'];
        sourceInfo?: DynamoDBImageAsset['sourceInfo'];
    }): Promise<DynamoDBImageAsset>;
    markValidated(imageId: string, scores: {
        cultural: number;
        sensitivity: number;
        inclusivity: number;
        issues?: string[];
        validator?: string;
    }, status?: 'active' | 'flagged' | 'removed'): Promise<DynamoDBImageAsset>;
    listPending(limit?: number): Promise<DynamoDBImageAsset[]>;
    selectByCategory(category: string, limit?: number): Promise<DynamoDBImageAsset[]>;
}
