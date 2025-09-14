/**
 * Synthetic Data Generator using CoT-Self-Instruct Methodology
 * Generates high-quality, culturally authentic content for the wellness platform
 */

import { seedData, qualityMetrics } from '../seedData.js';

class SyntheticDataGenerator {
  constructor() {
    this.generatedContent = {
      userStories: [],
      comedyContent: [],
      peerDiscussions: [],
      resourceArticles: [],
      productReviews: [],
      userProfiles: []
    };
  }

  /**
   * Main generation method using CoT-Self-Instruct approach
   */
  generateAllContent() {
    console.log('🧠 Starting CoT-Self-Instruct data generation...');
    
    // Generate each content type using the methodology
    this.generateUserStories(15);
    this.generateComedyContent(20);
    this.generatePeerDiscussions(25);
    this.generateResourceArticles(12);
    this.generateProductReviews(30);
    this.generateUserProfiles(20);
    
    console.log('✅ Synthetic data generation complete!');
    return this.generatedContent;
  }

  /**
   * Generate authentic user stories using CoT reasoning
   */
  generateUserStories(count) {
    console.log(`📖 Generating ${count} user stories...`);
    
    const storyTemplates = [
      {
        title: "My Diagnosis Journey",
        themes: ["uncertainty", "validation", "relief", "community", "growth"],
        structure: ["symptoms", "seeking_help", "diagnosis", "emotional_response", "finding_support", "current_state"],
        culturalElements: ["medical_advocacy", "family_dynamics", "sisterhood"]
      },
      {
        title: "Learning Self-Care",
        themes: ["boundaries", "self_worth", "healing", "empowerment", "growth"],
        structure: ["old_patterns", "wake_up_call", "resistance", "learning", "implementation", "transformation"],
        culturalElements: ["strong_black_woman_myth", "community_expectations", "self_advocacy"]
      },
      {
        title: "Finding My Voice",
        themes: ["advocacy", "courage", "empowerment", "community", "healing"],
        structure: ["silence", "internal_struggle", "catalyst", "speaking_up", "response", "empowerment"],
        culturalElements: ["medical_bias", "self_advocacy", "sisterhood", "strength"]
      },
      {
        title: "Workplace Wellness",
        themes: ["accommodation", "disclosure", "advocacy", "balance", "success"],
        structure: ["struggles", "decision_point", "disclosure", "advocacy", "accommodation", "thriving"],
        culturalElements: ["workplace_bias", "professional_image", "self_advocacy"]
      },
      {
        title: "Family Understanding",
        themes: ["education", "patience", "love", "support", "growth"],
        structure: ["misunderstanding", "frustration", "education_attempt", "breakthrough", "support", "gratitude"],
        culturalElements: ["family_dynamics", "generational_differences", "cultural_health_beliefs"]
      }
    ];

    const authors = [
      'Maya K.', 'Keisha R.', 'Sarah J.', 'Tasha M.', 'Zara W.', 'Nia B.', 
      'Amara H.', 'Kendra T.', 'Jasmine L.', 'Alicia S.', 'Imani D.', 'Ayanna C.'
    ];

    for (let i = 0; i < count; i++) {
      const template = storyTemplates[Math.floor(Math.random() * storyTemplates.length)];
      const author = authors[Math.floor(Math.random() * authors.length)];
      
      const story = {
        id: `story_${Date.now()}_${i}`,
        title: this.generateStoryTitle(template.title),
        author: author,
        type: 'text',
        content: this.generateStoryContent(template),
        themes: template.themes,
        culturalElements: template.culturalElements,
        duration: this.calculateReadingTime(template.structure.length),
        likes: Math.floor(Math.random() * 80) + 15,
        comments: Math.floor(Math.random() * 25) + 3,
        shares: Math.floor(Math.random() * 15) + 1,
        timestamp: this.generateRecentTimestamp(),
        therapeuticValue: this.assessTherapeuticValue(template.themes)
      };

      this.generatedContent.userStories.push(story);
    }
  }

