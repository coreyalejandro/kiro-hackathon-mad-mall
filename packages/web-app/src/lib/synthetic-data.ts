// Synthetic data generation for MADMall platform
import { 
  User, Circle, Post, ComedyClip, Product, Article, Story, 
  ActivityItem, PlatformStats, MallSection 
} from './types';

// Culturally appropriate data sets
const BLACK_WOMEN_NAMES = [
  'Aaliyah Johnson', 'Amara Williams', 'Asha Davis', 'Ayanna Brown', 'Breanna Wilson',
  'Camille Jackson', 'Candace Thompson', 'Chanel Harris', 'Ciara Martin', 'Danielle Lee',
  'Destiny Anderson', 'Diamond Taylor', 'Ebony Moore', 'Essence White', 'Faith Clark',
  'Gabrielle Lewis', 'Imani Robinson', 'Jasmine Walker', 'Jada Hall', 'Kendra Young',
  'Keisha Allen', 'Kiara King', 'Layla Wright', 'Maya Green', 'Nia Adams',
  'Nyla Baker', 'Octavia Nelson', 'Raven Carter', 'Sanaa Mitchell', 'Simone Turner',
  'Talia Phillips', 'Tamara Campbell', 'Tiana Parker', 'Vanessa Evans', 'Zara Collins'
];

const GRAVES_DISEASE_CIRCLES = [
  {
    name: 'Newly Diagnosed Sisters',
    description: 'Support for women recently diagnosed with Graves\' disease. Share your journey, ask questions, and find comfort in sisterhood.',
    tags: ['newly-diagnosed', 'support', 'questions', 'learning']
  },
  {
    name: 'Thyroid Warriors',
    description: 'For the fighters managing Graves\' disease with strength and determination. Share victories, challenges, and warrior wisdom.',
    tags: ['warriors', 'strength', 'management', 'victories']
  },
  {
    name: 'Medication & Treatment Talk',
    description: 'Discuss medications, treatments, and medical experiences. Share what works, side effects, and doctor recommendations.',
    tags: ['medication', 'treatment', 'medical', 'doctors']
  },
  {
    name: 'Workplace Wellness',
    description: 'Navigate Graves\' disease in professional settings. Discuss accommodations, disclosure, and maintaining career goals.',
    tags: ['workplace', 'career', 'accommodations', 'professional']
  },
  {
    name: 'Mama Bears with Graves',
    description: 'Mothers managing Graves\' disease while caring for families. Share parenting tips, energy management, and family support.',
    tags: ['mothers', 'parenting', 'family', 'energy']
  },
  {
    name: 'Self-Care Sanctuary',
    description: 'Focus on self-care practices that support thyroid health. Share routines, products, and wellness discoveries.',
    tags: ['self-care', 'wellness', 'routines', 'health']
  },
  {
    name: 'Nutrition & Thyroid Health',
    description: 'Explore nutrition strategies for Graves\' disease. Share recipes, supplements, and dietary approaches that help.',
    tags: ['nutrition', 'recipes', 'diet', 'supplements']
  },
  {
    name: 'Mental Health Matters',
    description: 'Address the mental health aspects of chronic illness. Share coping strategies, therapy experiences, and emotional support.',
    tags: ['mental-health', 'coping', 'therapy', 'emotional']
  }
];

const COMEDY_CATEGORIES = [
  'Graves Giggles', 'Sisterhood Laughs', 'Daily Dose', 'Wellness Humor', 
  'Community Favorites', 'Thyroid Tales', 'Medical Moments', 'Self-Care Chuckles'
];

const PRODUCT_CATEGORIES = [
  'Self-Care', 'Wellness', 'Beauty', 'Nutrition', 'Mental Health', 'Fitness', 
  'Home & Comfort', 'Books & Learning', 'Jewelry & Accessories', 'Aromatherapy'
];

const ARTICLE_CATEGORIES = [
  'Graves Disease', 'Mental Health', 'Nutrition', 'Exercise', 'Self-Care', 
  'Medical Advocacy', 'Workplace Wellness', 'Relationships', 'Spirituality', 'Community'
];

