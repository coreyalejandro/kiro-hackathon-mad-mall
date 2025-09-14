/**
 * High-Quality Seed Data for CoT-Self-Instruct Generation
 * These examples serve as the foundation for generating authentic synthetic content
 */

export const seedData = {
  // High-quality user stories that demonstrate authentic experiences
  userStories: [
    {
      id: 'seed_story_1',
      title: 'The Day Everything Changed',
      author: 'Maya K.',
      content: `I remember sitting in that sterile doctor's office, my hands shaking as she said the words "Graves' Disease." I had been feeling like I was losing my mind for months - heart racing, couldn't sleep, losing weight but feeling exhausted. My family kept saying I was just stressed from work, but I knew something was wrong.

The relief of finally having a name for what I was experiencing was overwhelming. I wasn't crazy. I wasn't weak. I had a real condition that explained why I felt like my body was betraying me every single day.

But then came the fear. What did this mean for my future? Would I ever feel normal again? The doctor handed me pamphlets, but they felt so clinical, so removed from what I was actually going through as a Black woman trying to navigate this new reality.

That's when I found this community. Reading stories from other sisters who understood exactly what I was feeling - the anxiety that comes with hyperthyroidism, the way people don't understand invisible illness, the challenge of advocating for yourself in medical spaces where you're not always heard.

Today, six months later, I'm on medication that's helping, but more importantly, I'm not alone. I have a circle of women who get it, who celebrate the small victories with me, and who remind me that I'm still whole, still worthy, still powerful - even with Graves' Disease.`,
      themes: ['diagnosis', 'validation', 'community', 'empowerment', 'medical_advocacy'],
      culturalElements: ['medical_bias', 'family_dynamics', 'sisterhood', 'strength'],
      therapeuticValue: ['normalization', 'hope', 'connection', 'empowerment'],
      engagement: {
        likes: 67,
        comments: 23,
        shares: 12
      },
      timestamp: '2024-08-15T10:30:00Z'
    },
    
    {
      id: 'seed_story_2',
      title: 'Learning to Say No',
      author: 'Keisha R.',
      content: `Y'all, I used to be the queen of saying yes to everything. Church committee? Yes. Extra project at work? Yes. Helping everyone with their problems while ignoring my own health? Absolutely yes.

Then Graves' Disease knocked me flat on my back. Literally. I ended up in the ER because I pushed myself so hard that my heart was racing at 140 BPM just sitting still. The doctor looked at me and said, "When was the last time you rested?"

I couldn't remember.

That was my wake-up call. I realized that all my life, I'd been taught that Black women have to be strong, have to carry everyone, have to prove we're worthy of care and attention. But nobody ever taught me that saying no is also a form of strength.

Learning to set boundaries has been harder than managing my thyroid medication, real talk. But this community taught me that self-care isn't selfish - it's survival. When I take care of myself first, I can show up better for everyone else.

Now when someone asks me to do something and I'm already stretched thin, I pause and ask myself: "Will this serve my healing?" If the answer is no, then my answer is no too. And you know what? The world didn't end. People adjusted. And I got my life back.`,
      themes: ['boundaries', 'self_care', 'cultural_expectations', 'healing', 'empowerment'],
      culturalElements: ['strong_black_woman_myth', 'community_expectations', 'church_culture', 'family_dynamics'],
      therapeuticValue: ['boundary_setting', 'self_advocacy', 'stress_management', 'empowerment'],
      engagement: {
        likes: 89,
        comments: 34,
        shares: 28
      },
      timestamp: '2024-08-20T14:15:00Z'
    }
  ],

  // Comedy content that provides therapeutic relief
  comedyContent: [
    {
      id: 'seed_comedy_1',
      title: 'Thyroid Medication Alarm Symphony',
      description: 'When you set 47 different alarms to remember your medication but still somehow forget anyway. The struggle is real, but at least we can laugh about it together!',
      category: 'Medication Management',
      duration: '3:22',
      therapeuticFocus: 'normalizing_experience',
      culturalElements: ['shared_struggle', 'community_humor', 'resilience'],
      reliefRating: 4.8,
      views: 234,
      tags: ['medication', 'memory', 'daily_life', 'relatable']
    },
    
    {
      id: 'seed_comedy_2',
      title: 'WebMD vs Reality',
      description: 'That moment when you Google "tired all the time" and WebMD tells you that you have everything from a vitamin deficiency to a rare tropical disease. Meanwhile, it\'s just your thyroid acting up again.',
      category: 'Medical Humor',
      duration: '2:45',
      therapeuticFocus: 'anxiety_relief',
      culturalElements: ['medical_anxiety', 'internet_culture', 'shared_experience'],
      reliefRating: 4.6,
      views: 189,
      tags: ['google', 'symptoms', 'anxiety', 'medical']
    }
  ],

  // Peer circle discussions
  peerDiscussions: [
    {
      id: 'seed_discussion_1',
      circleId: 'managing_anxiety_together',
      title: 'Breathing techniques that actually work?',
      author: 'Sarah J.',
      content: 'Has anyone found breathing techniques that actually help when your heart is racing from hyperthyroidism? The 4-7-8 method everyone talks about just makes me more anxious because I\'m focusing on my breathing even more. Looking for something that works when your nervous system is already in overdrive.',
      responses: [
        {
          author: 'Maya K.',
          content: 'Girl, I feel you on the 4-7-8 thing! What works for me is the "box breathing" but I do it while walking. Something about the movement helps. 4 steps in, hold for 4 steps, out for 4 steps, hold for 4. Takes my mind off the counting.',
          likes: 12,
          timestamp: '2024-08-25T09:15:00Z'
        },
        {
          author: 'Tasha M.',
          content: 'Have y\'all tried the "physiological sigh"? It\'s two inhales through the nose (second one smaller) then long exhale through mouth. Learned it from a neuroscientist and it actually calms the nervous system. Works better for me than traditional breathing exercises.',
          likes: 18,
          timestamp: '2024-08-25T10:22:00Z'
        }
      ],
      tags: ['anxiety', 'breathing', 'coping_strategies', 'hyperthyroidism'],
      engagement: {
        likes: 23,
        responses: 8,
        views: 156
      },
      timestamp: '2024-08-25T08:30:00Z'
    }
  ],

  // Resource articles
  resourceArticles: [
    {
      id: 'seed_resource_1',
      title: 'Understanding Graves\' Disease: A Guide for Black Women',
      author: 'Dr. Keisha Williams, MD',
      category: 'Education',
      readTime: '8 min read',
      summary: 'Comprehensive overview of Graves\' Disease with specific considerations for Black women, including genetic factors, cultural barriers to care, and advocacy strategies.',
      content: 'Graves\' Disease affects Black women at higher rates than other demographics, yet research and treatment protocols often don\'t account for our unique experiences...',
      culturalConsiderations: [
        'Higher prevalence in Black women',
        'Genetic factors and family history',
        'Cultural barriers to seeking care',
        'Medical bias and advocacy strategies'
      ],
      therapeuticValue: ['education', 'empowerment', 'advocacy'],
      helpfulVotes: 89,
      tags: ['graves_disease', 'education', 'black_women', 'medical_advocacy']
    }
  ],

  // Product reviews and marketplace content
  productReviews: [
    {
      id: 'seed_product_1',
      productName: 'Sister Strength Thyroid Support',
      brand: 'Melanin Wellness Co.',
      category: 'Supplements',
      rating: 4.7,
      price: '$29.99',
      reviewer: 'Amara B.',
      reviewContent: 'Finally found a supplement made by us, for us! The founder understands what we go through with thyroid issues. Been taking it for 3 months and my energy levels are more stable. Love that it\'s made with natural ingredients and the company gives back to Black women\'s health research.',
      culturalRelevance: ['black_owned', 'community_support', 'cultural_understanding'],
      therapeuticBenefits: ['energy_support', 'natural_ingredients', 'thyroid_health'],
      verifiedPurchase: true,
      helpfulVotes: 34
    }
  ],

  // User profiles for authentic community members
  userProfiles: [
    {
      id: 'seed_profile_1',
      name: 'Maya K.',
      location: 'Atlanta, GA',
      diagnosisDate: '2024-02-15',
      bio: 'Newly diagnosed but not newly strong. Learning to navigate Graves\' Disease while building my consulting business. Here for the sisterhood and shared wisdom.',
      interests: ['entrepreneurship', 'meditation', 'natural_hair', 'cooking'],
      circlesMembership: ['newly_diagnosed_support', 'entrepreneur_wellness'],
      contributionStyle: 'supportive_questioner',
      engagementLevel: 'active',
      culturalIdentifiers: ['southern', 'entrepreneur', 'natural_hair_enthusiast']
    }
  ]
};

// Quality indicators for each seed example
export const qualityMetrics = {
  authenticity: {
    indicators: ['personal_experience', 'specific_details', 'emotional_honesty', 'cultural_markers'],
    threshold: 0.8
  },
  culturalRelevance: {
    indicators: ['community_language', 'shared_experiences', 'cultural_references', 'inclusive_tone'],
    threshold: 0.9
  },
  therapeuticValue: {
    indicators: ['hope_building', 'practical_advice', 'normalization', 'empowerment'],
    threshold: 0.7
  },
  engagement: {
    indicators: ['relatable_content', 'conversation_starters', 'actionable_insights', 'emotional_resonance'],
    threshold: 0.8
  }
};

export default { seedData, qualityMetrics };