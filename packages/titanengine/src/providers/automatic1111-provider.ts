import fetch from 'cross-fetch';

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

export class Automatic1111Provider {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.A1111_BASE_URL || 'http://localhost:7860';
  }

  async generate(params: A1111Params): Promise<GeneratedImage[]> {
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
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) return [];
      const json = await res.json();
      const images: string[] = json.images || [];
      return images.map(i => ({ imageBase64: i, meta: json.parameters }));
    } catch {
      return [];
    }
  }
}

