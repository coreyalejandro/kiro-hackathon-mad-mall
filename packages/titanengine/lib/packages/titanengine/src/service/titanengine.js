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
const dspy_bridge_1 = require("./dspy-bridge");
const kcache_1 = require("./kcache");
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
        this.dspy = new dspy_bridge_1.DspyBridge();
        this.kcache = new kcache_1.TitanKCache({ namespace: 'titan-care', ttlSeconds: 300 });
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
    async generateCareModel(input, options) {
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
        let result;
        if (options?.bypassCache) {
            const data = await producer();
            result = { data, cached: false };
        }
        else {
            result = await this.kcache.withCache(key, producer, 300);
        }
        return { recommendation: result.data, cached: result.cached, cacheStats: this.kcache.getStats() };
    }
    async listPending(limit = 20) {
        return this.images.listPending(limit);
    }
    async selectByContext(context, limit = 1) {
        return this.images.selectByCategory(context, limit);
    }
}
exports.TitanEngine = TitanEngine;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGl0YW5lbmdpbmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvc2VydmljZS90aXRhbmVuZ2luZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw2REFBNkQ7QUFDN0QsYUFBYTtBQUNiLCtCQUFvQztBQUNwQyw0REFBMEQ7QUFDMUQsaUZBQTRFO0FBQzVFLGtFQUE4RDtBQUM5RCxzRUFBa0U7QUFDbEUsNEVBQXdFO0FBQ3hFLGdGQUE0RTtBQUM1RSw0REFBa0U7QUFDbEUsK0NBQStEO0FBQy9ELHFDQUF1QztBQVF2QyxNQUFhLFdBQVc7SUFXdEIsWUFBWSxNQUF5QjtRQUNuQyw4RUFBOEU7UUFDOUUsTUFBTSxHQUFHLEdBQUksVUFBa0IsQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLEVBQUUsQ0FBQztRQUNuRCxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksZ0NBQWUsQ0FBQztZQUNoQyxNQUFNLEVBQUUsTUFBTSxDQUFDLE1BQU0sSUFBSSxHQUFHLENBQUMsVUFBVSxJQUFJLFdBQVc7WUFDdEQsU0FBUyxFQUFFLE1BQU0sQ0FBQyxTQUFTLElBQUksR0FBRyxDQUFDLFlBQVksSUFBSSwwQkFBMEI7WUFDN0UsUUFBUSxFQUFFLEdBQUcsQ0FBQyxpQkFBaUIsSUFBSSxNQUFNLENBQUMsUUFBUTtZQUNsRCxVQUFVLEVBQUUsQ0FBQztZQUNiLE9BQU8sRUFBRSxJQUFJO1lBQ2Isa0JBQWtCLEVBQUUsRUFBRTtZQUN0QixhQUFhLEVBQUUsSUFBSTtTQUNwQixDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksNkNBQW9CLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3BELElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxnQ0FBYyxFQUFFLENBQUM7UUFDbkMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLG9DQUFnQixFQUFFLENBQUM7UUFDdkMsSUFBSSxDQUFDLFdBQVcsR0FB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QzlCLE1BQU0sR0FBRyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLENBQUM7UUFDbkMsQ0FBQzthQUFNLENBQUM7WUFDTixNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQzNELENBQUM7UUFFRCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQztJQUNwRyxDQUFDO0lBRUQsS0FBSyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEdBQUcsRUFBRTtRQUMxQixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFFRCxLQUFLLENBQUMsZUFBZSxDQUFDLE9BQWUsRUFBRSxLQUFLLEdBQUcsQ0FBQztRQUM5QyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3RELENBQUM7Q0FDRjtBQW5NRCxrQ0FtTUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50XG4vLyBAdHMtaWdub3JlXG5pbXBvcnQgeyB2NCBhcyB1dWlkdjQgfSBmcm9tICd1dWlkJztcbmltcG9ydCB7IER5bmFtb0RCU2VydmljZSB9IGZyb20gJ0BtYWRtYWxsL2luZnJhc3RydWN0dXJlJztcbmltcG9ydCB7IEltYWdlQXNzZXRSZXBvc2l0b3J5IH0gZnJvbSAnLi4vcmVwb3NpdG9yeS9pbWFnZS1hc3NldC1yZXBvc2l0b3J5JztcbmltcG9ydCB7IFBleGVsc1Byb3ZpZGVyIH0gZnJvbSAnLi4vcHJvdmlkZXJzL3BleGVscy1wcm92aWRlcic7XG5pbXBvcnQgeyBVbnNwbGFzaFByb3ZpZGVyIH0gZnJvbSAnLi4vcHJvdmlkZXJzL3Vuc3BsYXNoLXByb3ZpZGVyJztcbmltcG9ydCB7IFBsYWNlaG9sZGVyUHJvdmlkZXIgfSBmcm9tICcuLi9wcm92aWRlcnMvcGxhY2Vob2xkZXItcHJvdmlkZXInO1xuaW1wb3J0IHsgQXV0b21hdGljMTExMVByb3ZpZGVyIH0gZnJvbSAnLi4vcHJvdmlkZXJzL2F1dG9tYXRpYzExMTEtcHJvdmlkZXInO1xuaW1wb3J0IHsgQ3VsdHVyYWxWYWxpZGF0aW9uQWdlbnQgfSBmcm9tICdAbWFkbWFsbC9iZWRyb2NrLWFnZW50cyc7XG5pbXBvcnQgeyBEc3B5QnJpZGdlLCBDYXJlUmVjb21tZW5kYXRpb24gfSBmcm9tICcuL2RzcHktYnJpZGdlJztcbmltcG9ydCB7IFRpdGFuS0NhY2hlIH0gZnJvbSAnLi9rY2FjaGUnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFRpdGFuRW5naW5lQ29uZmlnIHtcbiAgcmVnaW9uPzogc3RyaW5nO1xuICB0YWJsZU5hbWU/OiBzdHJpbmc7XG4gIGVuZHBvaW50Pzogc3RyaW5nO1xufVxuXG5leHBvcnQgY2xhc3MgVGl0YW5FbmdpbmUge1xuICBwcml2YXRlIHJlYWRvbmx5IGR5bmFtbzogRHluYW1vREJTZXJ2aWNlO1xuICBwcml2YXRlIHJlYWRvbmx5IGltYWdlczogSW1hZ2VBc3NldFJlcG9zaXRvcnk7XG4gIHByaXZhdGUgcmVhZG9ubHkgcGV4ZWxzOiBQZXhlbHNQcm92aWRlcjtcbiAgcHJpdmF0ZSByZWFkb25seSB1bnNwbGFzaDogVW5zcGxhc2hQcm92aWRlcjtcbiAgcHJpdmF0ZSByZWFkb25seSBwbGFjZWhvbGRlcjogUGxhY2Vob2xkZXJQcm92aWRlcjtcbiAgcHJpdmF0ZSByZWFkb25seSBhMTExMTogQXV0b21hdGljMTExMVByb3ZpZGVyO1xuICBwcml2YXRlIHJlYWRvbmx5IGN1bHR1cmFsQWdlbnQ6IEN1bHR1cmFsVmFsaWRhdGlvbkFnZW50O1xuICBwcml2YXRlIHJlYWRvbmx5IGRzcHk6IERzcHlCcmlkZ2U7XG4gIHByaXZhdGUgcmVhZG9ubHkga2NhY2hlOiBUaXRhbktDYWNoZTxDYXJlUmVjb21tZW5kYXRpb24+O1xuXG4gIGNvbnN0cnVjdG9yKGNvbmZpZzogVGl0YW5FbmdpbmVDb25maWcpIHtcbiAgICAvLyBVc2UgZ2xvYmFsVGhpcyB0byBhdm9pZCBUUyBjb21wbGFpbmluZyBhYm91dCBwcm9jZXNzIHR5cGVzIGluIHNvbWUgY29udGV4dHNcbiAgICBjb25zdCBlbnYgPSAoZ2xvYmFsVGhpcyBhcyBhbnkpLnByb2Nlc3M/LmVudiB8fCB7fTtcbiAgICB0aGlzLmR5bmFtbyA9IG5ldyBEeW5hbW9EQlNlcnZpY2Uoe1xuICAgICAgcmVnaW9uOiBjb25maWcucmVnaW9uIHx8IGVudi5BV1NfUkVHSU9OIHx8ICd1cy1lYXN0LTEnLFxuICAgICAgdGFibGVOYW1lOiBjb25maWcudGFibGVOYW1lIHx8IGVudi5EWU5BTU9fVEFCTEUgfHwgYG1hZG1hbGwtZGV2ZWxvcG1lbnQtbWFpbmAsXG4gICAgICBlbmRwb2ludDogZW52LkRZTkFNT0RCX0VORFBPSU5UIHx8IGNvbmZpZy5lbmRwb2ludCxcbiAgICAgIG1heFJldHJpZXM6IDMsXG4gICAgICB0aW1lb3V0OiAzMDAwLFxuICAgICAgY29ubmVjdGlvblBvb2xTaXplOiA1MCxcbiAgICAgIGVuYWJsZU1ldHJpY3M6IHRydWUsXG4gICAgfSk7XG4gICAgdGhpcy5pbWFnZXMgPSBuZXcgSW1hZ2VBc3NldFJlcG9zaXRvcnkodGhpcy5keW5hbW8pO1xuICAgIHRoaXMucGV4ZWxzID0gbmV3IFBleGVsc1Byb3ZpZGVyKCk7XG4gICAgdGhpcy51bnNwbGFzaCA9IG5ldyBVbnNwbGFzaFByb3ZpZGVyKCk7XG4gICAgdGhpcy5wbGFjZWhvbGRlciA9IG5ldyBQbGFjZWhvbGRlclByb3ZpZGVyKCk7XG4gICAgdGhpcy5hMTExMSA9IG5ldyBBdXRvbWF0aWMxMTExUHJvdmlkZXIoKTtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgIGNvbnN0IHJlZ2lvbiA9IChnbG9iYWxUaGlzIGFzIGFueSkucHJvY2Vzcz8uZW52Py5BV1NfUkVHSU9OIHx8ICd1cy1lYXN0LTEnO1xuICAgIHRoaXMuY3VsdHVyYWxBZ2VudCA9IG5ldyBDdWx0dXJhbFZhbGlkYXRpb25BZ2VudChyZWdpb24pO1xuICAgIHRoaXMuZHNweSA9IG5ldyBEc3B5QnJpZGdlKCk7XG4gICAgdGhpcy5rY2FjaGUgPSBuZXcgVGl0YW5LQ2FjaGU8Q2FyZVJlY29tbWVuZGF0aW9uPih7IG5hbWVzcGFjZTogJ3RpdGFuLWNhcmUnLCB0dGxTZWNvbmRzOiAzMDAgfSk7XG4gIH1cblxuICBzdGF0aWMgY3JlYXRlRGVmYXVsdCgpIHtcbiAgICByZXR1cm4gbmV3IFRpdGFuRW5naW5lKHt9KTtcbiAgfVxuXG4gIGFzeW5jIGltcG9ydEZyb21QZXhlbHMocGFyYW1zOiB7IHF1ZXJ5OiBzdHJpbmc7IGNhdGVnb3J5OiBzdHJpbmc7IGNvdW50PzogbnVtYmVyIH0pIHtcbiAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgdGhpcy5wZXhlbHMuc2VhcmNoKHBhcmFtcyk7XG4gICAgY29uc3QgY3JlYXRlZCA9IFtdIGFzIGFueVtdO1xuICAgIGZvciAoY29uc3QgciBvZiByZXN1bHRzKSB7XG4gICAgICBjb25zdCBpZCA9IHV1aWR2NCgpO1xuICAgICAgY29uc3QgaXRlbSA9IGF3YWl0IHRoaXMuaW1hZ2VzLmNyZWF0ZUZyb21Vcmwoe1xuICAgICAgICBpbWFnZUlkOiBpZCxcbiAgICAgICAgdXJsOiByLnVybCxcbiAgICAgICAgdGh1bWJuYWlsVXJsOiByLnRodW1ibmFpbFVybCxcbiAgICAgICAgYWx0VGV4dDogci5hbHRUZXh0LFxuICAgICAgICBjYXRlZ29yeTogci5jYXRlZ29yeSxcbiAgICAgICAgdGFnczogci50YWdzLFxuICAgICAgICBzb3VyY2U6ICdzdG9jaycsXG4gICAgICAgIHNvdXJjZUluZm86IHIuc291cmNlSW5mbyxcbiAgICAgIH0pO1xuICAgICAgY3JlYXRlZC5wdXNoKGl0ZW0pO1xuICAgIH1cbiAgICByZXR1cm4gY3JlYXRlZDtcbiAgfVxuXG4gIGFzeW5jIGltcG9ydEZyb21VbnNwbGFzaChwYXJhbXM6IHsgcXVlcnk6IHN0cmluZzsgY2F0ZWdvcnk6IHN0cmluZzsgY291bnQ/OiBudW1iZXIgfSkge1xuICAgIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCB0aGlzLnVuc3BsYXNoLnNlYXJjaChwYXJhbXMpO1xuICAgIGNvbnN0IGNyZWF0ZWQgPSBbXSBhcyBhbnlbXTtcbiAgICBmb3IgKGNvbnN0IHIgb2YgcmVzdWx0cykge1xuICAgICAgY29uc3QgaWQgPSB1dWlkdjQoKTtcbiAgICAgIGNvbnN0IGl0ZW0gPSBhd2FpdCB0aGlzLmltYWdlcy5jcmVhdGVGcm9tVXJsKHtcbiAgICAgICAgaW1hZ2VJZDogaWQsXG4gICAgICAgIHVybDogci51cmwsXG4gICAgICAgIHRodW1ibmFpbFVybDogci50aHVtYm5haWxVcmwsXG4gICAgICAgIGFsdFRleHQ6IHIuYWx0VGV4dCxcbiAgICAgICAgY2F0ZWdvcnk6IHIuY2F0ZWdvcnksXG4gICAgICAgIHRhZ3M6IHIudGFncyxcbiAgICAgICAgc291cmNlOiAnc3RvY2snLFxuICAgICAgICBzb3VyY2VJbmZvOiByLnNvdXJjZUluZm8sXG4gICAgICB9KTtcbiAgICAgIGNyZWF0ZWQucHVzaChpdGVtKTtcbiAgICB9XG4gICAgcmV0dXJuIGNyZWF0ZWQ7XG4gIH1cblxuICBhc3luYyBpbXBvcnRQbGFjZWhvbGRlcihwYXJhbXM6IHsgY2F0ZWdvcnk6IHN0cmluZzsgY291bnQ/OiBudW1iZXIgfSkge1xuICAgIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCB0aGlzLnBsYWNlaG9sZGVyLmdlbmVyYXRlKHBhcmFtcyk7XG4gICAgY29uc3QgY3JlYXRlZCA9IFtdIGFzIGFueVtdO1xuICAgIGZvciAoY29uc3QgciBvZiByZXN1bHRzKSB7XG4gICAgICBjb25zdCBpZCA9IHV1aWR2NCgpO1xuICAgICAgY29uc3QgaXRlbSA9IGF3YWl0IHRoaXMuaW1hZ2VzLmNyZWF0ZUZyb21Vcmwoe1xuICAgICAgICBpbWFnZUlkOiBpZCxcbiAgICAgICAgdXJsOiByLnVybCxcbiAgICAgICAgdGh1bWJuYWlsVXJsOiByLnRodW1ibmFpbFVybCxcbiAgICAgICAgYWx0VGV4dDogci5hbHRUZXh0LFxuICAgICAgICBjYXRlZ29yeTogci5jYXRlZ29yeSxcbiAgICAgICAgdGFnczogci50YWdzLFxuICAgICAgICBzb3VyY2U6ICdzdG9jaycsXG4gICAgICAgIHNvdXJjZUluZm86IHIuc291cmNlSW5mbyxcbiAgICAgIH0pO1xuICAgICAgY3JlYXRlZC5wdXNoKGl0ZW0pO1xuICAgIH1cbiAgICByZXR1cm4gY3JlYXRlZDtcbiAgfVxuXG4gIGFzeW5jIHZhbGlkYXRlSW1hZ2VDb250ZW50KGltYWdlOiB7IHVybDogc3RyaW5nOyBhbHRUZXh0OiBzdHJpbmc7IGNhdGVnb3J5OiBzdHJpbmcgfSkge1xuICAgIGNvbnN0IGlucHV0ID0ge1xuICAgICAgY29udGVudDogaW1hZ2UuYWx0VGV4dCxcbiAgICAgIGNvbnRlbnRUeXBlOiAnaW1hZ2VfZGVzY3JpcHRpb24nLFxuICAgICAgY3VsdHVyYWxDb250ZXh0OiB7XG4gICAgICAgIHByaW1hcnlDdWx0dXJlOiAnQWZyaWNhbiBBbWVyaWNhbicsXG4gICAgICAgIHNlY29uZGFyeUN1bHR1cmVzOiBbXSxcbiAgICAgICAgcmVnaW9uOiAnVVMnLFxuICAgICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgICAgcmVsaWdpb3VzQ29uc2lkZXJhdGlvbnM6IFtdLFxuICAgICAgICBzZW5zaXRpdmVUb3BpY3M6IFsnaGVhbHRoJywgJ2JvZHlfaW1hZ2UnXSxcbiAgICAgIH0sXG4gICAgICB0YXJnZXRBdWRpZW5jZToge1xuICAgICAgICBhZ2VSYW5nZTogeyBtaW46IDE4LCBtYXg6IDgwIH0sXG4gICAgICAgIGRpYWdub3Npc1N0YWdlOiAnbWFuYWdpbmdfd2VsbCcsXG4gICAgICAgIHN1cHBvcnROZWVkczogWydlbW90aW9uYWxfc3VwcG9ydCcsICdoZWFsdGhfZWR1Y2F0aW9uJ10sXG4gICAgICB9LFxuICAgIH0gYXMgYW55O1xuXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgICBjb25zdCBleGVjUmVnaW9uID0gKGdsb2JhbFRoaXMgYXMgYW55KS5wcm9jZXNzPy5lbnY/LkFXU19SRUdJT04gfHwgJ3VzLWVhc3QtMSc7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5jdWx0dXJhbEFnZW50LmV4ZWN1dGUoaW5wdXQsIHsgcmVnaW9uOiBleGVjUmVnaW9uIH0gYXMgYW55KTtcbiAgICBpZiAocmVzdWx0LnJlc3BvbnNlLnN1Y2Nlc3MgJiYgcmVzdWx0LnJlc3BvbnNlLmRhdGEpIHtcbiAgICAgIGNvbnN0IHNjb3JlcyA9IHJlc3VsdC5yZXNwb25zZS5kYXRhIGFzIGFueTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGN1bHR1cmFsOiBzY29yZXMuY3VsdHVyYWxSZWxldmFuY2VTY29yZSxcbiAgICAgICAgc2Vuc2l0aXZpdHk6IHNjb3Jlcy5zZW5zaXRpdml0eVNjb3JlLFxuICAgICAgICBpbmNsdXNpdml0eTogc2NvcmVzLmluY2x1c2l2aXR5U2NvcmUsXG4gICAgICAgIGlzc3VlczogKHNjb3Jlcy5pc3N1ZXMgfHwgW10pLm1hcCgoaTogYW55KSA9PiBgJHtpLnR5cGV9OiR7aS5zZXZlcml0eX1gKSxcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiB7IGN1bHR1cmFsOiAwLCBzZW5zaXRpdml0eTogMCwgaW5jbHVzaXZpdHk6IDAsIGlzc3VlczogWyd2YWxpZGF0aW9uX2ZhaWxlZCddIH07XG4gIH1cblxuICBhc3luYyBnZW5lcmF0ZUNhcmVNb2RlbChpbnB1dDoge1xuICAgIHVzZXJJZDogc3RyaW5nO1xuICAgIGFnZTogbnVtYmVyO1xuICAgIGRpYWdub3Npc1N0YWdlOiBzdHJpbmc7XG4gICAgc3VwcG9ydE5lZWRzOiBzdHJpbmdbXTtcbiAgICBjdWx0dXJhbENvbnRleHQ6IHtcbiAgICAgIHByaW1hcnlDdWx0dXJlOiBzdHJpbmc7XG4gICAgICBzZWNvbmRhcnlDdWx0dXJlcz86IHN0cmluZ1tdO1xuICAgICAgcmVnaW9uPzogc3RyaW5nO1xuICAgICAgbGFuZ3VhZ2U/OiBzdHJpbmc7XG4gICAgICByZWxpZ2lvdXNDb25zaWRlcmF0aW9ucz86IHN0cmluZ1tdO1xuICAgICAgc2Vuc2l0aXZlVG9waWNzPzogc3RyaW5nW107XG4gICAgfTtcbiAgICBoaXN0b3J5PzogYW55W107XG4gIH0sIG9wdGlvbnM/OiB7IGJ5cGFzc0NhY2hlPzogYm9vbGVhbiB9KTogUHJvbWlzZTx7IHJlY29tbWVuZGF0aW9uOiBDYXJlUmVjb21tZW5kYXRpb247IGNhY2hlZDogYm9vbGVhbjsgY2FjaGVTdGF0czogYW55IH0+e1xuICAgIGNvbnN0IGtleSA9IFtcbiAgICAgIGlucHV0LnVzZXJJZCxcbiAgICAgIGlucHV0LmFnZSxcbiAgICAgIGlucHV0LmRpYWdub3Npc1N0YWdlLFxuICAgICAgLi4uKGlucHV0LnN1cHBvcnROZWVkcyB8fCBbXSksXG4gICAgICBpbnB1dC5jdWx0dXJhbENvbnRleHQucHJpbWFyeUN1bHR1cmUsXG4gICAgICBpbnB1dC5jdWx0dXJhbENvbnRleHQucmVnaW9uIHx8ICdVUycsXG4gICAgICBpbnB1dC5jdWx0dXJhbENvbnRleHQubGFuZ3VhZ2UgfHwgJ2VuJyxcbiAgICBdO1xuICAgIGF3YWl0IHRoaXMua2NhY2hlLmNvbm5lY3QoKTtcbiAgICBjb25zdCBwcm9kdWNlciA9IGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IHJlYyA9IGF3YWl0IHRoaXMuZHNweS5yZWNvbW1lbmRDYXJlKHtcbiAgICAgICAgdXNlcklkOiBpbnB1dC51c2VySWQsXG4gICAgICAgIGFnZTogaW5wdXQuYWdlLFxuICAgICAgICBkaWFnbm9zaXNTdGFnZTogaW5wdXQuZGlhZ25vc2lzU3RhZ2UsXG4gICAgICAgIHN1cHBvcnROZWVkczogaW5wdXQuc3VwcG9ydE5lZWRzIHx8IFtdLFxuICAgICAgICBjdWx0dXJhbENvbnRleHQ6IHtcbiAgICAgICAgICBwcmltYXJ5Q3VsdHVyZTogaW5wdXQuY3VsdHVyYWxDb250ZXh0LnByaW1hcnlDdWx0dXJlLFxuICAgICAgICAgIHNlY29uZGFyeUN1bHR1cmVzOiBpbnB1dC5jdWx0dXJhbENvbnRleHQuc2Vjb25kYXJ5Q3VsdHVyZXMgfHwgW10sXG4gICAgICAgICAgcmVnaW9uOiBpbnB1dC5jdWx0dXJhbENvbnRleHQucmVnaW9uIHx8ICdVUycsXG4gICAgICAgICAgbGFuZ3VhZ2U6IGlucHV0LmN1bHR1cmFsQ29udGV4dC5sYW5ndWFnZSB8fCAnZW4nLFxuICAgICAgICAgIHJlbGlnaW91c0NvbnNpZGVyYXRpb25zOiBpbnB1dC5jdWx0dXJhbENvbnRleHQucmVsaWdpb3VzQ29uc2lkZXJhdGlvbnMgfHwgW10sXG4gICAgICAgICAgc2Vuc2l0aXZlVG9waWNzOiBpbnB1dC5jdWx0dXJhbENvbnRleHQuc2Vuc2l0aXZlVG9waWNzIHx8IFtdLFxuICAgICAgICB9LFxuICAgICAgICBoaXN0b3J5OiBpbnB1dC5oaXN0b3J5IHx8IFtdLFxuICAgICAgfSk7XG4gICAgICByZXR1cm4gcmVjO1xuICAgIH07XG5cbiAgICBsZXQgcmVzdWx0OiB7IGRhdGE6IENhcmVSZWNvbW1lbmRhdGlvbjsgY2FjaGVkOiBib29sZWFuIH07XG4gICAgaWYgKG9wdGlvbnM/LmJ5cGFzc0NhY2hlKSB7XG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgcHJvZHVjZXIoKTtcbiAgICAgIHJlc3VsdCA9IHsgZGF0YSwgY2FjaGVkOiBmYWxzZSB9O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQgPSBhd2FpdCB0aGlzLmtjYWNoZS53aXRoQ2FjaGUoa2V5LCBwcm9kdWNlciwgMzAwKTtcbiAgICB9XG5cbiAgICByZXR1cm4geyByZWNvbW1lbmRhdGlvbjogcmVzdWx0LmRhdGEsIGNhY2hlZDogcmVzdWx0LmNhY2hlZCwgY2FjaGVTdGF0czogdGhpcy5rY2FjaGUuZ2V0U3RhdHMoKSB9O1xuICB9XG5cbiAgYXN5bmMgbGlzdFBlbmRpbmcobGltaXQgPSAyMCkge1xuICAgIHJldHVybiB0aGlzLmltYWdlcy5saXN0UGVuZGluZyhsaW1pdCk7XG4gIH1cblxuICBhc3luYyBzZWxlY3RCeUNvbnRleHQoY29udGV4dDogc3RyaW5nLCBsaW1pdCA9IDEpIHtcbiAgICByZXR1cm4gdGhpcy5pbWFnZXMuc2VsZWN0QnlDYXRlZ29yeShjb250ZXh0LCBsaW1pdCk7XG4gIH1cbn1cblxuIl19