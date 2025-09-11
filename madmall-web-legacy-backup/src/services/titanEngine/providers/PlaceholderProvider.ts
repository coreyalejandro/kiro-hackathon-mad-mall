import { ImageCategory } from '../types.js';
import fs from 'fs';
import path from 'path';

// Culturally appropriate placeholder system for when AI generation is unavailable
// This creates SVG placeholders with appropriate text and colors

const CULTURAL_THEMES: Record<ImageCategory, { color: string; text: string; description: string }> = {
  wellness: {
    color: '#87A96B', // Sage green
    text: 'Wellness & Self-Care',
    description: 'Beautiful Black woman in wellness context'
  },
  community: {
    color: '#B85450', // Burnt sienna
    text: 'Community & Sisterhood',
    description: 'Black women supporting each other'
  },
  empowerment: {
    color: '#D4A574', // Golden ochre
    text: 'Empowerment & Success',
    description: 'Confident Black woman achieving goals'
  },
  joy: {
    color: '#8B4513', // Rich umber
    text: 'Joy & Healing',
    description: 'Black woman experiencing joy and laughter'
  }
};

export async function generateCulturalPlaceholder(
  category: ImageCategory,
  prompt: string,
  count: number = 1
): Promise<string[]> {
  const theme = CULTURAL_THEMES[category];
  const savedPaths: string[] = [];
  
  // Ensure public/images directory exists
  const imageDir = path.join('public', 'images');
  if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir, { recursive: true });
  }
  
  for (let i = 0; i < count; i++) {
    const filename = `placeholder_${category}_${Date.now()}_${i}.svg`;
    const filePath = path.join('public', 'images', filename);
    
    // Create culturally appropriate SVG placeholder
    const svgContent = `
<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad${i}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${theme.color};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${adjustColor(theme.color, -20)};stop-opacity:1" />
    </linearGradient>
    <pattern id="pattern${i}" patternUnits="userSpaceOnUse" width="40" height="40">
      <circle cx="20" cy="20" r="2" fill="rgba(255,255,255,0.1)"/>
    </pattern>
  </defs>
  
  <!-- Background -->
  <rect width="400" height="400" fill="url(#grad${i})"/>
  <rect width="400" height="400" fill="url(#pattern${i})"/>
  
  <!-- Silhouette representing Black woman -->
  <circle cx="200" cy="160" r="40" fill="rgba(0,0,0,0.3)"/>
  <ellipse cx="200" cy="240" rx="60" ry="80" fill="rgba(0,0,0,0.3)"/>
  
  <!-- Cultural elements -->
  <circle cx="150" cy="100" r="3" fill="rgba(255,255,255,0.4)"/>
  <circle cx="250" cy="120" r="2" fill="rgba(255,255,255,0.3)"/>
  <circle cx="180" cy="80" r="2" fill="rgba(255,255,255,0.5)"/>
  
  <!-- Text -->
  <text x="200" y="340" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16" font-weight="bold">
    ${theme.text}
  </text>
  <text x="200" y="360" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-family="Arial, sans-serif" font-size="12">
    ${theme.description}
  </text>
  
  <!-- Decorative elements -->
  <path d="M 100 350 Q 200 330 300 350" stroke="rgba(255,255,255,0.3)" stroke-width="2" fill="none"/>
</svg>`.trim();
    
    fs.writeFileSync(filePath, svgContent);
    savedPaths.push(filePath);
  }
  
  return savedPaths;
}

// Helper function to adjust color brightness
function adjustColor(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Generate a set of default culturally appropriate placeholders
export async function generateDefaultPlaceholders(): Promise<void> {
  console.log('Generating culturally appropriate placeholder images...');
  
  for (const category of Object.keys(CULTURAL_THEMES) as ImageCategory[]) {
    await generateCulturalPlaceholder(
      category,
      `Professional portrait of a confident Black woman ${category} theme`,
      3
    );
  }
  
  console.log('Default placeholder images generated successfully');
}