"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TitanEngine = void 0;
const uuid_1 = require("uuid");
const services_1 = require("./services"); // Adjust your import paths as necessary
class TitanEngine {
    constructor(config) {
        const env = globalThis?.process?.env || {};
        const region = config.region || env.AWS_REGION || 'us-east-1';
        // Initialize the DynamoDB Service
        this.dynamo = this.initializeDynamoDBService(config, env);
        // Initialize other services
        this.images = new services_1.ImageAssetRepository(this.dynamo);
        this.pexels = new services_1.PexelsProvider();
        this.unsplash = new services_1.UnsplashProvider();
        this.placeholder = new services_1.PlaceholderProvider();
        this.a1111 = new services_1.Automatic1111Provider();
        this.bedrock = new services_1.BedrockSDXLProvider();
        this.culturalAgent = new services_1.CulturalValidationAgent(region);
        this.dspy = new services_1.DspyBridge();
        // Initialize caches
        this.kcache = new services_1.TitanKCache({
            namespace: 'titan-care',
            ttlSeconds: 300,
        });
        this.eventCache = new services_1.TitanKCache({
            namespace: 'titan-events',
            ttlSeconds: 300,
        });
        this.analytics = new services_1.TitanAnalyticsProcessor(this.eventCache);
        console.log('Titan Engine initialized successfully.');
    }
    initializeDynamoDBService(config, env) {
        return new services_1.DynamoDBService({
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
        const { response } = await this.culturalAgent.execute({
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
        }, {});
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
                        source: 'placeholder',
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGl0YW5lbmdpbmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvc2VydmljZS90aXRhbmVuZ2luZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwrQkFBb0M7QUFDcEMseUNBY29CLENBQUMsd0NBQXdDO0FBUTdELE1BQWEsV0FBVztJQWN0QixZQUFZLE1BQXlCO1FBQ25DLE1BQU0sR0FBRyxHQUFHLFVBQVUsRUFBRSxPQUFPLEVBQUUsR0FBRyxJQUFJLEVBQUUsQ0FBQztRQUMzQyxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxJQUFJLEdBQUcsQ0FBQyxVQUFVLElBQUksV0FBVyxDQUFDO1FBRTlELGtDQUFrQztRQUNsQyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFFMUQsNEJBQTRCO1FBQzVCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSwrQkFBb0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDcEQsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLHlCQUFjLEVBQUUsQ0FBQztRQUNuQyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksMkJBQWdCLEVBQUUsQ0FBQztRQUN2QyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksOEJBQW1CLEVBQUUsQ0FBQztRQUM3QyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksZ0NBQXFCLEVBQUUsQ0FBQztRQUN6QyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksOEJBQW1CLEVBQUUsQ0FBQztRQUN6QyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksa0NBQXVCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDekQsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLHFCQUFVLEVBQUUsQ0FBQztRQUU3QixvQkFBb0I7UUFDcEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLHNCQUFXLENB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LEVBQUUsSUFBQSxTQUFNLEdBQUU7b0JBQ2pCLEdBQUcsRUFBRSxXQUFXLENBQUMsR0FBRztvQkFDcEIsWUFBWSxFQUFFLFdBQVcsQ0FBQyxZQUFZO29CQUN0QyxPQUFPLEVBQUUsV0FBVyxDQUFDLE9BQU87b0JBQzVCLFFBQVEsRUFBRSxHQUFHLENBQUMsUUFBUTtvQkFDdEIsSUFBSSxFQUFFLFdBQVcsQ0FBQyxJQUFJO29CQUN0QixNQUFNLEVBQUUsYUFBYTtvQkFDckIsVUFBVSxFQUFFLFdBQVcsQ0FBQyxVQUFVO2lCQUNuQyxDQUFDLENBQUM7WUFDTCxDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7Q0FDRjtBQWpQRCxrQ0FpUEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB2NCBhcyB1dWlkdjQgfSBmcm9tICd1dWlkJztcbmltcG9ydCB7XG4gIER5bmFtb0RCU2VydmljZSxcbiAgSW1hZ2VBc3NldFJlcG9zaXRvcnksXG4gIFBleGVsc1Byb3ZpZGVyLFxuICBVbnNwbGFzaFByb3ZpZGVyLFxuICBQbGFjZWhvbGRlclByb3ZpZGVyLFxuICBBdXRvbWF0aWMxMTExUHJvdmlkZXIsXG4gIEJlZHJvY2tTRFhMUHJvdmlkZXIsXG4gIEN1bHR1cmFsVmFsaWRhdGlvbkFnZW50LFxuICBEc3B5QnJpZGdlLFxuICBUaXRhbktDYWNoZSxcbiAgVGl0YW5BbmFseXRpY3NQcm9jZXNzb3IsXG4gIENhcmVSZWNvbW1lbmRhdGlvbixcbiAgVGl0YW5FdmVudCxcbn0gZnJvbSAnLi9zZXJ2aWNlcyc7IC8vIEFkanVzdCB5b3VyIGltcG9ydCBwYXRocyBhcyBuZWNlc3NhcnlcblxuaW50ZXJmYWNlIFRpdGFuRW5naW5lQ29uZmlnIHtcbiAgcmVnaW9uPzogc3RyaW5nO1xuICB0YWJsZU5hbWU/OiBzdHJpbmc7XG4gIGVuZHBvaW50Pzogc3RyaW5nO1xufVxuXG5leHBvcnQgY2xhc3MgVGl0YW5FbmdpbmUge1xuICBwcml2YXRlIGR5bmFtbzogRHluYW1vREJTZXJ2aWNlO1xuICBwcml2YXRlIGltYWdlczogSW1hZ2VBc3NldFJlcG9zaXRvcnk7XG4gIHByaXZhdGUgcGV4ZWxzOiBQZXhlbHNQcm92aWRlcjtcbiAgcHJpdmF0ZSB1bnNwbGFzaDogVW5zcGxhc2hQcm92aWRlcjtcbiAgcHJpdmF0ZSBwbGFjZWhvbGRlcjogUGxhY2Vob2xkZXJQcm92aWRlcjtcbiAgcHJpdmF0ZSBhMTExMTogQXV0b21hdGljMTExMVByb3ZpZGVyO1xuICBwcml2YXRlIGJlZHJvY2s6IEJlZHJvY2tTRFhMUHJvdmlkZXI7XG4gIHByaXZhdGUgY3VsdHVyYWxBZ2VudDogQ3VsdHVyYWxWYWxpZGF0aW9uQWdlbnQ7XG4gIHByaXZhdGUgZHNweTogRHNweUJyaWRnZTtcbiAgcHJpdmF0ZSBrY2FjaGU6IFRpdGFuS0NhY2hlPENhcmVSZWNvbW1lbmRhdGlvbj47XG4gIHByaXZhdGUgZXZlbnRDYWNoZTogVGl0YW5LQ2FjaGU8VGl0YW5FdmVudFtdPjtcbiAgcHJpdmF0ZSBhbmFseXRpY3M6IFRpdGFuQW5hbHl0aWNzUHJvY2Vzc29yO1xuXG4gIGNvbnN0cnVjdG9yKGNvbmZpZzogVGl0YW5FbmdpbmVDb25maWcpIHtcbiAgICBjb25zdCBlbnYgPSBnbG9iYWxUaGlzPy5wcm9jZXNzPy5lbnYgfHwge307XG4gICAgY29uc3QgcmVnaW9uID0gY29uZmlnLnJlZ2lvbiB8fCBlbnYuQVdTX1JFR0lPTiB8fCAndXMtZWFzdC0xJztcblxuICAgIC8vIEluaXRpYWxpemUgdGhlIER5bmFtb0RCIFNlcnZpY2VcbiAgICB0aGlzLmR5bmFtbyA9IHRoaXMuaW5pdGlhbGl6ZUR5bmFtb0RCU2VydmljZShjb25maWcsIGVudik7XG5cbiAgICAvLyBJbml0aWFsaXplIG90aGVyIHNlcnZpY2VzXG4gICAgdGhpcy5pbWFnZXMgPSBuZXcgSW1hZ2VBc3NldFJlcG9zaXRvcnkodGhpcy5keW5hbW8pO1xuICAgIHRoaXMucGV4ZWxzID0gbmV3IFBleGVsc1Byb3ZpZGVyKCk7XG4gICAgdGhpcy51bnNwbGFzaCA9IG5ldyBVbnNwbGFzaFByb3ZpZGVyKCk7XG4gICAgdGhpcy5wbGFjZWhvbGRlciA9IG5ldyBQbGFjZWhvbGRlclByb3ZpZGVyKCk7XG4gICAgdGhpcy5hMTExMSA9IG5ldyBBdXRvbWF0aWMxMTExUHJvdmlkZXIoKTtcbiAgICB0aGlzLmJlZHJvY2sgPSBuZXcgQmVkcm9ja1NEWExQcm92aWRlcigpO1xuICAgIHRoaXMuY3VsdHVyYWxBZ2VudCA9IG5ldyBDdWx0dXJhbFZhbGlkYXRpb25BZ2VudChyZWdpb24pO1xuICAgIHRoaXMuZHNweSA9IG5ldyBEc3B5QnJpZGdlKCk7XG5cbiAgICAvLyBJbml0aWFsaXplIGNhY2hlc1xuICAgIHRoaXMua2NhY2hlID0gbmV3IFRpdGFuS0NhY2hlPENhcmVSZWNvbW1lbmRhdGlvbj4oe1xuICAgICAgbmFtZXNwYWNlOiAndGl0YW4tY2FyZScsXG4gICAgICB0dGxTZWNvbmRzOiAzMDAsXG4gICAgfSk7XG5cbiAgICB0aGlzLmV2ZW50Q2FjaGUgPSBuZXcgVGl0YW5LQ2FjaGU8VGl0YW5FdmVudFtdPih7XG4gICAgICBuYW1lc3BhY2U6ICd0aXRhbi1ldmVudHMnLFxuICAgICAgdHRsU2Vjb25kczogMzAwLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hbmFseXRpY3MgPSBuZXcgVGl0YW5BbmFseXRpY3NQcm9jZXNzb3IodGhpcy5ldmVudENhY2hlKTtcblxuICAgIGNvbnNvbGUubG9nKCdUaXRhbiBFbmdpbmUgaW5pdGlhbGl6ZWQgc3VjY2Vzc2Z1bGx5LicpO1xuICB9XG5cbiAgcHJpdmF0ZSBpbml0aWFsaXplRHluYW1vREJTZXJ2aWNlKGNvbmZpZzogVGl0YW5FbmdpbmVDb25maWcsIGVudjogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiBEeW5hbW9EQlNlcnZpY2Uge1xuICAgIHJldHVybiBuZXcgRHluYW1vREJTZXJ2aWNlKHtcbiAgICAgIHJlZ2lvbjogY29uZmlnLnJlZ2lvbiB8fCBlbnYuQVdTX1JFR0lPTiB8fCAndXMtZWFzdC0xJyxcbiAgICAgIHRhYmxlTmFtZTogY29uZmlnLnRhYmxlTmFtZSB8fCBlbnYuRFlOQU1PX1RBQkxFIHx8ICdtYWRtYWxsLWRldmVsb3BtZW50LW1haW4nLFxuICAgICAgZW5kcG9pbnQ6IGVudi5EWU5BTU9EQl9FTkRQT0lOVCB8fCBjb25maWcuZW5kcG9pbnQsXG4gICAgICBtYXhSZXRyaWVzOiAzLFxuICAgICAgdGltZW91dDogMzAwMCxcbiAgICAgIGNvbm5lY3Rpb25Qb29sU2l6ZTogNTAsXG4gICAgICBlbmFibGVNZXRyaWNzOiB0cnVlLFxuICAgIH0pO1xuICB9XG5cbiAgc3RhdGljIGNyZWF0ZURlZmF1bHQoKSB7XG4gICAgcmV0dXJuIG5ldyBUaXRhbkVuZ2luZSh7fSk7XG4gIH1cblxuICBhc3luYyBpbXBvcnRGcm9tUGV4ZWxzKHBhcmFtczogeyBxdWVyeTogc3RyaW5nOyBjYXRlZ29yeTogc3RyaW5nOyBjb3VudD86IG51bWJlciB9KSB7XG4gICAgcmV0dXJuIHRoaXMuaW1wb3J0SW1hZ2VzKCdwZXhlbHMnLCBwYXJhbXMpO1xuICB9XG5cbiAgYXN5bmMgaW1wb3J0RnJvbVVuc3BsYXNoKHBhcmFtczogeyBxdWVyeTogc3RyaW5nOyBjYXRlZ29yeTogc3RyaW5nOyBjb3VudD86IG51bWJlciB9KSB7XG4gICAgcmV0dXJuIHRoaXMuaW1wb3J0SW1hZ2VzKCd1bnNwbGFzaCcsIHBhcmFtcyk7XG4gIH1cblxuICBhc3luYyBpbXBvcnRQbGFjZWhvbGRlcihwYXJhbXM6IHsgY2F0ZWdvcnk6IHN0cmluZzsgY291bnQ/OiBudW1iZXIgfSkge1xuICAgIHJldHVybiB0aGlzLmltcG9ydEltYWdlcygncGxhY2Vob2xkZXInLCBwYXJhbXMpO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBpbXBvcnRJbWFnZXMoc291cmNlOiAncGV4ZWxzJyB8ICd1bnNwbGFzaCcgfCAncGxhY2Vob2xkZXInLCBwYXJhbXM6IHsgcXVlcnk/OiBzdHJpbmc7IGNhdGVnb3J5OiBzdHJpbmc7IGNvdW50PzogbnVtYmVyIH0pIHtcbiAgICBsZXQgcmVzdWx0czogYW55W107XG4gICAgdHJ5IHtcbiAgICAgIGlmIChzb3VyY2UgPT09ICdwZXhlbHMnKSB7XG4gICAgICAgIHJlc3VsdHMgPSBhd2FpdCB0aGlzLnBleGVscy5zZWFyY2goe1xuICAgICAgICAgIHF1ZXJ5OiBwYXJhbXMucXVlcnksXG4gICAgICAgICAgY2F0ZWdvcnk6IHBhcmFtcy5jYXRlZ29yeSxcbiAgICAgICAgICBjb3VudDogcGFyYW1zLmNvdW50LFxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSBpZiAoc291cmNlID09PSAndW5zcGxhc2gnKSB7XG4gICAgICAgIHJlc3VsdHMgPSBhd2FpdCB0aGlzLnVuc3BsYXNoLnNlYXJjaCh7XG4gICAgICAgICAgcXVlcnk6IHBhcmFtcy5xdWVyeSxcbiAgICAgICAgICBjYXRlZ29yeTogcGFyYW1zLmNhdGVnb3J5LFxuICAgICAgICAgIGNvdW50OiBwYXJhbXMuY291bnQsXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0cyA9IGF3YWl0IHRoaXMucGxhY2Vob2xkZXIuZ2VuZXJhdGUoe1xuICAgICAgICAgIGNhdGVnb3J5OiBwYXJhbXMuY2F0ZWdvcnksXG4gICAgICAgICAgY291bnQ6IHBhcmFtcy5jb3VudCxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yIGZldGNoaW5nIGltYWdlcyBmcm9tICR7c291cmNlfTpgLCBlcnJvcik7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byBpbXBvcnQgaW1hZ2VzIGZyb20gJHtzb3VyY2V9YCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuY3JlYXRlSW1hZ2VzRnJvbVJlc3VsdHMocmVzdWx0cyk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGNyZWF0ZUltYWdlc0Zyb21SZXN1bHRzKHJlc3VsdHM6IGFueVtdKTogUHJvbWlzZTxhbnlbXT4ge1xuICAgIGNvbnN0IGNyZWF0ZWRJbWFnZXM6IFByb21pc2U8YW55PltdID0gcmVzdWx0cy5tYXAoYXN5bmMgKHIpID0+IHtcbiAgICAgIGNvbnN0IGlkID0gdXVpZHY0KCk7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5pbWFnZXMuY3JlYXRlRnJvbVVybCh7XG4gICAgICAgICAgaW1hZ2VJZDogaWQsXG4gICAgICAgICAgdXJsOiByLnVybCxcbiAgICAgICAgICB0aHVtYm5haWxVcmw6IHIudGh1bWJuYWlsVXJsLFxuICAgICAgICAgIGFsdFRleHQ6IHIuYWx0VGV4dCxcbiAgICAgICAgICBjYXRlZ29yeTogci5jYXRlZ29yeSxcbiAgICAgICAgICB0YWdzOiByLnRhZ3MsXG4gICAgICAgICAgc291cmNlOiAnc3RvY2snLFxuICAgICAgICAgIHNvdXJjZUluZm86IHIuc291cmNlSW5mbyxcbiAgICAgICAgfSk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgY3JlYXRpbmcgaW1hZ2UgZnJvbSBVUkw6XCIsIGVycm9yKTtcbiAgICAgICAgcmV0dXJuIG51bGw7IC8vIFNraXAgdGhpcyBpdGVtIG9uIGVycm9yXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBGaWx0ZXIgb3V0IGFueSBudWxsIGl0ZW1zIChmYWlsZWQgY3JlYXRpb25zKVxuICAgIGNvbnN0IHJlc3VsdHNBcnJheSA9IGF3YWl0IFByb21pc2UuYWxsKGNyZWF0ZWRJbWFnZXMpO1xuICAgIHJldHVybiByZXN1bHRzQXJyYXkuZmlsdGVyKEJvb2xlYW4pOyAvLyBSZXR1cm5zIGFuIGFycmF5IHdpdGggc3VjY2Vzc2Z1bCBjcmVhdGlvbnNcbiAgfVxuXG4gIGFzeW5jIHZhbGlkYXRlSW1hZ2VDb250ZW50KGltYWdlOiB7XG4gICAgdXJsOiBzdHJpbmc7XG4gICAgYWx0VGV4dDogc3RyaW5nO1xuICAgIGNhdGVnb3J5OiBzdHJpbmc7XG4gICAgaW1hZ2VJZD86IHN0cmluZztcbiAgfSkge1xuICAgIGNvbnN0IHsgcmVzcG9uc2UgfSA9IGF3YWl0IHRoaXMuY3VsdHVyYWxBZ2VudC5leGVjdXRlKFxuICAgICAge1xuICAgICAgICBjb250ZW50OiBpbWFnZS51cmwsXG4gICAgICAgIGNvbnRlbnRUeXBlOiAnaW1hZ2VfdXJsJyxcbiAgICAgICAgY3VsdHVyYWxDb250ZXh0OiB7XG4gICAgICAgICAgcHJpbWFyeUN1bHR1cmU6ICdhZnJpY2FuX2FtZXJpY2FuJyxcbiAgICAgICAgICBzZWNvbmRhcnlDdWx0dXJlczogW10sXG4gICAgICAgICAgcmVnaW9uOiAndXMnLFxuICAgICAgICAgIGxhbmd1YWdlOiAnZW4nLFxuICAgICAgICAgIHJlbGlnaW91c0NvbnNpZGVyYXRpb25zOiBbXSxcbiAgICAgICAgICBzZW5zaXRpdmVUb3BpY3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICB0YXJnZXRBdWRpZW5jZToge1xuICAgICAgICAgIGFnZVJhbmdlOiB7IG1pbjogMjAsIG1heDogNjAgfSxcbiAgICAgICAgICBkaWFnbm9zaXNTdGFnZTogJ2luX3RyZWF0bWVudCcsXG4gICAgICAgICAgc3VwcG9ydE5lZWRzOiBbJ2NvbW11bml0eSddLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIHt9XG4gICAgKTtcblxuICAgIGlmICghcmVzcG9uc2Uuc3VjY2VzcyB8fCAhcmVzcG9uc2UuZGF0YSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKHJlc3BvbnNlLmVycm9yIHx8ICdJbWFnZSB2YWxpZGF0aW9uIGZhaWxlZCcpO1xuICAgIH1cblxuICAgIGNvbnN0IGRhdGEgPSByZXNwb25zZS5kYXRhO1xuICAgIGNvbnN0IHNjb3JlcyA9IHtcbiAgICAgIGN1bHR1cmFsOiBkYXRhLmN1bHR1cmFsUmVsZXZhbmNlU2NvcmUsXG4gICAgICBzZW5zaXRpdml0eTogZGF0YS5zZW5zaXRpdml0eVNjb3JlLFxuICAgICAgaW5jbHVzaXZpdHk6IGRhdGEuaW5jbHVzaXZpdHlTY29yZSxcbiAgICAgIGlzc3VlczogZGF0YS5pc3N1ZXMubWFwKChpKSA9PiBpLmRlc2NyaXB0aW9uKSxcbiAgICAgIHZhbGlkYXRvcjogJ2N1bHR1cmFsLXZhbGlkYXRpb24tYWdlbnQnLFxuICAgIH07XG5cbiAgICBpZiAoaW1hZ2UuaW1hZ2VJZCkge1xuICAgICAgY29uc3Qgc3RhdHVzID0gZGF0YS5pc0FwcHJvcHJpYXRlID8gJ2FjdGl2ZScgOiAnZmxhZ2dlZCc7XG4gICAgICBhd2FpdCB0aGlzLmltYWdlcy5tYXJrVmFsaWRhdGVkKGltYWdlLmltYWdlSWQsIHNjb3Jlcywgc3RhdHVzKTtcbiAgICB9XG5cbiAgICByZXR1cm4geyAuLi5zY29yZXMsIGlzQXBwcm9wcmlhdGU6IGRhdGEuaXNBcHByb3ByaWF0ZSB9O1xuICB9XG5cbiAgYXN5bmMgcmVjb3JkRXZlbnQoZXZlbnQ6IFRpdGFuRXZlbnQpIHtcbiAgICBhd2FpdCB0aGlzLmFuYWx5dGljcy5yZWNvcmQoZXZlbnQpO1xuICB9XG5cbiAgYXN5bmMgZ2V0RXZlbnRzKHVzZXJJZDogc3RyaW5nKTogUHJvbWlzZTxUaXRhbkV2ZW50W10+IHtcbiAgICByZXR1cm4gdGhpcy5hbmFseXRpY3MuZ2V0RXZlbnRzKHVzZXJJZCk7XG4gIH1cblxuICBhc3luYyBhdWRpdEltYWdlQXNzZXRzKGxpbWl0ID0gMjApIHtcbiAgICBjb25zdCBwZW5kaW5nID0gYXdhaXQgdGhpcy5pbWFnZXMubGlzdFBlbmRpbmcobGltaXQpO1xuICAgIGZvciAoY29uc3QgaW1nIG9mIHBlbmRpbmcpIHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMudmFsaWRhdGVJbWFnZUNvbnRlbnQoaW1nIGFzIGFueSk7XG4gICAgICBpZiAoIXJlc3VsdC5pc0FwcHJvcHJpYXRlIHx8IHJlc3VsdC5jdWx0dXJhbCA8IDAuNykge1xuICAgICAgICBhd2FpdCB0aGlzLmltYWdlcy5tYXJrVmFsaWRhdGVkKGltZy5pbWFnZUlkLCByZXN1bHQsICdyZW1vdmVkJyk7XG4gICAgICAgIGNvbnN0IFtwbGFjZWhvbGRlcl0gPSBhd2FpdCB0aGlzLnBsYWNlaG9sZGVyLmdlbmVyYXRlKHtcbiAgICAgICAgICBjYXRlZ29yeTogaW1nLmNhdGVnb3J5LFxuICAgICAgICAgIGNvdW50OiAxLFxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHBsYWNlaG9sZGVyKSB7XG4gICAgICAgICAgYXdhaXQgdGhpcy5pbWFnZXMuY3JlYXRlRnJvbVVybCh7XG4gICAgICAgICAgICBpbWFnZUlkOiB1dWlkdjQoKSxcbiAgICAgICAgICAgIHVybDogcGxhY2Vob2xkZXIudXJsLFxuICAgICAgICAgICAgdGh1bWJuYWlsVXJsOiBwbGFjZWhvbGRlci50aHVtYm5haWxVcmwsXG4gICAgICAgICAgICBhbHRUZXh0OiBwbGFjZWhvbGRlci5hbHRUZXh0LFxuICAgICAgICAgICAgY2F0ZWdvcnk6IGltZy5jYXRlZ29yeSxcbiAgICAgICAgICAgIHRhZ3M6IHBsYWNlaG9sZGVyLnRhZ3MsXG4gICAgICAgICAgICBzb3VyY2U6ICdwbGFjZWhvbGRlcicsXG4gICAgICAgICAgICBzb3VyY2VJbmZvOiBwbGFjZWhvbGRlci5zb3VyY2VJbmZvLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgZmxhZ2dlZCA9IGF3YWl0IHRoaXMuaW1hZ2VzLmxpc3RGbGFnZ2VkKGxpbWl0KTtcbiAgICBmb3IgKGNvbnN0IGltZyBvZiBmbGFnZ2VkKSB7XG4gICAgICBjb25zdCBbcGxhY2Vob2xkZXJdID0gYXdhaXQgdGhpcy5wbGFjZWhvbGRlci5nZW5lcmF0ZSh7XG4gICAgICAgIGNhdGVnb3J5OiBpbWcuY2F0ZWdvcnksXG4gICAgICAgIGNvdW50OiAxLFxuICAgICAgfSk7XG4gICAgICBhd2FpdCB0aGlzLmltYWdlcy5tYXJrVmFsaWRhdGVkKFxuICAgICAgICBpbWcuaW1hZ2VJZCxcbiAgICAgICAge1xuICAgICAgICAgIGN1bHR1cmFsOiAwLFxuICAgICAgICAgIHNlbnNpdGl2aXR5OiAwLFxuICAgICAgICAgIGluY2x1c2l2aXR5OiAwLFxuICAgICAgICAgIGlzc3VlczogWydyZXBsYWNlZCB3aXRoIHBsYWNlaG9sZGVyJ10sXG4gICAgICAgICAgdmFsaWRhdG9yOiAnYXVkaXRJbWFnZUFzc2V0cycsXG4gICAgICAgIH0sXG4gICAgICAgICdyZW1vdmVkJ1xuICAgICAgKTtcbiAgICAgIGlmIChwbGFjZWhvbGRlcikge1xuICAgICAgICBhd2FpdCB0aGlzLmltYWdlcy5jcmVhdGVGcm9tVXJsKHtcbiAgICAgICAgICBpbWFnZUlkOiB1dWlkdjQoKSxcbiAgICAgICAgICB1cmw6IHBsYWNlaG9sZGVyLnVybCxcbiAgICAgICAgICB0aHVtYm5haWxVcmw6IHBsYWNlaG9sZGVyLnRodW1ibmFpbFVybCxcbiAgICAgICAgICBhbHRUZXh0OiBwbGFjZWhvbGRlci5hbHRUZXh0LFxuICAgICAgICAgIGNhdGVnb3J5OiBpbWcuY2F0ZWdvcnksXG4gICAgICAgICAgdGFnczogcGxhY2Vob2xkZXIudGFncyxcbiAgICAgICAgICBzb3VyY2U6ICdwbGFjZWhvbGRlcicsXG4gICAgICAgICAgc291cmNlSW5mbzogcGxhY2Vob2xkZXIuc291cmNlSW5mbyxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59Il19