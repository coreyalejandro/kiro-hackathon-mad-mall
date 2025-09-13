export interface ImageValidationInput {
  url: string;
  altText: string;
  category: string;
}

export interface ImageValidationResult {
  cultural: number;
  sensitivity: number;
  inclusivity: number;
  issues?: string[];
}

export async function validateImageContent(input: ImageValidationInput): Promise<ImageValidationResult> {
  const res = await fetch('/api/validate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    throw new Error('Image validation failed');
  }
  return res.json();
}
