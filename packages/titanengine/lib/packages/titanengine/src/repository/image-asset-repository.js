"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageAssetRepository = void 0;
const base_dao_1 = require("@madmall/infrastructure/dao/base-dao");
const validation_1 = require("@madmall/shared-types/database/validation");
const base_entity_1 = require("@madmall/shared-types/database/base-entity");
class ImageAssetRepository extends base_dao_1.BaseDynamoDAO {
    constructor(dynamoService) {
        super(dynamoService, 'IMAGE');
    }
    validateEntitySpecific(entity) {
        return validation_1.DataValidator.validateImageAsset(entity);
    }
    async createFromUrl(params) {
        const now = new Date().toISOString();
        const item = {
            ...base_entity_1.KeyPatterns.IMAGE_METADATA(params.imageId),
            GSI1PK: base_entity_1.KeyPatterns.IMAGES_BY_CATEGORY(params.category).GSI1PK,
            GSI1SK: `CREATED#${now}`,
            GSI3PK: base_entity_1.KeyPatterns.IMAGE_STATUS('pending_review').GSI3PK,
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
        return this.create(item);
    }
    async markValidated(imageId, scores, status = 'active') {
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
            GSI3PK: base_entity_1.KeyPatterns.IMAGE_STATUS(status).GSI3PK,
            GSI3SK: `UPDATED#${new Date().toISOString()}`,
        });
    }
    async listPending(limit = 20) {
        const { items } = await this.queryGSI('GSI3', base_entity_1.KeyPatterns.IMAGE_STATUS('pending_review').GSI3PK, undefined, { limit });
        return items;
    }
    async selectByCategory(category, limit = 1) {
        const { items } = await this.queryGSI('GSI1', base_entity_1.KeyPatterns.IMAGES_BY_CATEGORY(category).GSI1PK, undefined, {
            limit,
            scanIndexForward: false,
        });
        return items;
    }
}
exports.ImageAssetRepository = ImageAssetRepository;
//# sourceMappingURL=image-asset-repository.js.map