  /**
   * Generate comedy content with therapeutic value
   */
  generateComedyContent(count) {
    console.log(`😂 Generating ${count} comedy clips...`);
    
    const comedyCategories = [
      {
        name: "Thyroid Life",
        topics: [
          "When your medication alarm goes off in a meeting",
          "Explaining hyperthyroidism to people who think you're just 'hyper'",
          "The energy rollercoaster of thyroid levels",
          "Doctor visits and the waiting room experience",
          "Medication side effects nobody warns you about"
        ],
        therapeuticFocus: "normalizing_experience"
      },
      {
        name: "Self-Care Struggles",
        topics: [
          "Trying to meditate when your mind is racing",
          "Workout plans vs. energy reality",
          "Healthy meal prep when you're exhausted",
          "Sleep schedule? What sleep schedule?",
          "The myth of 'just relax'"
        ],
        therapeuticFocus: "stress_relief"
      },
      {
        name: "Community Moments",
        topics: [
          "Family members who think they're doctors",
          "Friends who don't understand invisible illness",
          "Dating with chronic illness",
          "Workplace accommodations conversations",
          "The 'but you look fine' comments"
        ],
        therapeuticFocus: "connection_building"
      },
      {
        name: "Medical Adventures",
        topics: [
          "WebMD vs. actual symptoms",
          "Lab results and the anxiety waiting game",
          "Pharmacy pickup adventures",
          "Insurance approval processes",
          "Finding a doctor who listens"
        ],
        therapeuticFocus: "anxiety_relief"
      }
    ];

    for (let i = 0; i < count; i++) {
      const category = comedyCategories[Math.floor(Math.random() * comedyCategories.length)];
      const topic = category.topics[Math.floor(Math.random() * category.topics.length)];
      
      const comedy = {
        id: `comedy_${Date.now()}_${i}`,
        title: this.generateComedyTitle(topic),
        description: this.generateComedyDescription(topic),
        category: category.name,
        duration: this.generateDuration(90, 420), // 1.5-7 minutes
        views: Math.floor(Math.random() * 400) + 50,
        rating: (Math.random() * 1.5 + 3.5).toFixed(1),
        reliefRating: (Math.random() * 1.0 + 4.0).toFixed(1),
        therapeuticFocus: category.therapeuticFocus,
        culturalElements: this.generateCulturalElements(),
        tags: this.generateComedyTags(topic),
        timestamp: this.generateRecentTimestamp()
      };

      this.generatedContent.comedyContent.push(comedy);
    }
  }

