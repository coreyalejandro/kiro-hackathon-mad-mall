"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TitanEngine = void 0;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const uuid_1 = require("uuid");
const infrastructure_1 = require("@madmall/infrastructure");
const image_asset_repository_1 = require("../repository/image-asset-repository");
const pexels_provider_1 = require("../providers/pexels-provider");
const unsplash_provider_1 = require("../providers/unsplash-provider");
const placeholder_provider_1 = require("../providers/placeholder-provider");
const automatic1111_provider_1 = require("../providers/automatic1111-provider");
const bedrock_agents_1 = require("@madmall/bedrock-agents");
class TitanEngine {
    constructor(config) {
        // Use globalThis to avoid TS complaining about process types in some contexts
        const env = globalThis.process?.env || {};
        this.dynamo = new infrastructure_1.DynamoDBService({
            region: config.region || env.AWS_REGION || 'us-east-1',
            tableName: config.tableName || env.DYNAMO_TABLE || `madmall-development-main`,
            endpoint: env.DYNAMODB_ENDPOINT || config.endpoint,
            maxRetries: 3,
            timeout: 3000,
            connectionPoolSize: 50,
            enableMetrics: true,
        });
        this.images = new image_asset_repository_1.ImageAssetRepository(this.dynamo);
        this.pexels = new pexels_provider_1.PexelsProvider();
        this.unsplash = new unsplash_provider_1.UnsplashProvider();
        this.placeholder = new placeholder_provider_1.PlaceholderProvider();
        this.a1111 = new automatic1111_provider_1.Automatic1111Provider();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const region = globalThis.process?.env?.AWS_REGION || 'us-east-1';
        this.culturalAgent = new bedrock_agents_1.CulturalValidationAgent(region);
    }
    static createDefault() {
        return new TitanEngine({});
    }
    async importFromPexels(params) {
        const results = await this.pexels.search(params);
        const created = [];
        for (const r of results) {
            const id = (0, uuid_1.v4)();
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
    async importFromUnsplash(params) {
        const results = await this.unsplash.search(params);
        const created = [];
        for (const r of results) {
            const id = (0, uuid_1.v4)();
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
    async importPlaceholder(params) {
        const results = await this.placeholder.generate(params);
        const created = [];
        for (const r of results) {
            const id = (0, uuid_1.v4)();
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
    async validateImageContent(image) {
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
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const execRegion = globalThis.process?.env?.AWS_REGION || 'us-east-1';
        const result = await this.culturalAgent.execute(input, { region: execRegion });
        if (result.response.success && result.response.data) {
            const scores = result.response.data;
            return {
                cultural: scores.culturalRelevanceScore,
                sensitivity: scores.sensitivityScore,
                inclusivity: scores.inclusivityScore,
                issues: (scores.issues || []).map((i) => `${i.type}:${i.severity}`),
            };
        }
        return { cultural: 0, sensitivity: 0, inclusivity: 0, issues: ['validation_failed'] };
    }
    async listPending(limit = 20) {
        return this.images.listPending(limit);
    }
    async selectByContext(context, limit = 1) {
        return this.images.selectByCategory(context, limit);
    }
}
exports.TitanEngine = TitanEngine;
//# sourceMappingURL=titanengine.js.map