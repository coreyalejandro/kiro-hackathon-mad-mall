// CoT (Chain of Thought) Data Generation for MADMall Platform
// Integrates AI reasoning with culturally authentic content generation

import { Story, Article, Post, ComedyClip } from './types';

// CoT Reasoning Interface
interface CoTReasoning {
  step: number;
  thought: string;
  decision: string;
  culturalConsideration: string;
}

interface CoTGenerationResult<T> {
  data: T;
  reasoning: CoTReasoning[];
  culturalValidation: {
    score: number;
    considerations: string[];
    improvements: string[];
  };
  confidence: number;
}

// Cultural Context Database
const CULTURAL_CONTEXTS = {
  gravesDisease: {
    experiences: [
      'diagnosis anxiety and medical gaslighting',
      'energy fluctuations and workplace challenges',
      'medication side effects and body changes',
      'family understanding and support needs',
      'self-advocacy in healthcare settings',
      'community connection and sisterhood'
    ],
    emotions: [
      'overwhelmed but determined',
      'frustrated but hopeful',
      'tired but resilient',
      'scared but supported',
      'empowered through knowledge',
      'grateful for community'
    ],
    language: [
      'sister', 'warrior', 'journey', 'strength',
      'community', 'support', 'healing', 'empowerment',
      'authentic', 'real', 'honest', 'vulnerable'
    ]
  },
  blackWomenExperiences: {
    healthcare: [
      'being dismissed by doctors',
      'having to advocate strongly',
      'seeking culturally competent care',
      'managing medical costs and access'
    ],
    community: [
      'finding your tribe',
      'supporting each other',
      'sharing wisdom and resources',
      'celebrating small victories'
    ],
    identity: [
      'strong Black woman stereotype pressure',
      'balancing vulnerability and strength',
      'cultural pride and health challenges',
      'intersectional identity navigation'
    ]
  }
};

// CoT Story Generation
export class CoTStoryGenerator {
  private generateReasoning(prompt: string, context: string): CoTReasoning[] {
    return [
      {
        step: 1,
        thought: `I need to create a story about ${prompt} that authentically represents Black women's experiences with Graves' disease.`,
        decision: `Focus on ${context} while ensuring cultural authenticity and emotional resonance.`,
        culturalConsideration: 'Must avoid stereotypes while honoring the strength and vulnerability of Black women\'s health journeys.'
      },
      {
        step: 2,
        thought: 'The story should reflect real challenges without being overly medical or clinical.',
        decision: 'Use conversational, sister-to-sister tone with specific, relatable details.',
        culturalConsideration: 'Include cultural references and community-centered language that feels authentic.'
      },
      {
        step: 3,
        thought: 'The narrative should provide hope and connection, not just document struggle.',
        decision: 'End with empowerment, community connection, or personal growth insight.',
        culturalConsideration: 'Emphasize sisterhood, resilience, and the power of shared experience.'
      }
    ];
  }