  /**
   * Generate peer circle discussions
   */
  generatePeerDiscussions(count) {
    console.log(`💬 Generating ${count} peer discussions...`);
    
    const discussionTopics = [
      {
        category: "Managing Symptoms",
        topics: [
          "Heart palpitations during stress - coping strategies?",
          "Sleep issues with hyperthyroidism",
          "Managing anxiety when levels are off",
          "Energy crashes and how to handle them",
          "Medication timing and daily routines"
        ]
      },
      {
        category: "Workplace & Life",
        topics: [
          "Disclosing diagnosis to employers",
          "Managing fatigue at work",
          "Travel tips with medication",
          "Exercise modifications for thyroid health",
          "Meal planning for energy stability"
        ]
      },
      {
        category: "Relationships & Support",
        topics: [
          "Explaining invisible illness to family",
          "Dating with chronic illness",
          "Building your support network",
          "Setting boundaries with loved ones",
          "Finding understanding friends"
        ]
      },
      {
        category: "Medical Advocacy",
        topics: [
          "Questions to ask your endocrinologist",
          "Getting taken seriously by doctors",
          "Lab results - what to watch for",
          "Second opinion experiences",
          "Insurance and medication coverage"
        ]
      }
    ];

    const circles = [
      'newly_diagnosed_support',
      'managing_anxiety_together',
      'thyroid_warriors',
      'self_care_sunday',
      'workplace_wellness',
      'medical_advocacy'
    ];

    const authors = [
      'Maya K.', 'Keisha R.', 'Sarah J.', 'Tasha M.', 'Zara W.', 'Nia B.', 
      'Amara H.', 'Kendra T.', 'Jasmine L.', 'Alicia S.'
    ];

    for (let i = 0; i < count; i++) {
      const topicCategory = discussionTopics[Math.floor(Math.random() * discussionTopics.length)];
      const topic = topicCategory.topics[Math.floor(Math.random() * topicCategory.topics.length)];
      const circle = circles[Math.floor(Math.random() * circles.length)];
      const author = authors[Math.floor(Math.random() * authors.length)];
      
      const discussion = {
        id: `discussion_${Date.now()}_${i}`,
        circleId: circle,
        title: topic,
        author: author,
        content: this.generateDiscussionContent(topic, topicCategory.category),
        category: topicCategory.category,
        responses: this.generateResponses(topic, 2 + Math.floor(Math.random() * 6)),
        tags: this.generateDiscussionTags(topic),
        likes: Math.floor(Math.random() * 40) + 5,
        views: Math.floor(Math.random() * 200) + 30,
        timestamp: this.generateRecentTimestamp()
      };

      this.generatedContent.peerDiscussions.push(discussion);
    }
  }

  /**
   * Generate educational resource articles
   */
  generateResourceArticles(count) {
    console.log(`📚 Generating ${count} resource articles...`);
    
    const articleTypes = [
      {
        category: "Education",
        topics: [
          "Understanding Graves' Disease Symptoms",
          "Thyroid Function and Black Women's Health",
          "Medication Management Best Practices",
          "Lab Results: What the Numbers Mean",
          "Hyperthyroidism vs. Hypothyroidism"
        ],
        authors: ["Dr. Keisha Williams, MD", "Dr. Amara Johnson, MD", "Dr. Sarah Davis, MD"]
      },
      {
        category: "Mental Health",
        topics: [
          "Anxiety and Thyroid Disorders",
          "Depression and Chronic Illness",
          "Stress Management Techniques",
          "Building Resilience with Chronic Illness",
          "Therapy and Support Options"
        ],
        authors: ["Licensed Therapist Maya Johnson", "Dr. Tasha Brown, LCSW", "Counselor Nia Williams"]
      },
      {
        category: "Nutrition",
        topics: [
          "Thyroid-Friendly Foods and Recipes",
          "Supplements for Thyroid Health",
          "Managing Weight with Thyroid Disorders",
          "Meal Planning for Energy Stability",
          "Foods to Avoid with Hyperthyroidism"
        ],
        authors: ["Nutritionist Sarah Davis, RD", "Dietitian Keisha Brown, RD", "Wellness Coach Amara T."]
      },
      {
        category: "Lifestyle",
        topics: [
          "Exercise Guidelines for Thyroid Health",
          "Sleep Hygiene and Thyroid Function",
          "Workplace Accommodations Guide",
          "Travel Tips with Thyroid Medication",
          "Building Your Support Network"
        ],
        authors: ["Wellness Coach Maya K.", "Health Advocate Sarah J.", "Community Leader Tasha M."]
      }
    ];

    for (let i = 0; i < count; i++) {
      const articleType = articleTypes[Math.floor(Math.random() * articleTypes.length)];
      const topic = articleType.topics[Math.floor(Math.random() * articleType.topics.length)];
      const author = articleType.authors[Math.floor(Math.random() * articleType.authors.length)];
      
      const article = {
        id: `article_${Date.now()}_${i}`,
        title: topic,
        author: author,
        category: articleType.category,
        readTime: `${Math.floor(Math.random() * 8) + 4} min read`,
        summary: this.generateArticleSummary(topic),
        content: this.generateArticleContent(topic, articleType.category),
        helpfulVotes: Math.floor(Math.random() * 150) + 25,
        tags: this.generateArticleTags(topic, articleType.category),
        culturalConsiderations: this.generateCulturalConsiderations(topic),
        therapeuticValue: this.generateTherapeuticValue(articleType.category),
        timestamp: this.generateRecentTimestamp()
      };

      this.generatedContent.resourceArticles.push(article);
    }
  }