const BLACK_OWNED_BUSINESSES = [
  {
    name: 'Melanin Wellness Co.',
    ownerName: 'Dr. Kimberly Washington',
    story: 'Founded by an endocrinologist who understands the unique challenges Black women face with autoimmune conditions.'
  },
  {
    name: 'Sister Strength Supplements',
    ownerName: 'Jasmine Rodriguez',
    story: 'Created after my own Graves\' disease diagnosis, focusing on natural supplements that support thyroid health.'
  },
  {
    name: 'Crowned Confidence Beauty',
    ownerName: 'Aisha Thompson',
    story: 'Beauty products designed for women managing chronic illness, because you deserve to feel beautiful every day.'
  },
  {
    name: 'Nourish & Flourish Foods',
    ownerName: 'Chef Amara Johnson',
    story: 'Anti-inflammatory meal kits and snacks created by a chef living with autoimmune conditions.'
  },
  {
    name: 'Peaceful Mind Aromatherapy',
    ownerName: 'Destiny Williams',
    story: 'Essential oil blends specifically crafted to support stress management and thyroid wellness.'
  }
];

// Utility functions
const randomChoice = <T>(array: T[]): T => array[Math.floor(Math.random() * array.length)];
const randomChoices = <T>(array: T[], count: number): T[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
const randomDate = (start: Date, end: Date): Date => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

// Data generators
export const generateUser = (): User => {
  const name = randomChoice(BLACK_WOMEN_NAMES);
  const id = `user-${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    id,
    name,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}&backgroundColor=f3d2c1,fdbcb4,ffeaa7,dda0dd,c7ecee`,
    joinedAt: randomDate(new Date(2023, 0, 1), new Date()),
    location: randomChoice(['Atlanta, GA', 'Houston, TX', 'Chicago, IL', 'Detroit, MI', 'Charlotte, NC', 'Memphis, TN', 'New Orleans, LA', 'Washington, DC']),
    interests: randomChoices([
      'Graves Disease Support', 'Mental Health', 'Wellness', 'Self-Care', 'Nutrition', 
      'Exercise', 'Community', 'Sisterhood', 'Spirituality', 'Career Growth'
    ], randomInt(3, 6)),
    isVerified: Math.random() > 0.7
  };
};

export const generateCircle = (): Circle => {
  const circleData = randomChoice(GRAVES_DISEASE_CIRCLES);
  const id = `circle-${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    id,
    name: circleData.name,
    description: circleData.description,
    memberCount: randomInt(15, 500),
    isPrivate: Math.random() > 0.8,
    tags: circleData.tags,
    recentActivity: randomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()),
    moderators: [`mod-${Math.random().toString(36).substr(2, 9)}`],
    rules: [
      'Be respectful and supportive of all members',
      'No medical advice - share experiences only',
      'Maintain confidentiality and privacy',
      'Use content warnings for sensitive topics'
    ],
    activityLevel: randomChoice(['low', 'medium', 'high']),
    color: randomChoice(['sage-green', 'warm-terracotta', 'soft-lavender', 'golden-amber'])
  };
};

export const generatePost = (circleId: string, userId: string): Post => {
  const posts = [
    'Just got my latest lab results and my levels are finally stabilizing! Feeling grateful for this community\'s support. 💜',
    'Having a rough day with fatigue. Any sisters have tips for managing energy levels?',
    'Celebrating 6 months of consistent medication routine! Small victories matter. ✨',
    'Found an amazing endocrinologist who actually listens. Happy to share recommendations via DM.',
    'Trying a new anti-inflammatory recipe tonight. Will report back on how it makes me feel!',
    'Reminder: You are not your diagnosis. You are a whole, beautiful, powerful woman. 👑',
    'Work accommodations update: HR was more understanding than I expected. Don\'t be afraid to advocate for yourself.',
    'Bad thyroid day but good self-care day. Sometimes that\'s enough. 🛁',
    'Grateful for telehealth appointments. Makes managing care so much easier.',
    'Anyone else dealing with hair changes? Looking for gentle product recommendations.'
  ];
  
  return {
    id: `post-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    circleId,
    content: randomChoice(posts),
    createdAt: randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
    likes: randomInt(0, 25),
    comments: randomInt(0, 15),
    isAnonymous: Math.random() > 0.8
  };
};

