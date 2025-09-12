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
//# sourceMappingURL=pexels-provider.js.map