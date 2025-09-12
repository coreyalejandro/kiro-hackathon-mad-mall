"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaceholderProvider = void 0;
class PlaceholderProvider {
    async generate(params) {
        const n = params.count ?? 3;
        return Array.from({ length: n }).map((_, idx) => ({
            url: `https://picsum.photos/seed/${encodeURIComponent(params.category)}-${idx}/1200/800`,
            altText: `${params.category} placeholder`,
            category: params.category,
            source: 'stock',
            sourceInfo: { provider: 'placeholder' },
            tags: [params.category],
            thumbnailUrl: `https://picsum.photos/seed/${encodeURIComponent(params.category)}-${idx}/600/400`,
        }));
    }
}
exports.PlaceholderProvider = PlaceholderProvider;
//# sourceMappingURL=placeholder-provider.js.map