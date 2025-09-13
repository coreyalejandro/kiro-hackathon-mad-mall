import { validateImageContent } from './image-validation';

export async function validateBeforeUpload(file: File, category: string) {
  const previewUrl = URL.createObjectURL(file);
  const result = await validateImageContent({ url: previewUrl, altText: file.name, category });
  const ok =
    result.cultural >= 0.8 &&
    result.inclusivity >= 0.8 &&
    !(result.issues || []).some((i) => i.includes('cultural_mismatch'));
  if (!ok) {
    throw new Error('Image failed cultural validation');
  }
  return result;
}
