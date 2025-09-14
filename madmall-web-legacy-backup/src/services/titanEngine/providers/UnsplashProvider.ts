import axios from 'axios';
import { CONFIG } from '../config.js';
import { ImageCategory } from '../types.js';
import fs from 'fs';
import path from 'path';

// Cultural search terms optimized for Unsplash API
const CULTURAL_SEARCH_TERMS: Record<ImageCategory, string[]> = {
  wellness: [
    'Black woman meditation wellness',
    'African American woman yoga health',
    'Black woman self care beauty',
    'Black woman wellness portrait confident',
    'African American woman fitness empowerment'
  ],
  community: [
    'Black women community support sisterhood',
    'African American women friendship connection',
    'Black woman mentorship guidance',
    'Black women together community gathering',
    'African American sisterhood support'
  ],
  empowerment: [
    'Black woman entrepreneur business success',
    'African American woman leadership professional',
    'Black woman confident empowerment',
    'Black woman graduation achievement',
    'African American woman speaker confident'
  ],
  joy: [
    'Black woman laughing joy happiness',
    'African American woman dancing celebration',
    'Black woman peaceful nature healing',
    'Black woman family celebration joy',
    'African American woman reading content'
  ]
};

export async function fetchUnsplashImages(query: string, count: number): Promise<string[]> {
  if (!CONFIG.UNSPLASH_ACCESS_KEY) throw new Error('UNSPLASH_ACCESS_KEY is not set');
  const perPage = Math.min(count, 30);
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${perPage}&content_filter=high`;
  const resp = await axios.get(url, {
    headers: { Authorization: `Client-ID ${CONFIG.UNSPLASH_ACCESS_KEY}` }
  });
  const results: any[] = resp.data.results || [];
  const savedPaths: string[] = [];
  
  // Ensure public/images directory exists
  const imageDir = path.join('public', 'images');
  if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir, { recursive: true });
  }
  
  for (const r of results) {
    const downloadUrl = r.urls?.regular || r.urls?.full || r.urls?.small;
    if (!downloadUrl) continue;
    const fileName = `${r.id}.jpg`;
    const filePath = path.join('public', 'images', fileName);
    const writer = fs.createWriteStream(filePath);
    const imgResp = await axios.get(downloadUrl, { responseType: 'stream' });
    await new Promise<void>((resolve, reject) => {
      imgResp.data.pipe(writer);
      writer.on('finish', () => resolve());
      writer.on('error', reject);
    });
    savedPaths.push(filePath);
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
  
  console.log(`Searching Unsplash for culturally appropriate ${category} images with term: "${randomTerm}"`);
  
  return await fetchUnsplashImages(randomTerm, count);
}

// Validate search results for cultural appropriateness
export function validateUnsplashResult(result: any): boolean {
  const description = (result.description || '').toLowerCase();
  const altDescription = (result.alt_description || '').toLowerCase();
  const tags = result.tags?.map((t: any) => t.title?.toLowerCase()) || [];
  
  const allText = [description, altDescription, ...tags].join(' ');
  
  // Look for positive indicators
  const positiveIndicators = [
    'black', 'african american', 'woman', 'women', 
    'confident', 'professional', 'empowering', 'beautiful',
    'wellness', 'community', 'joy', 'success'
  ];
  
  // Flag problematic content
  const problematicTerms = [
    'white', 'man', 'male', 'exotic', 'stereotype'
  ];
  
  const hasPositiveIndicators = positiveIndicators.some(term => allText.includes(term));
  const hasProblematicContent = problematicTerms.some(term => allText.includes(term));
  
  return hasPositiveIndicators && !hasProblematicContent;
}
