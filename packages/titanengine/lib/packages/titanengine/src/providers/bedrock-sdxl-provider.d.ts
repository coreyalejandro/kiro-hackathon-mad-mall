export interface BedrockSDXLParams {
    prompt: string;
    steps?: number;
    cfgScale?: number;
    width?: number;
    height?: number;
    count?: number;
}
export interface GeneratedImage {
    imageBase64: string;
}
export declare class BedrockSDXLProvider {
    private readonly client;
    private readonly modelId;
    constructor(region?: string, modelId?: string);
    generate(params: BedrockSDXLParams): Promise<GeneratedImage[]>;
}
