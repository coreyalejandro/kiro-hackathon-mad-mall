"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postImportPexels = postImportPexels;
exports.postImportUnsplash = postImportUnsplash;
exports.getPending = getPending;
exports.postValidate = postValidate;
exports.getSelect = getSelect;
const titanengine_1 = require("../service/titanengine");
const engine = titanengine_1.TitanEngine.createDefault();
async function postImportPexels(body) {
    return engine.importFromPexels(body);
}
async function postImportUnsplash(body) {
    return engine.importFromUnsplash(body);
}
async function getPending() {
    return engine.listPending();
}
async function postValidate(body) {
    const pending = await engine.listPending(100);
    const found = pending.find(p => p.imageId === body.imageId);
    if (!found)
        return { error: 'not_found' };
    const scores = await engine.validateImageContent({ url: found.url, altText: found.altText, category: found.category });
    const status = scores.cultural > 0.6 && scores.sensitivity > 0.6 && scores.inclusivity > 0.6 ? 'active' : 'flagged';
    const updated = await engine.images.markValidated(found.imageId, scores, status);
    return updated;
}
async function getSelect(query) {
    const results = await engine.selectByContext(query.context, 1);
    return results[0] || null;
}
//# sourceMappingURL=http-handlers.js.map