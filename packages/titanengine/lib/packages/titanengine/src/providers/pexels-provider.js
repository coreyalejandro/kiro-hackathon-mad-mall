"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PexelsProvider = void 0;
const cross_fetch_1 = __importDefault(require("cross-fetch"));
class PexelsProvider {
    constructor(apiKey) {
        this.apiKey = apiKey || process.env.PEXELS_API_KEY;
    }
    async search(params) {
        if (!this.apiKey) {
            return [];
        }
        const perPage = Math.min(params.count || 10, 80);
        const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(params.query)}&per_page=${perPage}`;
        const res = await (0, cross_fetch_1.default)(url, {
            headers: {
                Authorization: this.apiKey,
            },
        });
        if (!res.ok) {
            return [];
        }
        const json = await res.json();
        const photos = Array.isArray(json.photos) ? json.photos : [];
        return photos.map((p) => ({
            url: p.src?.original || p.url,
            thumbnailUrl: p.src?.medium || p.src?.small,
            altText: p.alt || params.query,
            category: params.category,
            source: 'stock',
            sourceInfo: {
                provider: 'Pexels',
                photographer: p.photographer,
                photographer_url: p.photographer_url,
                id: p.id,
            },
            tags: [params.query, params.category].filter(Boolean),
        }));
    }
}
exports.PexelsProvider = PexelsProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGV4ZWxzLXByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3Byb3ZpZGVycy9wZXhlbHMtcHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsOERBQWdDO0FBa0JoQyxNQUFhLGNBQWM7SUFHekIsWUFBWSxNQUFlO1FBQ3pCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDO0lBQ3JELENBQUM7SUFFRCxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQTBCO1FBQ3JDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDakIsT0FBTyxFQUFFLENBQUM7UUFDWixDQUFDO1FBRUQsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNqRCxNQUFNLEdBQUcsR0FBRywwQ0FBMEMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxhQUFhLE9BQU8sRUFBRSxDQUFDO1FBRTdHLE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBQSxxQkFBSyxFQUFDLEdBQUcsRUFBRTtZQUMzQixPQUFPLEVBQUU7Z0JBQ1AsYUFBYSxFQUFFLElBQUksQ0FBQyxNQUFNO2FBQzNCO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUNaLE9BQU8sRUFBRSxDQUFDO1FBQ1osQ0FBQztRQUVELE1BQU0sSUFBSSxHQUFHLE1BQU0sR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzlCLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFFN0QsT0FBTyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzdCLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLFFBQVEsSUFBSSxDQUFDLENBQUMsR0FBRztZQUM3QixZQUFZLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxNQUFNLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxLQUFLO1lBQzNDLE9BQU8sRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxLQUFLO1lBQzlCLFFBQVEsRUFBRSxNQUFNLENBQUMsUUFBUTtZQUN6QixNQUFNLEVBQUUsT0FBTztZQUNmLFVBQVUsRUFBRTtnQkFDVixRQUFRLEVBQUUsUUFBUTtnQkFDbEIsWUFBWSxFQUFFLENBQUMsQ0FBQyxZQUFZO2dCQUM1QixnQkFBZ0IsRUFBRSxDQUFDLENBQUMsZ0JBQWdCO2dCQUNwQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUU7YUFDVDtZQUNELElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUM7U0FDdEQsQ0FBQyxDQUFDLENBQUM7SUFDTixDQUFDO0NBQ0Y7QUEzQ0Qsd0NBMkNDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGZldGNoIGZyb20gJ2Nyb3NzLWZldGNoJztcblxuZXhwb3J0IGludGVyZmFjZSBQZXhlbHNJbXBvcnRQYXJhbXMge1xuICBxdWVyeTogc3RyaW5nO1xuICBjYXRlZ29yeTogc3RyaW5nO1xuICBjb3VudD86IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJbXBvcnRlZEltYWdlIHtcbiAgdXJsOiBzdHJpbmc7XG4gIGFsdFRleHQ6IHN0cmluZztcbiAgY2F0ZWdvcnk6IHN0cmluZztcbiAgc291cmNlOiBzdHJpbmc7XG4gIHNvdXJjZUluZm8/OiBSZWNvcmQ8c3RyaW5nLCBhbnk+O1xuICB0YWdzPzogc3RyaW5nW107XG4gIHRodW1ibmFpbFVybD86IHN0cmluZztcbn1cblxuZXhwb3J0IGNsYXNzIFBleGVsc1Byb3ZpZGVyIHtcbiAgcHJpdmF0ZSBhcGlLZXk6IHN0cmluZyB8IHVuZGVmaW5lZDtcblxuICBjb25zdHJ1Y3RvcihhcGlLZXk/OiBzdHJpbmcpIHtcbiAgICB0aGlzLmFwaUtleSA9IGFwaUtleSB8fCBwcm9jZXNzLmVudi5QRVhFTFNfQVBJX0tFWTtcbiAgfVxuXG4gIGFzeW5jIHNlYXJjaChwYXJhbXM6IFBleGVsc0ltcG9ydFBhcmFtcyk6IFByb21pc2U8SW1wb3J0ZWRJbWFnZVtdPiB7XG4gICAgaWYgKCF0aGlzLmFwaUtleSkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIGNvbnN0IHBlclBhZ2UgPSBNYXRoLm1pbihwYXJhbXMuY291bnQgfHwgMTAsIDgwKTtcbiAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly9hcGkucGV4ZWxzLmNvbS92MS9zZWFyY2g/cXVlcnk9JHtlbmNvZGVVUklDb21wb25lbnQocGFyYW1zLnF1ZXJ5KX0mcGVyX3BhZ2U9JHtwZXJQYWdlfWA7XG5cbiAgICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaCh1cmwsIHtcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgQXV0aG9yaXphdGlvbjogdGhpcy5hcGlLZXksXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgaWYgKCFyZXMub2spIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBjb25zdCBqc29uID0gYXdhaXQgcmVzLmpzb24oKTtcbiAgICBjb25zdCBwaG90b3MgPSBBcnJheS5pc0FycmF5KGpzb24ucGhvdG9zKSA/IGpzb24ucGhvdG9zIDogW107XG5cbiAgICByZXR1cm4gcGhvdG9zLm1hcCgocDogYW55KSA9PiAoe1xuICAgICAgdXJsOiBwLnNyYz8ub3JpZ2luYWwgfHwgcC51cmwsXG4gICAgICB0aHVtYm5haWxVcmw6IHAuc3JjPy5tZWRpdW0gfHwgcC5zcmM/LnNtYWxsLFxuICAgICAgYWx0VGV4dDogcC5hbHQgfHwgcGFyYW1zLnF1ZXJ5LFxuICAgICAgY2F0ZWdvcnk6IHBhcmFtcy5jYXRlZ29yeSxcbiAgICAgIHNvdXJjZTogJ3N0b2NrJyxcbiAgICAgIHNvdXJjZUluZm86IHtcbiAgICAgICAgcHJvdmlkZXI6ICdQZXhlbHMnLFxuICAgICAgICBwaG90b2dyYXBoZXI6IHAucGhvdG9ncmFwaGVyLFxuICAgICAgICBwaG90b2dyYXBoZXJfdXJsOiBwLnBob3RvZ3JhcGhlcl91cmwsXG4gICAgICAgIGlkOiBwLmlkLFxuICAgICAgfSxcbiAgICAgIHRhZ3M6IFtwYXJhbXMucXVlcnksIHBhcmFtcy5jYXRlZ29yeV0uZmlsdGVyKEJvb2xlYW4pLFxuICAgIH0pKTtcbiAgfVxufVxuXG4iXX0=