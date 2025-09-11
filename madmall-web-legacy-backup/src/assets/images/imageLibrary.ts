// Image Library Configuration for MADMall Platform
// Hybrid system: Static fallbacks + TitanEngine integration

import { titanEngineService } from '../../services/titanEngineService';
import type { ImageRecord, SelectRequest } from '../../types/titanEngine';

interface HeroImage {
  primary: string;
  alt: string;
  emotion: string;
}

interface ImageLibrary {
  heroes: Record<string, HeroImage>;
  community: Record<string, string>;
  wellness: Record<string, string>;
  lifestyle: Record<string, string>;
  portraits: Record<string, string>;
}

export const imageLibrary: ImageLibrary = {
  // Hero section images - ALL using the one appropriate image of Black woman
  heroes: {
    concourse: {
      primary: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      alt: "Confident Black woman smiling warmly, representing community leadership and wellness",
      emotion: "welcoming, confident, leadership"
    },
    peerCircles: {
      primary: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      alt: "Confident Black woman representing peer connection and community support",
      emotion: "supportive, connected, sisterhood"
    },
    comedyLounge: {
      primary: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      alt: "Confident Black woman representing healing through humor and joy",
      emotion: "joyful, healing, laughter"
    },
    marketplace: {
      primary: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      alt: "Confident Black woman representing Black-owned business empowerment",
      emotion: "entrepreneurial, empowered, successful"
    },
    resourceHub: {
      primary: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      alt: "Confident Black woman representing knowledge and personal growth",
      emotion: "thoughtful, learning, growth"
    },
    storyBooth: {
      primary: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      alt: "Confident Black woman representing storytelling and sharing experiences",
      emotion: "authentic, storytelling, vulnerable"
    }
  },

  // Community and wellness images - ALL featuring Black women
  community: {
    groupSupport: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    sisterhood: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    mentorship: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },

  // Wellness and self-care images - ALL featuring Black women
  wellness: {
    meditation: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    selfCare: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    healing: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },

  // Lifestyle and empowerment images - ALL featuring Black women
  lifestyle: {
    strength: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    joy: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    confidence: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    success: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },

  // Portrait images for testimonials and profiles - ALL featuring Black women
  portraits: {
    testimonial1: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    testimonial2: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    testimonial3: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  }
};

// Helper function to get image by category and type
export const getImage = (category: 'community' | 'wellness' | 'lifestyle' | 'portraits', type: string): string | null => {
  const categoryImages = imageLibrary[category] as Record<string, string>;
  return categoryImages?.[type] || null;
};

// Helper function to get hero image for a specific page
export const getHeroImage = (pageName?: string): HeroImage => {
  return imageLibrary.heroes[pageName || 'concourse'] || imageLibrary.heroes.concourse;
};

// Helper function to get random image from a category
export const getRandomImage = (category: 'community' | 'wellness' | 'lifestyle' | 'portraits'): string | null => {
  const images = imageLibrary[category] as Record<string, string>;
  if (!images) return null;
  
  const keys = Object.keys(images);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  return images[randomKey];
};

// TitanEngine integration functions
export const getTitanEngineImage = async (context: SelectRequest['context'], category?: SelectRequest['category']): Promise<string | null> => {
  try {
    const isAvailable = await titanEngineService.isAvailable();
    if (!isAvailable) return null;

    const images = await titanEngineService.selectImages({ context, category, limit: 1 });
    if (images.length > 0) {
      return titanEngineService.buildImageUrl(images[0].filePath);
    }
    return null;
  } catch (error) {
    console.warn('TitanEngine image selection failed, falling back to static library:', error);
    return null;
  }
};

export const getHeroImageWithFallback = async (pageName?: string): Promise<HeroImage> => {
  const staticImage = getHeroImage(pageName);
  
  try {
    const titanImage = await getTitanEngineImage(pageName as any || 'home');
    if (titanImage) {
      return {
        primary: titanImage,
        alt: staticImage.alt,
        emotion: staticImage.emotion
      };
    }
  } catch (error) {
    console.warn('TitanEngine hero image failed, using static fallback:', error);
  }

  return staticImage;
};

export const getRandomImageWithFallback = async (category: 'community' | 'wellness' | 'lifestyle' | 'portraits'): Promise<string | null> => {
  try {
    const titanImage = await getTitanEngineImage('home', category as any);
    if (titanImage) return titanImage;
  } catch (error) {
    console.warn('TitanEngine random image failed, using static fallback:', error);
  }

  return getRandomImage(category);
};

export default imageLibrary;