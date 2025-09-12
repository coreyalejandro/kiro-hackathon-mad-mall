"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Automatic1111Provider = void 0;
const cross_fetch_1 = __importDefault(require("cross-fetch"));
class Automatic1111Provider {
    constructor(baseUrl) {
        this.baseUrl = baseUrl || process.env.A1111_BASE_URL || 'http://localhost:7860';
    }
    async generate(params) {
        const url = `${this.baseUrl}/sdapi/v1/txt2img`;
        const body = {
            prompt: params.prompt,
            negative_prompt: params.negativePrompt,
            steps: params.steps ?? 20,
            cfg_scale: params.cfgScale ?? 7,
            sampler_name: params.sampler ?? 'Euler a',
            width: params.width ?? 768,
            height: params.height ?? 512,
        };
        try {
            const res = await (0, cross_fetch_1.default)(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!res.ok)
                return [];
            const json = await res.json();
            const images = json.images || [];
            return images.map(i => ({ imageBase64: i, meta: json.parameters }));
        }
        catch {
            return [];
        }
    }
}
exports.Automatic1111Provider = Automatic1111Provider;
//# sourceMappingURL=automatic1111-provider.js.map