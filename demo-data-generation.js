#!/usr/bin/env node

// Demo script to show how the synthetic data generation works
// This simulates the data generation functions from synthetic-data.ts

console.log('🎭 MADMall Synthetic Data Generation Demo\n');
console.log('=' .repeat(50));

// Simulate the data arrays and functions from synthetic-data.ts
const BLACK_WOMEN_NAMES = [
  'Aaliyah Johnson', 'Amara Williams', 'Asha Davis', 'Ayanna Brown', 'Breanna Wilson',
  'Camille Jackson', 'Candace Thompson', 'Chanel Harris', 'Ciara Martin', 'Danielle Lee',
  'Destiny Anderson', 'Diamond Taylor', 'Ebony Moore', 'Essence White', 'Faith Clark',
  'Gabrielle Lewis', 'Imani Robinson', 'Jasmine Walker', 'Jada Hall', 'Kendra Young'
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
  }
];

const STORY_TEMPLATES = [
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
  }
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
  }
];

// Utility functions
const randomChoice = (array) => array[Math.floor(Math.random() * array.length)];
const randomChoices = (array, count) => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

// Demo functions
function generateUser() {
  const name = randomChoice(BLACK_WOMEN_NAMES);
  const id = `user-${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    id,
    name,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
    joinedAt: randomDate(new Date(2023, 0, 1), new Date()),
    location: randomChoice(['Atlanta, GA', 'Houston, TX', 'Chicago, IL', 'Detroit, MI']),
    interests: randomChoices([
      'Graves Disease Support', 'Mental Health', 'Wellness', 'Self-Care', 'Nutrition', 
      'Exercise', 'Community', 'Sisterhood', 'Spirituality', 'Career Growth'
    ], randomInt(3, 6)),
    isVerified: Math.random() > 0.7
  };
}

function generateCircle() {
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
    activityLevel: randomChoice(['low', 'medium', 'high']),
    color: randomChoice(['sage-green', 'warm-terracotta', 'soft-lavender', 'golden-amber'])
  };
}

function generateStory() {
  const story = randomChoice(STORY_TEMPLATES);
  const id = `story-${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    id,
    title: story.title,
    content: story.content,
    type: randomChoice(['text', 'audio', 'video']),
    author: {
      name: Math.random() > 0.3 ? randomChoice(BLACK_WOMEN_NAMES) : 'Anonymous Sister',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`
    },
    tags: randomChoices(['diagnosis', 'empowerment', 'community', 'self-care', 'advocacy', 'healing'], randomInt(2, 4)),
    publishedAt: randomDate(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), new Date()),
    engagement: {
      likes: randomInt(5, 50),
      comments: randomInt(2, 20),
      shares: randomInt(0, 15),
      views: randomInt(20, 200)
    },
    isAnonymous: Math.random() > 0.7
  };
}

function generateProduct() {
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
    business: business,
    category: product.category,
    rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10,
    reviewCount: randomInt(10, 200)
  };
}

// Run the demo
console.log('🔄 Step 1: Generating Users');
console.log('Method: Random selection from curated name list + random attributes\n');

for (let i = 0; i < 3; i++) {
  const user = generateUser();
  console.log(`👤 User ${i + 1}:`);
  console.log(`   Name: ${user.name}`);
  console.log(`   Location: ${user.location}`);
  console.log(`   Interests: ${user.interests.slice(0, 3).join(', ')}...`);
  console.log(`   Verified: ${user.isVerified ? '✅' : '❌'}`);
  console.log('');
}

console.log('=' .repeat(50));
console.log('🔄 Step 2: Generating Peer Circles');
console.log('Method: Template-based with predefined culturally appropriate content\n');

for (let i = 0; i < 2; i++) {
  const circle = generateCircle();
  console.log(`👥 Circle ${i + 1}:`);
  console.log(`   Name: ${circle.name}`);
  console.log(`   Description: ${circle.description.substring(0, 80)}...`);
  console.log(`   Members: ${circle.memberCount}`);
  console.log(`   Activity: ${circle.activityLevel}`);
  console.log(`   Tags: ${circle.tags.join(', ')}`);
  console.log('');
}

console.log('=' .repeat(50));
console.log('🔄 Step 3: Generating Stories');
console.log('Method: Pre-written templates with random author assignment\n');

for (let i = 0; i < 2; i++) {
  const story = generateStory();
  console.log(`📖 Story ${i + 1}:`);
  console.log(`   Title: ${story.title}`);
  console.log(`   Author: ${story.author.name}`);
  console.log(`   Type: ${story.type}`);
  console.log(`   Content: ${story.content.substring(0, 100)}...`);
  console.log(`   Engagement: ${story.engagement.likes} likes, ${story.engagement.comments} comments`);
  console.log(`   Tags: ${story.tags.join(', ')}`);
  console.log('');
}

console.log('=' .repeat(50));
console.log('🔄 Step 4: Generating Products');
console.log('Method: Product templates + Black-owned business data\n');

for (let i = 0; i < 2; i++) {
  const product = generateProduct();
  console.log(`🛍️ Product ${i + 1}:`);
  console.log(`   Name: ${product.name}`);
  console.log(`   Price: $${product.price}`);
  console.log(`   Business: ${product.business.name}`);
  console.log(`   Owner: ${product.business.ownerName}`);
  console.log(`   Rating: ${product.rating}/5.0 (${product.reviewCount} reviews)`);
  console.log(`   Description: ${product.description.substring(0, 80)}...`);
  console.log('');
}

console.log('=' .repeat(50));
console.log('📊 System Analysis:');
console.log('');
console.log('✅ STRENGTHS:');
console.log('   • Culturally authentic names and content');
console.log('   • Consistent data structure');
console.log('   • Fast generation (no API calls)');
console.log('   • Deterministic for demos');
console.log('   • Community-focused content');
console.log('');
console.log('❌ LIMITATIONS:');
console.log('   • Static templates (no AI reasoning)');
console.log('   • Limited content variety');
console.log('   • No personalization logic');
console.log('   • No Chain of Thought generation');
console.log('   • Repetitive patterns over time');
console.log('');
console.log('🚀 POTENTIAL IMPROVEMENTS:');
console.log('   • Add CoT-powered content generation');
console.log('   • Integrate with TitanEngine for cultural validation');
console.log('   • Dynamic content based on user behavior');
console.log('   • AI-generated variations of templates');
console.log('   • Personalized content recommendations');
console.log('');
console.log('Demo complete! 🎉');