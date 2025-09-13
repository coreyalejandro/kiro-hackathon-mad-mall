import axios from 'axios';
import { CONFIG } from '../config.js';
import { ImageCategory } from '../types.js';
import fs from 'fs';
import path from 'path';

// Cultural search terms optimized for Pexels API
const CULTURAL_SEARCH_TERMS: Record<ImageCategory, string[]> = {
  wellness: [
    'black women',
    'Black woman meditation wellness',
    'African American woman yoga health',
    'Black woman self care beauty',
    'Black woman wellness portrait confident',
    'African American woman fitness empowerment',
    'Black woman spa relaxation',
    'African American woman mindfulness',
    'Black woman healthy lifestyle'
  ],
  community: [
    'black women',
    'Black women community support sisterhood',
    'African American women friendship connection',
    'Black woman mentorship guidance',
    'Black women together community gathering',
    'African American sisterhood support',
    'Black women conversation support',
    'African American women helping',
    'Black women group discussion'
  ],
  empowerment: [
    'black women',
    'Black woman entrepreneur business success',
    'African American woman leadership professional',
    'Black woman confident empowerment',
    'Black woman graduation achievement',
    'African American woman speaker confident',
    'Black woman business owner',
    'African American woman executive',
    'Black woman professional success'
  ],
  joy: [
    'black women',
    'Black woman laughing joy happiness',
    'African American woman dancing celebration',
    'Black woman peaceful nature healing',
    'Black woman family celebration joy',
    'African American woman reading content',
    'Black woman smiling happy',
    'African American woman joyful',
    'Black woman celebrating success'
  ]
};

export async function fetchPexelsImages(query: string, count: number): Promise<string[]> {
  if (!CONFIG.PEXELS_API_KEY) throw new Error('PEXELS_API_KEY is not set');
  
  const perPage = Math.min(count, 80); // Pexels allows up to 80 per page
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=portrait`;
  
  const resp = await axios.get(url, {
    headers: { 
      Authorization: CONFIG.PEXELS_API_KEY
    }
  });
  
  const photos: any[] = resp.data.photos || [];
  const savedPaths: string[] = [];
  
  // Ensure public/images directory exists
  const imageDir = path.join('public', 'images');
  if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir, { recursive: true });
  }
  
  for (const photo of photos) {
    const downloadUrl = photo.src?.large || photo.src?.medium || photo.src?.original;
    if (!downloadUrl) continue;
    
    const fileName = `pexels_${photo.id}.jpg`;
    const filePath = path.join('public', 'images', fileName);
    const writer = fs.createWriteStream(filePath);
    
    try {
      const imgResp = await axios.get(downloadUrl, { responseType: 'stream' });
      await new Promise<void>((resolve, reject) => {
        imgResp.data.pipe(writer);
        writer.on('finish', () => resolve());
        writer.on('error', reject);
      });
      savedPaths.push(filePath);
    } catch (error) {
      console.warn(`Failed to download image ${photo.id}:`, error);
      continue;
    }
  }
  
  return savedPaths;
}

// Enhanced cultural search function
export async function fetchCulturallyAppropriateImages(
  category: ImageCategory, 
  count: number
): Promise<string[]> {
  const searchTerms = CULTURAL_SEARCH_TERMS[category];
  const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
  
  console.log(`Searching Pexels for culturally appropriate ${category} images with term: "${randomTerm}"`);
  
  return await fetchPexelsImages(randomTerm, count);
}

// Validate search results for cultural appropriateness
export function validatePexelsResult(result: any): boolean {
  const alt = (result.alt || '').toLowerCase();
  const photographer = (result.photographer || '').toLowerCase();
  
  // Look for positive indicators in alt text
  const positiveIndicators = [
    'black', 'african american', 'woman', 'women', 
    'confident', 'professional', 'empowering', 'beautiful',
    'wellness', 'community', 'joy', 'success', 'portrait'
  ];
  
  // Flag problematic content
  const problematicTerms = [
    'white', 'man', 'male', 'exotic', 'stereotype'
  ];
  
  const hasPositiveIndicators = positiveIndicators.some(term => alt.includes(term));
  const hasProblematicContent = problematicTerms.some(term => alt.includes(term));
  
  return hasPositiveIndicators && !hasProblematicContent;
}

// Get curated images by category
export async function getCuratedPexelsImages(category: ImageCategory, count: number = 10): Promise<string[]> {
  if (!CONFIG.PEXELS_API_KEY) throw new Error('PEXELS_API_KEY is not set');
  
  // Use curated endpoint for higher quality images
  const url = `https://api.pexels.com/v1/curated?per_page=${Math.min(count, 80)}`;
  
  const resp = await axios.get(url, {
    headers: { 
      Authorization: CONFIG.PEXELS_API_KEY
    }
  });
  
  const photos: any[] = resp.data.photos || [];
  const filteredPhotos = photos.filter(validatePexelsResult);
  
  const savedPaths: string[] = [];
  const imageDir = path.join('public', 'images');
  if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir, { recursive: true });
  }
  
  for (const photo of filteredPhotos.slice(0, count)) {
    const downloadUrl = photo.src?.large || photo.src?.medium || photo.src?.original;
    if (!downloadUrl) continue;
    
    const fileName = `pexels_curated_${photo.id}.jpg`;
    const filePath = path.join('public', 'images', fileName);
    const writer = fs.createWriteStream(filePath);
    
    try {
      const imgResp = await axios.get(downloadUrl, { responseType: 'stream' });
      await new Promise<void>((resolve, reject) => {
        imgResp.data.pipe(writer);
        writer.on('finish', () => resolve());
        writer.on('error', reject);
      });
      savedPaths.push(filePath);
    } catch (error) {
      console.warn(`Failed to download curated image ${photo.id}:`, error);
      continue;
    }
  }
  
  return savedPaths;
}