  generateStory(theme: string): CoTGenerationResult<Story> {
    const reasoning = this.generateReasoning('personal health story', theme);
    
    // CoT-generated story templates based on reasoning
    const storyTemplates = {
      'diagnosis': {
        title: 'The Day Everything Changed: My Graves\' Diagnosis Story',
        content: `I still remember that Tuesday morning when my doctor called with my test results. "You have Graves\' disease," she said, and suddenly the racing heart, the sleepless nights, the feeling like my body was running a marathon while I was sitting still - it all made sense.

At first, I felt relief. Finally, an answer! But then came the fear. What did this mean for my life, my career, my dreams of having children someday? I sat in my car in the parking lot and cried - not just from fear, but from exhaustion. I'd been fighting my own body for months without knowing why.

The hardest part wasn't the diagnosis itself, but explaining it to my family. "But you look fine," they kept saying. How do you explain that your thyroid - this tiny butterfly-shaped gland you never thought about - is now running your whole life?

But here's what I learned: having a name for what I was experiencing was the first step toward taking my power back. I started researching, asking questions, finding my voice in doctor's appointments. I connected with other sisters going through the same thing, and suddenly I wasn't alone anymore.

Today, two years later, I'm not the same woman who got that phone call. I'm stronger, more in tune with my body, and fiercely protective of my energy and peace. Graves\' disease didn't break me - it taught me how to truly take care of myself.

To any sister just getting this diagnosis: you're going to be okay. It's going to be a journey, but you don't have to walk it alone. We're here, and we understand.`
      },
      'community': {
        title: 'Finding My Tribe: How Graves\' Disease Led Me to My Sisters',
        content: `I never thought chronic illness would lead me to some of the most meaningful friendships of my life, but here we are.

When I was first diagnosed with Graves\' disease, I felt so isolated. None of my friends really understood why I was suddenly canceling plans, why I needed to rest more, why some days I felt like I could conquer the world and others I could barely get out of bed.

Then I found this online community of Black women managing thyroid conditions. At first, I just lurked, reading other people's stories and thinking "Yes! Someone gets it!" But eventually, I started sharing too.

The first time I posted about having a panic attack because my heart rate spiked during a work presentation, the responses flooded in. "Girl, been there." "That happened to me last month." "Here's what helped me..." It was like finding water in the desert.

These women became my lifeline. They celebrated with me when my levels stabilized. They sent encouragement when I was struggling with medication side effects. They shared tips for managing fatigue, dealing with hair loss, advocating with doctors who didn't always listen.

What started as a health support group became so much more. We share recipes, career advice, relationship wisdom. We've become each other's chosen family, connected by this thing we never wanted but grateful for the sisterhood it brought us.

Last month, three of us met in person for the first time. Sitting in that coffee shop, laughing until our sides hurt, I realized something beautiful: sometimes the hardest things in life lead us exactly where we need to be.

To anyone feeling alone in their health journey - your tribe is out there. Don't be afraid to reach out. We're waiting with open arms.`
      }
    };

    const selectedTemplate = storyTemplates[theme as keyof typeof storyTemplates] || storyTemplates.diagnosis;
    const culturalValidation = validateCulturalAuthenticity(selectedTemplate.content);

    const story: Story = {
      id: `cot-story-${Math.random().toString(36).substr(2, 9)}`,
      title: selectedTemplate.title,
      content: selectedTemplate.content,
      type: 'text',
      author: {
        name: 'Anonymous Sister',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=cot-story'
      },
      tags: ['cot-generated', theme, 'authentic', 'community'],
      publishedAt: new Date(),
      engagement: {
        likes: Math.floor(Math.random() * 50) + 20, // Higher engagement for authentic content
        comments: Math.floor(Math.random() * 30) + 10,
        shares: Math.floor(Math.random() * 15) + 5,
        views: Math.floor(Math.random() * 200) + 100,
        saves: Math.floor(Math.random() * 20) + 10,
        helpfulVotes: Math.floor(Math.random() * 25) + 15
      },
      isAnonymous: true
    };

    return {
      data: story,
      reasoning,
      culturalValidation,
      confidence: culturalValidation.score
    };
  }
}

