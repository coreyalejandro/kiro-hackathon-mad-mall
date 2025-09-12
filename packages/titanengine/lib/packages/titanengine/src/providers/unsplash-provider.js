"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnsplashProvider = void 0;
const cross_fetch_1 = __importDefault(require("cross-fetch"));
class UnsplashProvider {
    constructor(accessKey) {
        this.accessKey = accessKey || process.env.UNSPLASH_ACCESS_KEY;
    }
    async search(params) {
        if (!this.accessKey) {
            return [];
        }
        const perPage = Math.min(params.count || 10, 30);
        const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(params.query)}&per_page=${perPage}&client_id=${this.accessKey}`;
        const res = await (0, cross_fetch_1.default)(url);
        if (!res.ok) {
            return [];
        }
        const json = await res.json();
        const results = Array.isArray(json.results) ? json.results : [];
        return results.map((p) => ({
            url: p.urls?.raw || p.urls?.full || p.links?.html,
            thumbnailUrl: p.urls?.small || p.urls?.thumb,
            altText: p.alt_description || params.query,
            category: params.category,
            source: 'stock',
            sourceInfo: {
                provider: 'Unsplash',
                user: p.user?.username,
                name: p.user?.name,
                id: p.id,
            },
            tags: [params.query, params.category].filter(Boolean),
        }));
    }
}
exports.UnsplashProvider = UnsplashProvider;
//# sourceMappingURL=unsplash-provider.js.map