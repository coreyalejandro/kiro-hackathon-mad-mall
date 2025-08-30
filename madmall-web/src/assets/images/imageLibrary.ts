// Image Library Configuration for AIme Platform
// Curated collection of authentic Black women imagery

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
  // Hero section images - large, impactful images for page headers
  heroes: {
    concourse: {
      primary: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      alt: "Confident Black woman smiling warmly, representing community leadership and wellness",
      emotion: "welcoming, confident, leadership"
    },
    peerCircles: {
      primary: "https://images.unsplash.com/photo-1509909756405-be0199881695?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      alt: "Black women in supportive conversation, representing peer connection and community",
      emotion: "supportive, connected, sisterhood"
    },
    comedyLounge: {
      primary: "https://images.unsplash.com/photo-1562788869-4ed32648eb72?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      alt: "Black woman laughing joyfully, representing healing through humor and joy",
      emotion: "joyful, healing, laughter"
    },
    marketplace: {
      primary: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      alt: "Black woman entrepreneur with products, representing Black-owned business empowerment",
      emotion: "entrepreneurial, empowered, successful"
    },
    resourceHub: {
      primary: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      alt: "Black woman reading and learning, representing knowledge and personal growth",
      emotion: "thoughtful, learning, growth"
    },
    storyBooth: {
      primary: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      alt: "Black woman speaking authentically, representing storytelling and sharing experiences",
      emotion: "authentic, storytelling, vulnerable"
    }
  },

  // Community and wellness images
  community: {
    groupSupport: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    sisterhood: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    mentorship: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },

  // Wellness and self-care images
  wellness: {
    meditation: "https://images.unsplash.com/photo-1506629905607-d405b7a82d4c?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    selfCare: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    healing: "https://images.unsplash.com/photo-1509909756405-be0199881695?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },

  // Lifestyle and empowerment images
  lifestyle: {
    strength: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    joy: "https://images.unsplash.com/photo-1562788869-4ed32648eb72?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    confidence: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    success: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },

  // Portrait images for testimonials and profiles
  portraits: {
    testimonial1: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    testimonial2: "https://images.unsplash.com/photo-1509909756405-be0199881695?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    testimonial3: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
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

export default imageLibrary;