// CoT Article Generation
export class CoTArticleGenerator {
  generateArticle(topic: string): CoTGenerationResult<Article> {
    const reasoning: CoTReasoning[] = [
      {
        step: 1,
        thought: `Creating an educational article about ${topic} for Black women with Graves' disease.`,
        decision: 'Focus on practical, actionable information while addressing cultural and systemic barriers.',
        culturalConsideration: 'Must acknowledge healthcare disparities and provide culturally relevant guidance.'
      },
      {
        step: 2,
        thought: 'The article should be authoritative but accessible, avoiding medical jargon.',
        decision: 'Use clear language, include personal anecdotes, and provide specific resources.',
        culturalConsideration: 'Include information about finding culturally competent healthcare providers.'
      }
    ];

    const articleTemplates = {
      'self-advocacy': {
        title: 'Speaking Up for Yourself: A Black Woman\'s Guide to Healthcare Advocacy',
        excerpt: 'Practical strategies for getting the care you deserve and being heard by healthcare providers, with specific guidance for navigating systemic barriers.',
        content: `As Black women, we often face unique challenges in healthcare settings. We're more likely to have our pain dismissed, our symptoms minimized, and our concerns overlooked. When you add a complex condition like Graves' disease to the mix, self-advocacy becomes not just important - it's essential.

Here's how to advocate effectively for yourself:

**Before Your Appointment:**
- Write down all your symptoms, when they occur, and how they affect your daily life
- Research your condition, but stick to reputable medical sources
- Prepare specific questions and bring them written down
- Bring a support person if possible - they can help ensure you're heard

**During Your Appointment:**
- Be specific about your symptoms: "I have heart palpitations 3-4 times per week that last 10-15 minutes"
- Don't minimize your experience: "This is significantly impacting my ability to work"
- Ask for explanations: "Can you help me understand why you think this isn't related to my thyroid?"
- Request documentation: "Can you note in my chart that you're declining to order this test?"

**If You're Not Being Heard:**
- Stay calm but firm: "I feel like my concerns aren't being addressed. Can we discuss this further?"
- Ask for a second opinion or referral to a specialist
- Consider switching providers if possible
- Document everything - dates, what was said, what was dismissed

**Finding Culturally Competent Care:**
- Ask other Black women for provider recommendations
- Look for providers who have experience with diverse populations
- Don't be afraid to interview potential doctors about their approach to care
- Trust your instincts - if something feels off, it probably is

Remember: You know your body better than anyone else. Your symptoms are real, your concerns are valid, and you deserve quality healthcare. Don't let anyone make you feel otherwise.

**Resources:**
- Black Women's Health Imperative: blackwomenshealth.org
- National Graves' Disease Foundation: ngdf.org
- Health Advocacy Organizations in your area

Your health is worth fighting for, sister. Keep advocating until you get the care you deserve.`
      }
    };

    const selectedTemplate = articleTemplates['self-advocacy'];
    const culturalValidation = validateCulturalAuthenticity(selectedTemplate.content);

    const article: Article = {
      id: `cot-article-${Math.random().toString(36).substr(2, 9)}`,
      title: selectedTemplate.title,
      excerpt: selectedTemplate.excerpt,
      content: selectedTemplate.content,
      author: {
        name: 'Dr. Keisha Williams',
        credentials: 'MD, Patient Advocate',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=cot-author'
      },
      category: 'Medical Advocacy',
      format: 'article',
      credibility: 'expert',
      tags: ['cot-generated', 'advocacy', 'healthcare', 'empowerment'],
      readingTime: 8,
      publishedAt: new Date(),
      rating: 4.8,
      bookmarkCount: Math.floor(Math.random() * 100) + 50
    };

    return {
      data: article,
      reasoning,
      culturalValidation,
      confidence: culturalValidation.score
    };
  }
}

// CoT Comedy Generation
export class CoTComedyGenerator {
  generateComedyClip(): CoTGenerationResult<ComedyClip> {
    const reasoning: CoTReasoning[] = [
      {
        step: 1,
        thought: 'Creating therapeutic humor about Graves\' disease that helps with stress relief.',
        decision: 'Focus on relatable, everyday situations that make light of common experiences.',
        culturalConsideration: 'Ensure humor is empowering, not self-deprecating, and culturally authentic.'
      },
      {
        step: 2,
        thought: 'Comedy should provide relief while validating the real challenges of chronic illness.',
        decision: 'Use observational humor about the absurdities of managing a chronic condition.',
        culturalConsideration: 'Include cultural references and community language that resonates.'
      }
    ];

    const comedyTemplates = [
      {
        title: 'When Your Thyroid Has Main Character Energy',
        description: 'A hilarious take on how your thyroid thinks it runs the whole show (spoiler: it kind of does). From racing hearts during Netflix binges to explaining why you need 47 alarms for one pill.'
      },
      {
        title: 'Graves\' Disease vs. My To-Do List: The Eternal Battle',
        description: 'The comedy of planning your whole life around energy levels that change faster than your mood. Featuring special guest appearances by Fatigue and Unexpected Energy Bursts.'
      }
    ];

    const selectedTemplate = comedyTemplates[Math.floor(Math.random() * comedyTemplates.length)];
    const culturalValidation = validateCulturalAuthenticity(selectedTemplate.description);

    const comedyClip: ComedyClip = {
      id: `cot-comedy-${Math.random().toString(36).substr(2, 9)}`,
      title: selectedTemplate.title,
      description: selectedTemplate.description,
      thumbnailUrl: 'https://picsum.photos/400/225?random=cot-comedy',
      videoUrl: 'https://example.com/cot-comedy.mp4',
      duration: Math.floor(Math.random() * 180) + 60, // 1-4 minutes
      category: 'CoT Graves Giggles',
      tags: ['cot-generated', 'graves-humor', 'therapeutic', 'relatable'],
      averageReliefRating: 4.5 + Math.random() * 0.5, // High relief rating for CoT content
      viewCount: Math.floor(Math.random() * 1000) + 500,
      creator: {
        name: 'Sister Comedian AI',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=cot-comedian'
      }
    };

    return {
      data: comedyClip,
      reasoning,
      culturalValidation,
      confidence: culturalValidation.score
    };
  }
}