export const generateComedyClip = (): ComedyClip => {
  const clips = [
    {
      title: 'When Your Thyroid Has Main Character Energy',
      description: 'A hilarious take on how your thyroid thinks it runs the whole show (spoiler: it kind of does).'
    },
    {
      title: 'Graves Disease vs. My To-Do List',
      description: 'The eternal battle between what I planned to do and what my energy levels actually allow.'
    },
    {
      title: 'Explaining Invisible Illness to Family',
      description: 'That awkward moment when you have to explain why you\'re tired after doing "nothing" all day.'
    },
    {
      title: 'Medication Reminder Chaos',
      description: 'The comedy of errors that is trying to remember if you took your pills this morning.'
    },
    {
      title: 'Doctor Visit Bingo',
      description: 'All the predictable things that happen during endocrinologist appointments.'
    }
  ];
  
  const clip = randomChoice(clips);
  const id = `clip-${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    id,
    title: clip.title,
    description: clip.description,
    thumbnailUrl: `https://picsum.photos/400/225?random=${id}`,
    videoUrl: `https://example.com/videos/${id}.mp4`,
    duration: randomInt(30, 300),
    category: randomChoice(COMEDY_CATEGORIES),
    tags: randomChoices(['graves-disease', 'thyroid', 'chronic-illness', 'humor', 'relatable', 'wellness'], randomInt(2, 4)),
    averageReliefRating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0-5.0
    viewCount: randomInt(50, 2000),
    creator: {
      name: randomChoice(BLACK_WOMEN_NAMES),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`
    }
  };
};

export const generateProduct = (): Product => {
  const products = [
    {
      name: 'Thyroid Support Herbal Tea Blend',
      description: 'Organic herbal tea blend with ashwagandha, lemon balm, and nettle leaf to support thyroid wellness.',
      price: 24.99,
      category: 'Wellness'
    },
    {
      name: 'Gentle Energy Body Oil',
      description: 'Nourishing body oil infused with energizing essential oils for when fatigue hits hard.',
      price: 32.00,
      category: 'Self-Care'
    },
    {
      name: 'Affirmation Journal for Chronic Warriors',
      description: 'Beautiful journal with prompts designed specifically for women managing chronic conditions.',
      price: 18.50,
      category: 'Mental Health'
    },
    {
      name: 'Anti-Inflammatory Spice Blend Set',
      description: 'Curated spice blends to add anti-inflammatory power to your meals.',
      price: 45.00,
      category: 'Nutrition'
    },
    {
      name: 'Comfort Weighted Eye Pillow',
      description: 'Lavender-scented weighted eye pillow for rest and relaxation during flare-ups.',
      price: 28.00,
      category: 'Self-Care'
    }
  ];
  
  const product = randomChoice(products);
  const business = randomChoice(BLACK_OWNED_BUSINESSES);
  const id = `product-${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    id,
    name: product.name,
    description: product.description,
    price: product.price,
    imageUrl: `https://picsum.photos/300/300?random=${id}`,
    affiliateUrl: `https://amazon.com/dp/${id}`,
    business: {
      ...business,
      logoUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${business.name}`
    },
    category: product.category,
    tags: randomChoices(['thyroid-support', 'natural', 'organic', 'wellness', 'self-care', 'black-owned'], randomInt(2, 4)),
    rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10, // 3.5-5.0
    reviewCount: randomInt(10, 200)
  };
};

export const generateArticle = (): Article => {
  const articles = [
    {
      title: 'Understanding Graves\' Disease: A Comprehensive Guide for Black Women',
      excerpt: 'Everything you need to know about Graves\' disease, from symptoms to treatment options, with a focus on our community\'s unique experiences.',
      category: 'Graves Disease'
    },
    {
      title: 'The Mental Health Impact of Chronic Illness: You\'re Not Alone',
      excerpt: 'Exploring the emotional journey of living with chronic illness and strategies for maintaining mental wellness.',
      category: 'Mental Health'
    },
    {
      title: 'Anti-Inflammatory Eating for Thyroid Health',
      excerpt: 'Discover foods that support thyroid function and reduce inflammation, with delicious recipes to try.',
      category: 'Nutrition'
    },
    {
      title: 'Advocating for Yourself in Healthcare Settings',
      excerpt: 'Practical tips for getting the care you deserve and being heard by healthcare providers.',
      category: 'Medical Advocacy'
    },
    {
      title: 'Building Your Support Network: The Power of Community',
      excerpt: 'How to find and nurture relationships that support your wellness journey.',
      category: 'Community'
    }
  ];
  
  const article = randomChoice(articles);
  const id = `article-${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    id,
    title: article.title,
    excerpt: article.excerpt,
    content: `${article.excerpt}\n\nThis is a comprehensive article that would contain detailed information about ${article.title.toLowerCase()}. The content would be written by healthcare professionals and community experts to provide valuable, culturally relevant information for Black women managing Graves' disease and other chronic conditions.`,
    author: {
      name: randomChoice(['Dr. Kimberly Washington', 'Therapist Maya Johnson', 'Nutritionist Aisha Davis', 'Advocate Jasmine Williams']),
      credentials: randomChoice(['MD, Endocrinologist', 'LCSW, Chronic Illness Specialist', 'RD, Thyroid Nutrition Expert', 'Patient Advocate, Graves\' Warrior']),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`
    },
    category: article.category,
    tags: randomChoices(['graves-disease', 'thyroid', 'wellness', 'mental-health', 'nutrition', 'advocacy', 'community'], randomInt(2, 5)),
    readingTime: randomInt(3, 15),
    publishedAt: randomDate(new Date(2023, 0, 1), new Date()),
    rating: Math.round((Math.random() * 1 + 4) * 10) / 10, // 4.0-5.0
    bookmarkCount: randomInt(5, 100)
  };
};

export const generateStory = (): Story => {
  const stories = [
    {
      title: 'My Diagnosis Day: From Fear to Empowerment',
      content: 'I remember sitting in that doctor\'s office, hearing "Graves\' disease" for the first time. The fear was overwhelming, but looking back, that day was the beginning of my journey to truly knowing and advocating for myself...'
    },
    {
      title: 'Finding Strength in Sisterhood',
      content: 'I never expected to find my closest friends through a chronic illness, but here we are. These women have become my chosen family, my support system, my reminder that I\'m never alone in this journey...'
    },
    {
      title: 'The Day I Chose Myself',
      content: 'For years, I put everyone else first - my job, my family, everyone\'s needs before my own. But chronic illness taught me that choosing myself isn\'t selfish, it\'s necessary...'
    },
    {
      title: 'Redefining Success with Graves\' Disease',
      content: 'Success used to mean climbing the corporate ladder, working 60-hour weeks, never saying no. Now success means listening to my body, setting boundaries, and finding joy in small moments...'
    }
  ];
  
  const story = randomChoice(stories);
  const id = `story-${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    id,
    title: story.title,
    content: story.content,
    type: randomChoice(['text', 'audio', 'video']),
    audioUrl: Math.random() > 0.5 ? `https://example.com/audio/${id}.mp3` : undefined,
    videoUrl: Math.random() > 0.5 ? `https://example.com/video/${id}.mp4` : undefined,
    author: {
      name: Math.random() > 0.3 ? randomChoice(BLACK_WOMEN_NAMES) : 'Anonymous Sister',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`
    },
    tags: randomChoices(['diagnosis', 'empowerment', 'community', 'self-care', 'advocacy', 'healing', 'strength'], randomInt(2, 4)),
    publishedAt: randomDate(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), new Date()),
    engagement: {
      likes: randomInt(5, 50),
      comments: randomInt(2, 20),
      shares: randomInt(0, 15),
      views: randomInt(20, 200),
      saves: randomInt(0, 10),
      helpfulVotes: randomInt(0, 5),
    },
    isAnonymous: Math.random() > 0.7
  };
};

export const generateActivityItem = (): ActivityItem => {
  const activities = [
    {
      type: 'post' as const,
      content: 'shared an update in Newly Diagnosed Sisters',
    },
    {
      type: 'join' as const,
      content: 'joined the Thyroid Warriors circle',
    },
    {
      type: 'story' as const,
      content: 'shared their story "Finding Strength in Sisterhood"',
    },
    {
      type: 'relief_rating' as const,
      content: 'found relief watching "Graves Disease vs. My To-Do List"',
    },
    {
      type: 'bookmark' as const,
      content: 'bookmarked "Anti-Inflammatory Eating for Thyroid Health"',
    },
    {
      type: 'wishlist' as const,
      content: 'added Thyroid Support Tea to their wishlist',
    }
  ];
  
  const activity = randomChoice(activities);
  const id = `activity-${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    id,
    type: activity.type,
    user: {
      name: randomChoice(BLACK_WOMEN_NAMES),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`
    },
    content: activity.content,
    timestamp: randomDate(new Date(Date.now() - 24 * 60 * 60 * 1000), new Date()),
    engagement: {
      likes: randomInt(0, 10),
      comments: randomInt(0, 5)
    }
  };
};

export const generatePlatformStats = (): PlatformStats => ({
  totalMembers: randomInt(1200, 1500),
  activeCircles: randomInt(45, 55),
  wellnessMoments: randomInt(2800, 3200),
  reliefRatings: randomInt(1500, 2000),
  storiesShared: randomInt(400, 600),
  businessesSupported: randomInt(150, 200)
});

export const generateMallSections = (): MallSection[] => [
  {
    id: 'peer-circles',
    title: 'Peer Circles',
    description: 'Connect with sisters who understand your journey',
    icon: '👥',
    href: '/circles',
    memberCount: 1247,
    activityLevel: 'high',
    color: 'sage-green',
    stats: { label: 'Active Circles', value: 48 }
  },
  {
    id: 'comedy-lounge',
    title: 'Comedy Lounge',
    description: 'Find relief and joy through therapeutic humor',
    icon: '😄',
    href: '/comedy',
    activityLevel: 'high',
    color: 'warm-terracotta',
    stats: { label: 'Relief Moments', value: 2847 }
  },
  {
    id: 'marketplace',
    title: 'Marketplace',
    description: 'Support Black-owned wellness businesses',
    icon: '🛍️',
    href: '/marketplace',
    activityLevel: 'medium',
    color: 'golden-amber',
    stats: { label: 'Businesses', value: 180 }
  },
  {
    id: 'resource-hub',
    title: 'Resource Hub',
    description: 'Curated wellness resources and expert guidance',
    icon: '📚',
    href: '/resources',
    activityLevel: 'medium',
    color: 'soft-lavender',
    stats: { label: 'Articles', value: 320 }
  },
  {
    id: 'story-booth',
    title: 'Story Booth',
    description: 'Share and discover powerful community stories',
    icon: '🎤',
    href: '/stories',
    activityLevel: 'medium',
    color: 'sage-green',
    stats: { label: 'Stories', value: 156 }
  }
];

// Bulk data generation
export const generateBulkData = () => {
  const users = Array.from({ length: 100 }, generateUser);
  const circles = Array.from({ length: 50 }, generateCircle);
  const comedyClips = Array.from({ length: 100 }, generateComedyClip);
  const products = Array.from({ length: 200 }, generateProduct);
  const articles = Array.from({ length: 300 }, generateArticle);
  const stories = Array.from({ length: 100 }, generateStory);
  const activities = Array.from({ length: 50 }, generateActivityItem);
  
  // Generate posts for circles
  const posts = circles.flatMap(circle => 
    Array.from({ length: randomInt(5, 20) }, () => 
      generatePost(circle.id, randomChoice(users).id)
    )
  );
  
  return {
    users,
    circles,
    posts,
    comedyClips,
    products,
    articles,
    stories,
    activities,
    platformStats: generatePlatformStats(),
    mallSections: generateMallSections()
  };
};