import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

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

export class BedrockSDXLProvider {
  private readonly client: BedrockRuntimeClient;
  private readonly modelId: string;

  constructor(region?: string, modelId?: string) {
    const r = region || process.env.AWS_REGION || 'us-east-1';
    this.client = new BedrockRuntimeClient({ region: r });
    this.modelId = modelId || process.env.BEDROCK_SDXL_MODEL || 'stability.stable-diffusion-xl-v1';
  }

  async generate(params: BedrockSDXLParams): Promise<GeneratedImage[]> {
    const body = {
      text_prompts: [{ text: params.prompt }],
      cfg_scale: params.cfgScale ?? 10,
      steps: params.steps ?? 30,
      width: params.width ?? 1024,
      height: params.height ?? 1024,
      samples: params.count ?? 1,
    };

    const command = new InvokeModelCommand({
      modelId: this.modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(body),
    });

    try {
      const res = await this.client.send(command);
      if (!res.body) return [];
      const json = JSON.parse(new TextDecoder().decode(res.body));
      const artifacts = Array.isArray(json.artifacts) ? json.artifacts : [];
      return artifacts.map((a: any) => ({ imageBase64: a.base64 }));
    } catch {
      return [];
    }
  }
}

