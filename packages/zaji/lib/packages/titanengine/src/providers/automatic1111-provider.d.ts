export interface A1111Params {
    prompt: string;
    negativePrompt?: string;
    steps?: number;
    cfgScale?: number;
    sampler?: string;
    width?: number;
    height?: number;
}
export interface GeneratedImage {
    imageBase64?: string;
    url?: string;
    meta?: Record<string, any>;
}
export declare class Automatic1111Provider {
    private baseUrl;
    constructor(baseUrl?: string);
    generate(params: A1111Params): Promise<GeneratedImage[]>;
}