  /**
   * Generate product reviews for marketplace
   */
  generateProductReviews(count) {
    console.log(`🛍️ Generating ${count} product reviews...`);
    
    const products = [
      {
        category: "Supplements",
        items: [
          { name: "Thyroid Support Complex", brand: "Sister Strength Wellness" },
          { name: "Calm Evening Tea Blend", brand: "Melanin Wellness Co." },
          { name: "Energy Balance Vitamins", brand: "Crown & Glory Health" },
          { name: "Stress Relief Ashwagandha", brand: "Natural Sisters Co." }
        ]
      },
      {
        category: "Skincare",
        items: [
          { name: "Gentle Daily Moisturizer", brand: "Ebony Glow Skincare" },
          { name: "Sensitive Skin Cleanser", brand: "Melanin Beauty Co." },
          { name: "Healing Night Serum", brand: "Sister Glow Products" },
          { name: "Soothing Face Mask", brand: "Natural Beauty Sisters" }
        ]
      },
      {
        category: "Wellness",
        items: [
          { name: "Meditation Cushion Set", brand: "Mindful Sisters" },
          { name: "Essential Oil Diffuser", brand: "Zen & Melanin" },
          { name: "Yoga Mat & Block Set", brand: "Strong Sisters Fitness" },
          { name: "Sleep Support Pillow", brand: "Rest & Restore Co." }
        ]
      },
      {
        category: "Self-Care",
        items: [
          { name: "Relaxation Bath Set", brand: "Pamper & Heal" },
          { name: "Aromatherapy Candle Collection", brand: "Soulful Scents" },
          { name: "Silk Pillowcase Set", brand: "Beauty Sleep Sisters" },
          { name: "Massage Oil Blend", brand: "Healing Touch Co." }
        ]
      }
    ];

    const reviewers = [
      'Maya K.', 'Keisha R.', 'Sarah J.', 'Tasha M.', 'Zara W.', 'Nia B.', 
      'Amara H.', 'Kendra T.', 'Jasmine L.', 'Alicia S.', 'Imani D.', 'Ayanna C.'
    ];

    for (let i = 0; i < count; i++) {
      const productCategory = products[Math.floor(Math.random() * products.length)];
      const product = productCategory.items[Math.floor(Math.random() * productCategory.items.length)];
      const reviewer = reviewers[Math.floor(Math.random() * reviewers.length)];
      
      const review = {
        id: `review_${Date.now()}_${i}`,
        productName: product.name,
        brand: product.brand,
        category: productCategory.category,
        rating: (Math.random() * 1.5 + 3.5).toFixed(1),
        price: `$${(Math.random() * 50 + 15).toFixed(2)}`,
        reviewer: reviewer,
        reviewContent: this.generateReviewContent(product, productCategory.category),
        culturalRelevance: this.generateCulturalRelevance(),
        therapeuticBenefits: this.generateTherapeuticBenefits(productCategory.category),
        verifiedPurchase: Math.random() > 0.2, // 80% verified
        helpfulVotes: Math.floor(Math.random() * 50) + 5,
        timestamp: this.generateRecentTimestamp()
      };

      this.generatedContent.productReviews.push(review);
    }
  }

