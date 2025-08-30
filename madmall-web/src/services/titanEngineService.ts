import type { ImageRecord, SelectRequest, GenerateRequest, FeedbackRecord } from '../types/titanEngine';

const TITANENGINE_URL = import.meta.env.VITE_TITANENGINE_URL || 'http://localhost:8080';
const TITANENGINE_ENABLED = import.meta.env.VITE_TITANENGINE_ENABLED === 'true';

class TitanEngineService {
  private baseUrl = TITANENGINE_URL;
  
  async isAvailable(): Promise<boolean> {
    if (!TITANENGINE_ENABLED) return false;
    
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(`${this.baseUrl}/api/health`, { 
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeout);
      return response.ok;
    } catch {
      return false;
    }
  }

  async selectImages(request: SelectRequest): Promise<ImageRecord[]> {
    const params = new URLSearchParams();
    params.append('context', request.context);
    if (request.category) params.append('category', request.category);
    
    const response = await fetch(`${this.baseUrl}/api/images/select?${params}`, {
      method: 'GET'
    });
    
    if (!response.ok) {
      throw new Error(`TitanEngine select failed: ${response.statusText}`);
    }
    
    const result = await response.json();
    return [result]; // Server returns single image, wrap in array
  }

  async importFromUnsplash(query: string, category: string, count = 10): Promise<ImageRecord[]> {
    const response = await fetch(`${this.baseUrl}/api/images/import/unsplash`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, category, count })
    });
    
    if (!response.ok) {
      throw new Error(`Unsplash import failed: ${response.statusText}`);
    }
    
    return response.json();
  }

  async generateImages(request: GenerateRequest): Promise<ImageRecord[]> {
    const response = await fetch(`${this.baseUrl}/api/images/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    
    if (!response.ok) {
      throw new Error(`Image generation failed: ${response.statusText}`);
    }
    
    return response.json();
  }

  async submitFeedback(imageId: number, vote: 1 | -1, comment?: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/images/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageId, vote, comment })
    });
    
    if (!response.ok) {
      throw new Error(`Feedback submission failed: ${response.statusText}`);
    }
  }

  async getPendingImages(): Promise<ImageRecord[]> {
    const response = await fetch(`${this.baseUrl}/api/admin/images/pending`);
    
    if (!response.ok) {
      throw new Error(`Failed to get pending images: ${response.statusText}`);
    }
    
    return response.json();
  }

  async validateImage(imageId: number, approved: boolean, reasons?: string[]): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/admin/images/${imageId}/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved, reasons })
    });
    
    if (!response.ok) {
      throw new Error(`Image validation failed: ${response.statusText}`);
    }
  }

  buildImageUrl(filePath: string): string {
    return `${this.baseUrl}/images/${filePath}`;
  }
}

export const titanEngineService = new TitanEngineService();