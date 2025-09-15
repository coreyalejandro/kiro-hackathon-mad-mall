"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TitanEngine = void 0;
const uuid_1 = require("uuid");
const image_asset_repository_1 = require("../repository/image-asset-repository");
const providers_1 = require("../providers");
const kcache_1 = require("./kcache");
const dspy_bridge_1 = require("./dspy-bridge");
const analytics_processor_1 = require("./analytics-processor");
const bedrock_agents_1 = require("@madmall/bedrock-agents");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
class DynamoDBService {
    constructor(config) {
        this.client = new client_dynamodb_1.DynamoDBClient({
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
class TitanEngine {
    constructor(config) {
        const env = globalThis?.process?.env || {};
        const region = config.region || env.AWS_REGION || 'us-east-1';
        // Initialize the DynamoDB Service
        this.dynamo = this.initializeDynamoDBService(config, env);
        // Initialize other services
        this.images = new image_asset_repository_1.ImageAssetRepository(this.dynamo);
        this.pexels = new providers_1.PexelsProvider();
        this.unsplash = new providers_1.UnsplashProvider();
        this.placeholder = new providers_1.PlaceholderProvider();
        this.a1111 = new providers_1.Automatic1111Provider();
        this.bedrock = new providers_1.BedrockSDXLProvider();
        this.culturalAgent = new bedrock_agents_1.CulturalValidationAgent(region);
        this.dspy = new dspy_bridge_1.DspyBridge();
        // Initialize caches
        this.kcache = new kcache_1.TitanKCache({
            namespace: 'titan-care',
            ttlSeconds: 300,
        });
        this.eventCache = new kcache_1.TitanKCache({
            namespace: 'titan-events',
            ttlSeconds: 300,
        });
        this.analytics = new analytics_processor_1.TitanAnalyticsProcessor(this.eventCache);
        console.log('Titan Engine initialized successfully.');
    }
    initializeDynamoDBService(config, env) {
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
    async importFromPexels(params) {
        return this.importImages('pexels', params);
    }
    async importFromUnsplash(params) {
        return this.importImages('unsplash', params);
    }
    async importPlaceholder(params) {
        return this.importImages('placeholder', params);
    }
    async importImages(source, params) {
        let results;
        try {
            if (source === 'pexels') {
                results = await this.pexels.search({
                    query: params.query,
                    category: params.category,
                    count: params.count,
                });
            }
            else if (source === 'unsplash') {
                results = await this.unsplash.search({
                    query: params.query,
                    category: params.category,
                    count: params.count,
                });
            }
            else {
                results = await this.placeholder.generate({
                    category: params.category,
                    count: params.count,
                });
            }
        }
        catch (error) {
            console.error(`Error fetching images from ${source}:`, error);
            throw new Error(`Failed to import images from ${source}`);
        }
        return this.createImagesFromResults(results);
    }
    async createImagesFromResults(results) {
        const createdImages = results.map(async (r) => {
            const id = (0, uuid_1.v4)();
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
            }
            catch (error) {
                console.error("Error creating image from URL:", error);
                return null; // Skip this item on error
            }
        });
        // Filter out any null items (failed creations)
        const resultsArray = await Promise.all(createdImages);
        return resultsArray.filter(Boolean); // Returns an array with successful creations
    }
    async validateImageContent(image) {
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
    async recordEvent(event) {
        await this.analytics.record(event);
    }
    async getEvents(userId) {
        return this.analytics.getEvents(userId);
    }
    async listPending(limit = 20) {
        return this.images.listPending(limit);
    }
    async listFlagged(limit = 20) {
        return this.images.listFlagged(limit);
    }
    async selectByContext(context, limit = 10) {
        return this.images.listByCategory(context.split('.')[0] || 'general', limit);
    }
    async auditImageAssets(limit = 20) {
        const pending = await this.images.listPending(limit);
        for (const img of pending) {
            const result = await this.validateImageContent(img);
            if (!result.isAppropriate || result.cultural < 0.7) {
                await this.images.markValidated(img.imageId, result, 'removed');
                const [placeholder] = await this.placeholder.generate({
                    category: img.category,
                    count: 1,
                });
                if (placeholder) {
                    await this.images.createFromUrl({
                        imageId: (0, uuid_1.v4)(),
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
            await this.images.markValidated(img.imageId, {
                cultural: 0,
                sensitivity: 0,
                inclusivity: 0,
                issues: ['replaced with placeholder'],
                validator: 'auditImageAssets',
            }, 'removed');
            if (placeholder) {
                await this.images.createFromUrl({
                    imageId: (0, uuid_1.v4)(),
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
exports.TitanEngine = TitanEngine;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGl0YW5lbmdpbmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvc2VydmljZS90aXRhbmVuZ2luZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwrQkFBb0M7QUFDcEMsaUZBQTRFO0FBQzVFLDRDQU1zQjtBQUN0QixxQ0FBdUM7QUFDdkMsK0NBQTJDO0FBQzNDLCtEQUFnRTtBQUNoRSw0REFBa0U7QUFDbEUsOERBQTBEO0FBRTFELE1BQU0sZUFBZTtJQVFuQixZQUFZLE1BUVg7UUFDQyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksZ0NBQWMsQ0FBQztZQUMvQixNQUFNLEVBQUUsTUFBTSxDQUFDLE1BQU07WUFDckIsUUFBUSxFQUFFLE1BQU0sQ0FBQyxRQUFRO1lBQ3pCLFdBQVcsRUFBRSxNQUFNLENBQUMsVUFBVTtTQUMvQixDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUM7UUFDbEMsSUFBSSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDO1FBQ3BDLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQztRQUM5QixJQUFJLENBQUMsa0JBQWtCLEdBQUcsTUFBTSxDQUFDLGtCQUFrQixDQUFDO1FBQ3BELElBQUksQ0FBQyxhQUFhLEdBQUcsTUFBTSxDQUFDLGFBQWEsQ0FBQztJQUM1QyxDQUFDO0NBQ0Y7QUF3QkQsTUFBYSxXQUFXO0lBY3RCLFlBQVksTUFBeUI7UUFDbkMsTUFBTSxHQUFHLEdBQUcsVUFBVSxFQUFFLE9BQU8sRUFBRSxHQUFHLElBQUksRUFBRSxDQUFDO1FBQzNDLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLElBQUksR0FBRyxDQUFDLFVBQVUsSUFBSSxXQUFXLENBQUM7UUFFOUQsa0NBQWtDO1FBQ2xDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixDQUFDLE1BQU0s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MkIsQ0FBQztnQkFDckMsU0FBUyxFQUFFLGtCQUFrQjthQUM5QixFQUNELFNBQVMsQ0FDVixDQUFDO1lBQ0YsSUFBSSxXQUFXLEVBQUUsQ0FBQztnQkFDaEIsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQztvQkFDOUIsT0FBTyxFQUFFLElBQUEsU0FBTSxHQUFFO29CQUNqQixHQUFHLEVBQUUsV0FBVyxDQUFDLEdBQUc7b0JBQ3BCLFlBQVksRUFBRSxXQUFXLENBQUMsWUFBWTtvQkFDdEMsT0FBTyxFQUFFLFdBQVcsQ0FBQyxPQUFPO29CQUM1QixRQUFRLEVBQUUsR0FBRyxDQUFDLFFBQVE7b0JBQ3RCLElBQUksRUFBRSxXQUFXLENBQUMsSUFBSTtvQkFDdEIsTUFBTSxFQUFFLGFBQWE7b0JBQ3JCLFVBQVUsRUFBRSxXQUFXLENBQUMsVUFBVTtpQkFDbkMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0NBQ0Y7QUE5UEQsa0NBOFBDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdjQgYXMgdXVpZHY0IH0gZnJvbSAndXVpZCc7XG5pbXBvcnQgeyBJbWFnZUFzc2V0UmVwb3NpdG9yeSB9IGZyb20gJy4uL3JlcG9zaXRvcnkvaW1hZ2UtYXNzZXQtcmVwb3NpdG9yeSc7XG5pbXBvcnQge1xuICBQZXhlbHNQcm92aWRlcixcbiAgVW5zcGxhc2hQcm92aWRlcixcbiAgUGxhY2Vob2xkZXJQcm92aWRlcixcbiAgQXV0b21hdGljMTExMVByb3ZpZGVyLFxuICBCZWRyb2NrU0RYTFByb3ZpZGVyXG59IGZyb20gJy4uL3Byb3ZpZGVycyc7XG5pbXBvcnQgeyBUaXRhbktDYWNoZSB9IGZyb20gJy4va2NhY2hlJztcbmltcG9ydCB7IERzcHlCcmlkZ2UgfSBmcm9tICcuL2RzcHktYnJpZGdlJztcbmltcG9ydCB7IFRpdGFuQW5hbHl0aWNzUHJvY2Vzc29yIH0gZnJvbSAnLi9hbmFseXRpY3MtcHJvY2Vzc29yJztcbmltcG9ydCB7IEN1bHR1cmFsVmFsaWRhdGlvbkFnZW50IH0gZnJvbSAnQG1hZG1hbGwvYmVkcm9jay1hZ2VudHMnO1xuaW1wb3J0IHsgRHluYW1vREJDbGllbnQgfSBmcm9tICdAYXdzLXNkay9jbGllbnQtZHluYW1vZGInO1xuXG5jbGFzcyBEeW5hbW9EQlNlcnZpY2Uge1xuICBjbGllbnQ6IER5bmFtb0RCQ2xpZW50O1xuICB0YWJsZU5hbWU6IHN0cmluZztcbiAgbWF4UmV0cmllczogbnVtYmVyO1xuICB0aW1lb3V0OiBudW1iZXI7XG4gIGNvbm5lY3Rpb25Qb29sU2l6ZTogbnVtYmVyO1xuICBlbmFibGVNZXRyaWNzOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKGNvbmZpZzoge1xuICAgIHJlZ2lvbjogc3RyaW5nO1xuICAgIHRhYmxlTmFtZTogc3RyaW5nO1xuICAgIGVuZHBvaW50Pzogc3RyaW5nO1xuICAgIG1heFJldHJpZXM6IG51bWJlcjtcbiAgICB0aW1lb3V0OiBudW1iZXI7XG4gICAgY29ubmVjdGlvblBvb2xTaXplOiBudW1iZXI7XG4gICAgZW5hYmxlTWV0cmljczogYm9vbGVhbjtcbiAgfSkge1xuICAgIHRoaXMuY2xpZW50ID0gbmV3IER5bmFtb0RCQ2xpZW50KHtcbiAgICAgIHJlZ2lvbjogY29uZmlnLnJlZ2lvbixcbiAgICAgIGVuZHBvaW50OiBjb25maWcuZW5kcG9pbnQsXG4gICAgICBtYXhBdHRlbXB0czogY29uZmlnLm1heFJldHJpZXMsXG4gICAgfSk7XG4gICAgdGhpcy50YWJsZU5hbWUgPSBjb25maWcudGFibGVOYW1lO1xuICAgIHRoaXMubWF4UmV0cmllcyA9IGNvbmZpZy5tYXhSZXRyaWVzO1xuICAgIHRoaXMudGltZW91dCA9IGNvbmZpZy50aW1lb3V0O1xuICAgIHRoaXMuY29ubmVjdGlvblBvb2xTaXplID0gY29uZmlnLmNvbm5lY3Rpb25Qb29sU2l6ZTtcbiAgICB0aGlzLmVuYWJsZU1ldHJpY3MgPSBjb25maWcuZW5hYmxlTWV0cmljcztcbiAgfVxufVxuXG5pbnRlcmZhY2UgQ2FyZVJlY29tbWVuZGF0aW9uIHtcbiAgaWQ6IHN0cmluZztcbiAgdXNlcklkOiBzdHJpbmc7XG4gIHJlY29tbWVuZGF0aW9uczogc3RyaW5nW107XG4gIGNvbmZpZGVuY2U6IG51bWJlcjtcbiAgdGltZXN0YW1wOiBEYXRlO1xufVxuXG5pbnRlcmZhY2UgVGl0YW5FdmVudCB7XG4gIHVzZXJJZDogc3RyaW5nO1xuICBldmVudFR5cGU6ICdwYWdlJyB8ICdpbnRlcmFjdGlvbic7XG4gIG5hbWU6IHN0cmluZztcbiAgdGltZXN0YW1wPzogbnVtYmVyO1xuICBkYXRhPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG59XG5cbmludGVyZmFjZSBUaXRhbkVuZ2luZUNvbmZpZyB7XG4gIHJlZ2lvbj86IHN0cmluZztcbiAgdGFibGVOYW1lPzogc3RyaW5nO1xuICBlbmRwb2ludD86IHN0cmluZztcbn1cblxuZXhwb3J0IGNsYXNzIFRpdGFuRW5naW5lIHtcbiAgcHJpdmF0ZSBkeW5hbW86IER5bmFtb0RCU2VydmljZTtcbiAgcHJpdmF0ZSBpbWFnZXM6IEltYWdlQXNzZXRSZXBvc2l0b3J5O1xuICBwcml2YXRlIHBleGVsczogUGV4ZWxzUHJvdmlkZXI7XG4gIHByaXZhdGUgdW5zcGxhc2g6IFVuc3BsYXNoUHJvdmlkZXI7XG4gIHByaXZhdGUgcGxhY2Vob2xkZXI6IFBsYWNlaG9sZGVyUHJvdmlkZXI7XG4gIHByaXZhdGUgYTExMTE6IEF1dG9tYXRpYzExMTFQcm92aWRlcjtcbiAgcHJpdmF0ZSBiZWRyb2NrOiBCZWRyb2NrU0RYTFByb3ZpZGVyO1xuICBwcml2YXRlIGN1bHR1cmFsQWdlbnQ6IEN1bHR1cmFsVmFsaWRhdGlvbkFnZW50O1xuICBwcml2YXRlIGRzcHk6IERzcHlCcmlkZ2U7XG4gIHByaXZhdGUga2NhY2hlOiBUaXRhbktDYWNoZTxDYXJlUmVjb21tZW5kYXRpb24+O1xuICBwcml2YXRlIGV2ZW50Q2FjaGU6IFRpdGFuS0NhY2hlPFRpdGFuRXZlbnRbXT47XG4gIHByaXZhdGUgYW5hbHl0aWNzOiBUaXRhbkFuYWx5dGljc1Byb2Nlc3NvcjtcblxuICBjb25zdHJ1Y3Rvcihjb25maWc6IFRpdGFuRW5naW5lQ29uZmlnKSB7XG4gICAgY29uc3QgZW52ID0gZ2xvYmFsVGhpcz8ucHJvY2Vzcz8uZW52IHx8IHt9O1xuICAgIGNvbnN0IHJlZ2lvbiA9IGNvbmZpZy5yZWdpb24gfHwgZW52LkFXU19SRUdJT04gfHwgJ3VzLWVhc3QtMSc7XG5cbiAgICAvLyBJbml0aWFsaXplIHRoZSBEeW5hbW9EQiBTZXJ2aWNlXG4gICAgdGhpcy5keW5hbW8gPSB0aGlzLmluaXRpYWxpemVEeW5hbW9EQlNlcnZpY2UoY29uZmlnLCBlbnYpO1xuXG4gICAgLy8gSW5pdGlhbGl6ZSBvdGhlciBzZXJ2aWNlc1xuICAgIHRoaXMuaW1hZ2VzID0gbmV3IEltYWdlQXNzZXRSZXBvc2l0b3J5KHRoaXMuZHluYW1vKTtcbiAgICB0aGlzLnBleGVscyA9IG5ldyBQZXhlbHNQcm92aWRlcigpO1xuICAgIHRoaXMudW5zcGxhc2ggPSBuZXcgVW5zcGxhc2hQcm92aWRlcigpO1xuICAgIHRoaXMucGxhY2Vob2xkZXIgPSBuZXcgUGxhY2Vob2xkZXJQcm92aWRlcigpO1xuICAgIHRoaXMuYTExMTEgPSBuZXcgQXV0b21hdGljMTExMVByb3ZpZGVyKCk7XG4gICAgdGhpcy5iZWRyb2NrID0gbmV3IEJlZHJvY2tTRFhMUHJvdmlkZXIoKTtcbiAgICB0aGlzLmN1bHR1cmFsQWdlbnQgPSBuZXcgQ3VsdHVyYWxWYWxpZGF0aW9uQWdlbnQocmVnaW9uKTtcbiAgICB0aGlzLmRzcHkgPSBuZXcgRHNweUJyaWRnZSgpO1xuXG4gICAgLy8gSW5pdGlhbGl6ZSBjYWNoZXNcbiAgICB0aGlzLmtjYWNoZSA9IG5ldyBUaXRhbktDYWNoZTxDYXJlUmVjb21tZW5kYXRpb24+KHtcbiAgICAgIG5hbWVzcGFjZTogJ3RpdGFuLWNhcmUnLFxuICAgICAgdHRsU2Vjb25kczogMzAwLFxuICAgIH0pO1xuXG4gICAgdGhpcy5ldmVudENhY2hlID0gbmV3IFRpdGFuS0NhY2hlPFRpdGFuRXZlbnRbXT4oe1xuICAgICAgbmFtZXNwYWNlOiAndGl0YW4tZXZlbnRzJyxcbiAgICAgIHR0bFNlY29uZHM6IDMwMCxcbiAgICB9KTtcblxuICAgIHRoaXMuYW5hbHl0aWNzID0gbmV3IFRpdGFuQW5hbHl0aWNzUHJvY2Vzc29yKHRoaXMuZXZlbnRDYWNoZSk7XG5cbiAgICBjb25zb2xlLmxvZygnVGl0YW4gRW5naW5lIGluaXRpYWxpemVkIHN1Y2Nlc3NmdWxseS4nKTtcbiAgfVxuXG4gIHByaXZhdGUgaW5pdGlhbGl6ZUR5bmFtb0RCU2VydmljZShjb25maWc6IFRpdGFuRW5naW5lQ29uZmlnLCBlbnY6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogRHluYW1vREJTZXJ2aWNlIHtcbiAgICByZXR1cm4gbmV3IER5bmFtb0RCU2VydmljZSh7XG4gICAgICByZWdpb246IFN0cmluZyhjb25maWcucmVnaW9uIHx8IGVudi5BV1NfUkVHSU9OIHx8ICd1cy1lYXN0LTEnKSxcbiAgICAgIHRhYmxlTmFtZTogU3RyaW5nKGNvbmZpZy50YWJsZU5hbWUgfHwgZW52LkRZTkFNT19UQUJMRSB8fCAnbWFkbWFsbC1kZXZlbG9wbWVudC1tYWluJyksXG4gICAgICBlbmRwb2ludDogY29uZmlnLmVuZHBvaW50IHx8IFN0cmluZyhlbnYuRFlOQU1PREJfRU5EUE9JTlQgfHwgJycpLFxuICAgICAgbWF4UmV0cmllczogMyxcbiAgICAgIHRpbWVvdXQ6IDMwMDAsXG4gICAgICBjb25uZWN0aW9uUG9vbFNpemU6IDUwLFxuICAgICAgZW5hYmxlTWV0cmljczogdHJ1ZSxcbiAgICB9KTtcbiAgfVxuXG4gIHN0YXRpYyBjcmVhdGVEZWZhdWx0KCkge1xuICAgIHJldHVybiBuZXcgVGl0YW5FbmdpbmUoe30pO1xuICB9XG5cbiAgYXN5bmMgaW1wb3J0RnJvbVBleGVscyhwYXJhbXM6IHsgcXVlcnk6IHN0cmluZzsgY2F0ZWdvcnk6IHN0cmluZzsgY291bnQ/OiBudW1iZXIgfSkge1xuICAgIHJldHVybiB0aGlzLmltcG9ydEltYWdlcygncGV4ZWxzJywgcGFyYW1zKTtcbiAgfVxuXG4gIGFzeW5jIGltcG9ydEZyb21VbnNwbGFzaChwYXJhbXM6IHsgcXVlcnk6IHN0cmluZzsgY2F0ZWdvcnk6IHN0cmluZzsgY291bnQ/OiBudW1iZXIgfSkge1xuICAgIHJldHVybiB0aGlzLmltcG9ydEltYWdlcygndW5zcGxhc2gnLCBwYXJhbXMpO1xuICB9XG5cbiAgYXN5bmMgaW1wb3J0UGxhY2Vob2xkZXIocGFyYW1zOiB7IGNhdGVnb3J5OiBzdHJpbmc7IGNvdW50PzogbnVtYmVyIH0pIHtcbiAgICByZXR1cm4gdGhpcy5pbXBvcnRJbWFnZXMoJ3BsYWNlaG9sZGVyJywgcGFyYW1zKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgaW1wb3J0SW1hZ2VzKHNvdXJjZTogJ3BleGVscycgfCAndW5zcGxhc2gnIHwgJ3BsYWNlaG9sZGVyJywgcGFyYW1zOiB7IHF1ZXJ5Pzogc3RyaW5nOyBjYXRlZ29yeTogc3RyaW5nOyBjb3VudD86IG51bWJlciB9KSB7XG4gICAgbGV0IHJlc3VsdHM6IGFueVtdO1xuICAgIHRyeSB7XG4gICAgICBpZiAoc291cmNlID09PSAncGV4ZWxzJykge1xuICAgICAgICByZXN1bHRzID0gYXdhaXQgdGhpcy5wZXhlbHMuc2VhcmNoKHtcbiAgICAgICAgICBxdWVyeTogcGFyYW1zLnF1ZXJ5LFxuICAgICAgICAgIGNhdGVnb3J5OiBwYXJhbXMuY2F0ZWdvcnksXG4gICAgICAgICAgY291bnQ6IHBhcmFtcy5jb3VudCxcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2UgaWYgKHNvdXJjZSA9PT0gJ3Vuc3BsYXNoJykge1xuICAgICAgICByZXN1bHRzID0gYXdhaXQgdGhpcy51bnNwbGFzaC5zZWFyY2goe1xuICAgICAgICAgIHF1ZXJ5OiBwYXJhbXMucXVlcnksXG4gICAgICAgICAgY2F0ZWdvcnk6IHBhcmFtcy5jYXRlZ29yeSxcbiAgICAgICAgICBjb3VudDogcGFyYW1zLmNvdW50LFxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdHMgPSBhd2FpdCB0aGlzLnBsYWNlaG9sZGVyLmdlbmVyYXRlKHtcbiAgICAgICAgICBjYXRlZ29yeTogcGFyYW1zLmNhdGVnb3J5LFxuICAgICAgICAgIGNvdW50OiBwYXJhbXMuY291bnQsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGBFcnJvciBmZXRjaGluZyBpbWFnZXMgZnJvbSAke3NvdXJjZX06YCwgZXJyb3IpO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gaW1wb3J0IGltYWdlcyBmcm9tICR7c291cmNlfWApO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmNyZWF0ZUltYWdlc0Zyb21SZXN1bHRzKHJlc3VsdHMpO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBjcmVhdGVJbWFnZXNGcm9tUmVzdWx0cyhyZXN1bHRzOiBhbnlbXSk6IFByb21pc2U8YW55W10+IHtcbiAgICBjb25zdCBjcmVhdGVkSW1hZ2VzOiBQcm9taXNlPGFueT5bXSA9IHJlc3VsdHMubWFwKGFzeW5jIChyKSA9PiB7XG4gICAgICBjb25zdCBpZCA9IHV1aWR2NCgpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuaW1hZ2VzLmNyZWF0ZUZyb21Vcmwoe1xuICAgICAgICAgIGltYWdlSWQ6IGlkLFxuICAgICAgICAgIHVybDogci51cmwsXG4gICAgICAgICAgdGh1bWJuYWlsVXJsOiByLnRodW1ibmFpbFVybCxcbiAgICAgICAgICBhbHRUZXh0OiByLmFsdFRleHQsXG4gICAgICAgICAgY2F0ZWdvcnk6IHIuY2F0ZWdvcnksXG4gICAgICAgICAgdGFnczogci50YWdzLFxuICAgICAgICAgIHNvdXJjZTogJ3N0b2NrJyxcbiAgICAgICAgICBzb3VyY2VJbmZvOiByLnNvdXJjZUluZm8sXG4gICAgICAgIH0pO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIGNyZWF0aW5nIGltYWdlIGZyb20gVVJMOlwiLCBlcnJvcik7XG4gICAgICAgIHJldHVybiBudWxsOyAvLyBTa2lwIHRoaXMgaXRlbSBvbiBlcnJvclxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gRmlsdGVyIG91dCBhbnkgbnVsbCBpdGVtcyAoZmFpbGVkIGNyZWF0aW9ucylcbiAgICBjb25zdCByZXN1bHRzQXJyYXkgPSBhd2FpdCBQcm9taXNlLmFsbChjcmVhdGVkSW1hZ2VzKTtcbiAgICByZXR1cm4gcmVzdWx0c0FycmF5LmZpbHRlcihCb29sZWFuKTsgLy8gUmV0dXJucyBhbiBhcnJheSB3aXRoIHN1Y2Nlc3NmdWwgY3JlYXRpb25zXG4gIH1cblxuICBhc3luYyB2YWxpZGF0ZUltYWdlQ29udGVudChpbWFnZToge1xuICAgIHVybDogc3RyaW5nO1xuICAgIGFsdFRleHQ6IHN0cmluZztcbiAgICBjYXRlZ29yeTogc3RyaW5nO1xuICAgIGltYWdlSWQ/OiBzdHJpbmc7XG4gIH0pIHtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuY3VsdHVyYWxBZ2VudC5leGVjdXRlKHtcbiAgICAgIGNvbnRlbnQ6IGltYWdlLnVybCxcbiAgICAgIGNvbnRlbnRUeXBlOiAnaW1hZ2VfdXJsJyxcbiAgICAgIGN1bHR1cmFsQ29udGV4dDoge1xuICAgICAgICBwcmltYXJ5Q3VsdHVyZTogJ2FmcmljYW5fYW1lcmljYW4nLFxuICAgICAgICBzZWNvbmRhcnlDdWx0dXJlczogW10sXG4gICAgICAgIHJlZ2lvbjogJ3VzJyxcbiAgICAgICAgbGFuZ3VhZ2U6ICdlbicsXG4gICAgICAgIHJlbGlnaW91c0NvbnNpZGVyYXRpb25zOiBbXSxcbiAgICAgICAgc2Vuc2l0aXZlVG9waWNzOiBbXSxcbiAgICAgIH0sXG4gICAgICB0YXJnZXRBdWRpZW5jZToge1xuICAgICAgICBhZ2VSYW5nZTogeyBtaW46IDIwLCBtYXg6IDYwIH0sXG4gICAgICAgIGRpYWdub3Npc1N0YWdlOiAnaW5fdHJlYXRtZW50JyxcbiAgICAgICAgc3VwcG9ydE5lZWRzOiBbJ2NvbW11bml0eSddLFxuICAgICAgfSxcbiAgICB9LCB7XG4gICAgICBzZXNzaW9uSWQ6ICd2YWxpZGF0aW9uLXNlc3Npb24nLFxuICAgICAgY29ycmVsYXRpb25JZDogYHZhbGlkYXRlLSR7aW1hZ2UuaW1hZ2VJZCB8fCAndW5rbm93bid9YCxcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKSxcbiAgICB9KTtcblxuICAgIGlmICghcmVzcG9uc2Uuc3VjY2VzcyB8fCAhcmVzcG9uc2UuZGF0YSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKHJlc3BvbnNlLmVycm9yIHx8ICdJbWFnZSB2YWxpZGF0aW9uIGZhaWxlZCcpO1xuICAgIH1cblxuICAgIGNvbnN0IGRhdGEgPSByZXNwb25zZS5kYXRhO1xuICAgIGNvbnN0IHNjb3JlcyA9IHtcbiAgICAgIGN1bHR1cmFsOiBkYXRhLmN1bHR1cmFsUmVsZXZhbmNlU2NvcmUsXG4gICAgICBzZW5zaXRpdml0eTogZGF0YS5zZW5zaXRpdml0eVNjb3JlLFxuICAgICAgaW5jbHVzaXZpdHk6IGRhdGEuaW5jbHVzaXZpdHlTY29yZSxcbiAgICAgIGlzc3VlczogZGF0YS5pc3N1ZXMubWFwKChpKSA9PiBpLmRlc2NyaXB0aW9uKSxcbiAgICAgIHZhbGlkYXRvcjogJ2N1bHR1cmFsLXZhbGlkYXRpb24tYWdlbnQnLFxuICAgIH07XG5cbiAgICBpZiAoaW1hZ2UuaW1hZ2VJZCkge1xuICAgICAgY29uc3Qgc3RhdHVzID0gZGF0YS5pc0FwcHJvcHJpYXRlID8gJ2FjdGl2ZScgOiAnZmxhZ2dlZCc7XG4gICAgICBhd2FpdCB0aGlzLmltYWdlcy5tYXJrVmFsaWRhdGVkKGltYWdlLmltYWdlSWQsIHNjb3Jlcywgc3RhdHVzKTtcbiAgICB9XG5cbiAgICByZXR1cm4geyAuLi5zY29yZXMsIGlzQXBwcm9wcmlhdGU6IGRhdGEuaXNBcHByb3ByaWF0ZSB9O1xuICB9XG5cbiAgYXN5bmMgcmVjb3JkRXZlbnQoZXZlbnQ6IFRpdGFuRXZlbnQpIHtcbiAgICBhd2FpdCB0aGlzLmFuYWx5dGljcy5yZWNvcmQoZXZlbnQpO1xuICB9XG5cbiAgYXN5bmMgZ2V0RXZlbnRzKHVzZXJJZDogc3RyaW5nKTogUHJvbWlzZTxUaXRhbkV2ZW50W10+IHtcbiAgICByZXR1cm4gdGhpcy5hbmFseXRpY3MuZ2V0RXZlbnRzKHVzZXJJZCk7XG4gIH1cblxuICBhc3luYyBsaXN0UGVuZGluZyhsaW1pdCA9IDIwKSB7XG4gICAgcmV0dXJuIHRoaXMuaW1hZ2VzLmxpc3RQZW5kaW5nKGxpbWl0KTtcbiAgfVxuXG4gIGFzeW5jIGxpc3RGbGFnZ2VkKGxpbWl0ID0gMjApIHtcbiAgICByZXR1cm4gdGhpcy5pbWFnZXMubGlzdEZsYWdnZWQobGltaXQpO1xuICB9XG5cbiAgYXN5bmMgc2VsZWN0QnlDb250ZXh0KGNvbnRleHQ6IHN0cmluZywgbGltaXQgPSAxMCkge1xuICAgIHJldHVybiB0aGlzLmltYWdlcy5saXN0QnlDYXRlZ29yeShjb250ZXh0LnNwbGl0KCcuJylbMF0gfHwgJ2dlbmVyYWwnLCBsaW1pdCk7XG4gIH1cblxuICBhc3luYyBhdWRpdEltYWdlQXNzZXRzKGxpbWl0ID0gMjApIHtcbiAgICBjb25zdCBwZW5kaW5nID0gYXdhaXQgdGhpcy5pbWFnZXMubGlzdFBlbmRpbmcobGltaXQpO1xuICAgIGZvciAoY29uc3QgaW1nIG9mIHBlbmRpbmcpIHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMudmFsaWRhdGVJbWFnZUNvbnRlbnQoaW1nIGFzIGFueSk7XG4gICAgICBpZiAoIXJlc3VsdC5pc0FwcHJvcHJpYXRlIHx8IHJlc3VsdC5jdWx0dXJhbCA8IDAuNykge1xuICAgICAgICBhd2FpdCB0aGlzLmltYWdlcy5tYXJrVmFsaWRhdGVkKGltZy5pbWFnZUlkLCByZXN1bHQsICdyZW1vdmVkJyk7XG4gICAgICAgIGNvbnN0IFtwbGFjZWhvbGRlcl0gPSBhd2FpdCB0aGlzLnBsYWNlaG9sZGVyLmdlbmVyYXRlKHtcbiAgICAgICAgICBjYXRlZ29yeTogaW1nLmNhdGVnb3J5LFxuICAgICAgICAgIGNvdW50OiAxLFxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHBsYWNlaG9sZGVyKSB7XG4gICAgICAgICAgYXdhaXQgdGhpcy5pbWFnZXMuY3JlYXRlRnJvbVVybCh7XG4gICAgICAgICAgICBpbWFnZUlkOiB1dWlkdjQoKSxcbiAgICAgICAgICAgIHVybDogcGxhY2Vob2xkZXIudXJsLFxuICAgICAgICAgICAgdGh1bWJuYWlsVXJsOiBwbGFjZWhvbGRlci50aHVtYm5haWxVcmwsXG4gICAgICAgICAgICBhbHRUZXh0OiBwbGFjZWhvbGRlci5hbHRUZXh0LFxuICAgICAgICAgICAgY2F0ZWdvcnk6IGltZy5jYXRlZ29yeSxcbiAgICAgICAgICAgIHRhZ3M6IHBsYWNlaG9sZGVyLnRhZ3MsXG4gICAgICAgICAgICBzb3VyY2U6ICdzdG9jaycsXG4gICAgICAgICAgICBzb3VyY2VJbmZvOiBwbGFjZWhvbGRlci5zb3VyY2VJbmZvLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgZmxhZ2dlZCA9IGF3YWl0IHRoaXMuaW1hZ2VzLmxpc3RGbGFnZ2VkKGxpbWl0KTtcbiAgICBmb3IgKGNvbnN0IGltZyBvZiBmbGFnZ2VkKSB7XG4gICAgICBjb25zdCBbcGxhY2Vob2xkZXJdID0gYXdhaXQgdGhpcy5wbGFjZWhvbGRlci5nZW5lcmF0ZSh7XG4gICAgICAgIGNhdGVnb3J5OiBpbWcuY2F0ZWdvcnksXG4gICAgICAgIGNvdW50OiAxLFxuICAgICAgfSk7XG4gICAgICBhd2FpdCB0aGlzLmltYWdlcy5tYXJrVmFsaWRhdGVkKFxuICAgICAgICBpbWcuaW1hZ2VJZCxcbiAgICAgICAge1xuICAgICAgICAgIGN1bHR1cmFsOiAwLFxuICAgICAgICAgIHNlbnNpdGl2aXR5OiAwLFxuICAgICAgICAgIGluY2x1c2l2aXR5OiAwLFxuICAgICAgICAgIGlzc3VlczogWydyZXBsYWNlZCB3aXRoIHBsYWNlaG9sZGVyJ10sXG4gICAgICAgICAgdmFsaWRhdG9yOiAnYXVkaXRJbWFnZUFzc2V0cycsXG4gICAgICAgIH0sXG4gICAgICAgICdyZW1vdmVkJ1xuICAgICAgKTtcbiAgICAgIGlmIChwbGFjZWhvbGRlcikge1xuICAgICAgICBhd2FpdCB0aGlzLmltYWdlcy5jcmVhdGVGcm9tVXJsKHtcbiAgICAgICAgICBpbWFnZUlkOiB1dWlkdjQoKSxcbiAgICAgICAgICB1cmw6IHBsYWNlaG9sZGVyLnVybCxcbiAgICAgICAgICB0aHVtYm5haWxVcmw6IHBsYWNlaG9sZGVyLnRodW1ibmFpbFVybCxcbiAgICAgICAgICBhbHRUZXh0OiBwbGFjZWhvbGRlci5hbHRUZXh0LFxuICAgICAgICAgIGNhdGVnb3J5OiBpbWcuY2F0ZWdvcnksXG4gICAgICAgICAgdGFnczogcGxhY2Vob2xkZXIudGFncyxcbiAgICAgICAgICBzb3VyY2U6ICdwbGFjZWhvbGRlcicsXG4gICAgICAgICAgc291cmNlSW5mbzogcGxhY2Vob2xkZXIuc291cmNlSW5mbyxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59Il19