  /**
   * Generate user profiles for community members
   */
  generateUserProfiles(count) {
    console.log(`👤 Generating ${count} user profiles...`);
    
    const names = [
      'Maya K.', 'Keisha R.', 'Sarah J.', 'Tasha M.', 'Zara W.', 'Nia B.', 
      'Amara H.', 'Kendra T.', 'Jasmine L.', 'Alicia S.', 'Imani D.', 'Ayanna C.',
      'Kimberly L.', 'Destiny R.', 'Candace M.', 'Simone T.', 'Gabrielle W.', 'Naomi S.'
    ];

    const locations = [
      'Atlanta, GA', 'Houston, TX', 'Chicago, IL', 'Detroit, MI', 'Charlotte, NC',
      'Memphis, TN', 'New Orleans, LA', 'Washington, DC', 'Baltimore, MD', 'Birmingham, AL'
    ];

    const interests = [
      ['natural_hair', 'cooking', 'reading', 'yoga'],
      ['entrepreneurship', 'meditation', 'travel', 'photography'],
      ['fitness', 'music', 'art', 'gardening'],
      ['writing', 'volunteering', 'dancing', 'crafting'],
      ['technology', 'hiking', 'movies', 'fashion']
    ];

    const circles = [
      'newly_diagnosed_support', 'managing_anxiety_together', 'thyroid_warriors',
      'self_care_sunday', 'workplace_wellness', 'medical_advocacy'
    ];

    for (let i = 0; i < count; i++) {
      const name = names[Math.floor(Math.random() * names.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      const userInterests = interests[Math.floor(Math.random() * interests.length)];
      
      const profile = {
        id: `profile_${Date.now()}_${i}`,
        name: name,
        location: location,
        diagnosisDate: this.generateDiagnosisDate(),
        bio: this.generateUserBio(name, userInterests),
        interests: userInterests,
        circlesMembership: this.generateCircleMembership(circles),
        contributionStyle: this.generateContributionStyle(),
        engagementLevel: this.generateEngagementLevel(),
        culturalIdentifiers: this.generateCulturalIdentifiers(location, userInterests),
        joinDate: this.generateJoinDate(),
        postsCount: Math.floor(Math.random() * 50) + 5,
        helpfulVotes: Math.floor(Math.random() * 100) + 10
      };

      this.generatedContent.userProfiles.push(profile);
    }
  }

  // Helper methods for content generation
  generateStoryTitle(baseTitle) {
    const variations = {
      "My Diagnosis Journey": [
        "The Day Everything Changed",
        "Finding Answers After Years of Questions",
        "When the Pieces Finally Fit Together",
        "My Path to Understanding"
      ],
      "Learning Self-Care": [
        "Learning to Say No",
        "Putting Myself First",
        "The Self-Care Revolution",
        "Boundaries That Changed My Life"
      ],
      "Finding My Voice": [
        "Speaking Up for My Health",
        "Finding My Voice in Medical Spaces",
        "When I Stopped Being Silent",
        "Advocating for Myself"
      ],
      "Workplace Wellness": [
        "Thriving at Work with Graves'",
        "Workplace Accommodations That Work",
        "Professional Success with Chronic Illness",
        "Career Growth Despite Health Challenges"
      ],
      "Family Understanding": [
        "Teaching My Family About Graves'",
        "When Family Finally Gets It",
        "Building Understanding at Home",
        "Family Support That Heals"
      ]
    };

    const titleVariations = variations[baseTitle] || [baseTitle];
    return titleVariations[Math.floor(Math.random() * titleVariations.length)];
  }

  generateStoryContent(template) {
    // This would be expanded with more sophisticated content generation
    const contentSnippets = {
      symptoms: "I had been feeling off for months - heart racing, couldn't sleep, losing weight but feeling exhausted...",
      seeking_help: "After months of being told it was 'just stress,' I finally found a doctor who listened...",
      diagnosis: "Hearing 'Graves' Disease' was both terrifying and relieving - finally, I had answers...",
      emotional_response: "The mix of fear, relief, and uncertainty was overwhelming...",
      finding_support: "That's when I found this community of sisters who truly understood...",
      current_state: "Today, I'm managing my condition and thriving, surrounded by love and support..."
    };

    return template.structure.map(section => 
      contentSnippets[section] || `Content about ${section}...`
    ).join('\n\n');
  }

  generateComedyTitle(topic) {
    const titleFormats = [
      `${topic} - The Struggle is Real`,
      `When ${topic.toLowerCase()}`,
      `${topic}: A Comedy Special`,
      `The Truth About ${topic}`,
      `${topic} - We've All Been There`
    ];

    return titleFormats[Math.floor(Math.random() * titleFormats.length)];
  }

  generateComedyDescription(topic) {
    return `Hilarious take on ${topic.toLowerCase()}. Sometimes you have to laugh to keep from crying! 😂`;
  }

  generateDuration(min, max) {
    const seconds = Math.floor(Math.random() * (max - min) + min);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  generateRecentTimestamp() {
    const now = new Date();
    const hoursAgo = Math.floor(Math.random() * 168); // Within last week
    return new Date(now.getTime() - (hoursAgo * 60 * 60 * 1000)).toISOString();
  }

  calculateReadingTime(sections) {
    const wordsPerSection = 150;
    const wordsPerMinute = 200;
    const totalWords = sections * wordsPerSection;
    return `${Math.ceil(totalWords / wordsPerMinute)} min read`;
  }

  // Additional helper methods would be implemented here...
  generateCulturalElements() { return ['sisterhood', 'authenticity', 'resilience']; }
  generateComedyTags(topic) { return ['relatable', 'wellness', 'community']; }
  generateDiscussionContent(topic, category) { return `Discussion about ${topic}...`; }
  generateResponses(topic, count) { return []; }
  generateDiscussionTags(topic) { return ['support', 'advice', 'community']; }
  generateArticleSummary(topic) { return `Comprehensive guide to ${topic}...`; }
  generateArticleContent(topic, category) { return `Detailed article about ${topic}...`; }
  generateArticleTags(topic, category) { return [category.toLowerCase(), 'health', 'wellness']; }
  generateCulturalConsiderations(topic) { return ['Black women\'s health', 'cultural barriers']; }
  generateTherapeuticValue(category) { return ['education', 'empowerment']; }
  generateReviewContent(product, category) { return `Great ${category.toLowerCase()} product...`; }
  generateCulturalRelevance() { return ['black_owned', 'community_support']; }
  generateTherapeuticBenefits(category) { return [`${category.toLowerCase()}_support`]; }
  generateUserBio(name, interests) { return `Wellness journey with ${interests.join(', ')}...`; }
  generateDiagnosisDate() { 
    const now = new Date();
    const yearsAgo = Math.floor(Math.random() * 5) + 1;
    return new Date(now.getFullYear() - yearsAgo, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0];
  }
  generateCircleMembership(circles) { 
    const count = Math.floor(Math.random() * 3) + 1;
    return circles.sort(() => 0.5 - Math.random()).slice(0, count);
  }
  generateContributionStyle() {
    const styles = ['supportive_questioner', 'wise_advisor', 'encouraging_cheerleader', 'practical_helper'];
    return styles[Math.floor(Math.random() * styles.length)];
  }
  generateEngagementLevel() {
    const levels = ['active', 'moderate', 'occasional'];
    return levels[Math.floor(Math.random() * levels.length)];
  }
  generateCulturalIdentifiers(location, interests) {
    return [location.split(',')[1].trim().toLowerCase(), ...interests.slice(0, 2)];
  }
  generateJoinDate() {
    const now = new Date();
    const monthsAgo = Math.floor(Math.random() * 12) + 1;
    return new Date(now.getTime() - (monthsAgo * 30 * 24 * 60 * 60 * 1000)).toISOString();
  }
  assessTherapeuticValue(themes) {
    return themes.filter(theme => ['healing', 'empowerment', 'support', 'growth'].includes(theme));
  }
}

export default SyntheticDataGenerator;