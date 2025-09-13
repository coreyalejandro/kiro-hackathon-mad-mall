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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0b21hdGljMTExMS1wcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9wcm92aWRlcnMvYXV0b21hdGljMTExMS1wcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSw4REFBZ0M7QUFrQmhDLE1BQWEscUJBQXFCO0lBR2hDLFlBQVksT0FBZ0I7UUFDMUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLElBQUksdUJBQXVCLENBQUM7SUFDbEYsQ0FBQztJQUVELEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBbUI7UUFDaEMsTUFBTSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxtQkFBbUIsQ0FBQztRQUMvQyxNQUFNLElBQUksR0FBRztZQUNYLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTTtZQUNyQixlQUFlLEVBQUUsTUFBTSxDQUFDLGNBQWM7WUFDdEMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxLQUFLLElBQUksRUFBRTtZQUN6QixTQUFTLEVBQUUsTUFBTSxDQUFDLFFBQVEsSUFBSSxDQUFDO1lBQy9CLFlBQVksRUFBRSxNQUFNLENBQUMsT0FBTyxJQUFJLFNBQVM7WUFDekMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxLQUFLLElBQUksR0FBRztZQUMxQixNQUFNLEVBQUUsTUFBTSxDQUFDLE1BQU0sSUFBSSxHQUFHO1NBQzdCLENBQUM7UUFFRixJQUFJLENBQUM7WUFDSCxNQUFNLEdBQUcsR0FBRyxNQUFNLElBQUEscUJBQUssRUFBQyxHQUFHLEVBQUU7Z0JBQzNCLE1BQU0sRUFBRSxNQUFNO2dCQUNkLE9BQU8sRUFBRSxFQUFFLGNBQWMsRUFBRSxrQkFBa0IsRUFBRTtnQkFDL0MsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDO2FBQzNCLENBQUMsQ0FBQztZQUNILElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFBRSxPQUFPLEVBQUUsQ0FBQztZQUN2QixNQUFNLElBQUksR0FBRyxNQUFNLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUM5QixNQUFNLE1BQU0sR0FBYSxJQUFJLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQztZQUMzQyxPQUFPLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsV0FBVyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN0RSxDQUFDO1FBQUMsTUFBTSxDQUFDO1lBQ1AsT0FBTyxFQUFFLENBQUM7UUFDWixDQUFDO0lBQ0gsQ0FBQztDQUNGO0FBakNELHNEQWlDQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBmZXRjaCBmcm9tICdjcm9zcy1mZXRjaCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQTExMTFQYXJhbXMge1xuICBwcm9tcHQ6IHN0cmluZztcbiAgbmVnYXRpdmVQcm9tcHQ/OiBzdHJpbmc7XG4gIHN0ZXBzPzogbnVtYmVyO1xuICBjZmdTY2FsZT86IG51bWJlcjtcbiAgc2FtcGxlcj86IHN0cmluZztcbiAgd2lkdGg/OiBudW1iZXI7XG4gIGhlaWdodD86IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBHZW5lcmF0ZWRJbWFnZSB7XG4gIGltYWdlQmFzZTY0Pzogc3RyaW5nO1xuICB1cmw/OiBzdHJpbmc7XG4gIG1ldGE/OiBSZWNvcmQ8c3RyaW5nLCBhbnk+O1xufVxuXG5leHBvcnQgY2xhc3MgQXV0b21hdGljMTExMVByb3ZpZGVyIHtcbiAgcHJpdmF0ZSBiYXNlVXJsOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IoYmFzZVVybD86IHN0cmluZykge1xuICAgIHRoaXMuYmFzZVVybCA9IGJhc2VVcmwgfHwgcHJvY2Vzcy5lbnYuQTExMTFfQkFTRV9VUkwgfHwgJ2h0dHA6Ly9sb2NhbGhvc3Q6Nzg2MCc7XG4gIH1cblxuICBhc3luYyBnZW5lcmF0ZShwYXJhbXM6IEExMTExUGFyYW1zKTogUHJvbWlzZTxHZW5lcmF0ZWRJbWFnZVtdPiB7XG4gICAgY29uc3QgdXJsID0gYCR7dGhpcy5iYXNlVXJsfS9zZGFwaS92MS90eHQyaW1nYDtcbiAgICBjb25zdCBib2R5ID0ge1xuICAgICAgcHJvbXB0OiBwYXJhbXMucHJvbXB0LFxuICAgICAgbmVnYXRpdmVfcHJvbXB0OiBwYXJhbXMubmVnYXRpdmVQcm9tcHQsXG4gICAgICBzdGVwczogcGFyYW1zLnN0ZXBzID8/IDIwLFxuICAgICAgY2ZnX3NjYWxlOiBwYXJhbXMuY2ZnU2NhbGUgPz8gNyxcbiAgICAgIHNhbXBsZXJfbmFtZTogcGFyYW1zLnNhbXBsZXIgPz8gJ0V1bGVyIGEnLFxuICAgICAgd2lkdGg6IHBhcmFtcy53aWR0aCA/PyA3NjgsXG4gICAgICBoZWlnaHQ6IHBhcmFtcy5oZWlnaHQgPz8gNTEyLFxuICAgIH07XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2godXJsLCB7XG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoYm9keSksXG4gICAgICB9KTtcbiAgICAgIGlmICghcmVzLm9rKSByZXR1cm4gW107XG4gICAgICBjb25zdCBqc29uID0gYXdhaXQgcmVzLmpzb24oKTtcbiAgICAgIGNvbnN0IGltYWdlczogc3RyaW5nW10gPSBqc29uLmltYWdlcyB8fCBbXTtcbiAgICAgIHJldHVybiBpbWFnZXMubWFwKGkgPT4gKHsgaW1hZ2VCYXNlNjQ6IGksIG1ldGE6IGpzb24ucGFyYW1ldGVycyB9KSk7XG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICB9XG59XG5cbiJdfQ==