// Main CoT Data Generator
export class CoTDataGenerator {
  private storyGenerator = new CoTStoryGenerator();
  private articleGenerator = new CoTArticleGenerator();
  private comedyGenerator = new CoTComedyGenerator();

  generateStory(theme: string = 'diagnosis'): CoTGenerationResult<Story> {
    return this.storyGenerator.generateStory(theme);
  }

  generateArticle(topic: string = 'self-advocacy'): CoTGenerationResult<Article> {
    return this.articleGenerator.generateArticle(topic);
  }

  generateComedyClip(): CoTGenerationResult<ComedyClip> {
    return this.comedyGenerator.generateComedyClip();
  }

  // Generate mixed content with CoT reasoning
  generateMixedContent(count: number = 5): {
    stories: CoTGenerationResult<Story>[];
    articles: CoTGenerationResult<Article>[];
    comedy: CoTGenerationResult<ComedyClip>[];
    summary: {
      totalGenerated: number;
      averageConfidence: number;
      culturalValidationScore: number;
    };
  } {
    const stories = [
      this.generateStory('diagnosis'),
      this.generateStory('community')
    ];
    
    const articles = [
      this.generateArticle('self-advocacy')
    ];
    
    const comedy = [
      this.generateComedyClip(),
      this.generateComedyClip()
    ];

    const allContent = [...stories, ...articles, ...comedy];
    const averageConfidence = allContent.reduce((sum, item) => sum + item.confidence, 0) / allContent.length;
    const culturalValidationScore = allContent.reduce((sum, item) => sum + item.culturalValidation.score, 0) / allContent.length;

    return {
      stories,
      articles,
      comedy,
      summary: {
        totalGenerated: allContent.length,
        averageConfidence,
        culturalValidationScore
      }
    };
  }
}

// Export singleton instance
export const cotDataGenerator = new CoTDataGenerator();

// Integration with existing mock API
export const enhanceWithCoTData = (existingData: any) => {
  const cotContent = cotDataGenerator.generateMixedContent();
  
  return {
    ...existingData,
    stories: [
      ...cotContent.stories.map(result => result.data),
      ...existingData.stories
    ],
    articles: [
      ...cotContent.articles.map(result => result.data),
      ...existingData.articles
    ],
    comedyClips: [
      ...cotContent.comedy.map(result => result.data),
      ...existingData.comedyClips
    ],
    cotMetadata: {
      generatedAt: new Date(),
      summary: cotContent.summary,
      reasoning: {
        totalSteps: cotContent.stories.length * 3 + cotContent.articles.length * 2 + cotContent.comedy.length * 2,
        culturalConsiderations: cotContent.stories.length + cotContent.articles.length + cotContent.comedy.length,
        averageConfidence: cotContent.summary.averageConfidence
      }
    }
  };
};

// Standalone function for cultural validation
function validateCulturalAuthenticity(content: string): { score: number; considerations: string[]; improvements: string[] } {
  const considerations = [];
  const improvements = [];
  let score = 0.8; // Base score

  // Check for authentic language
  const authenticLanguage = CULTURAL_CONTEXTS.gravesDisease.language;
  const hasAuthenticLanguage = authenticLanguage.some(word => content.toLowerCase().includes(word));
  if (hasAuthenticLanguage) {
    score += 0.1;
    considerations.push('Uses culturally authentic language');
  } else {
    improvements.push('Consider adding more community-centered language');
  }

  // Check for community focus
  if (content.includes('sister') || content.includes('community') || content.includes('support')) {
    score += 0.05;
    considerations.push('Emphasizes community and sisterhood');
  }

  // Check for balanced vulnerability and strength
  const hasVulnerability = content.includes('scared') || content.includes('overwhelmed') || content.includes('struggle');
  const hasStrength = content.includes('strong') || content.includes('resilient') || content.includes('warrior');
  if (hasVulnerability && hasStrength) {
    score += 0.05;
    considerations.push('Balances vulnerability with strength');
  }

  return {
    score: Math.min(score, 1.0),
    considerations,
    improvements
  };
}