import { CulturalPrompts } from './types.js';

// Kiro's Comprehensive Cultural Prompt Library
// Designed for authentic, empowering representation of Black women
export const CULTURAL_PROMPTS: CulturalPrompts = {
  wellness: [
    "Professional portrait of a confident Black woman in her 30s practicing meditation in a serene natural setting, soft natural lighting, peaceful expression, wellness and self-care theme, high quality photography style",
    "Beautiful Black woman in her 40s doing yoga outdoors, diverse body type, joyful expression, empowering wellness journey, natural lighting, authentic representation",
    "Black woman in her 20s preparing healthy meal in modern kitchen, focus on nutrition and self-care, warm lighting, empowering wellness lifestyle",
    "Mature Black woman in her 50s practicing mindfulness in peaceful garden setting, graceful aging, wellness wisdom, serene expression",
    "Young Black woman exercising with confidence, strength training or running, athletic wear, empowering fitness journey, natural outdoor setting",
    "Black woman enjoying spa day, self-care routine, relaxation and wellness focus, luxurious but accessible wellness practices"
  ],
  
  community: [
    "Group of diverse Black women of different ages supporting each other in a warm, welcoming community space, genuine smiles and connection, sisterhood and mutual support theme",
    "Black women in their 20s-50s sharing stories and laughing together, authentic community gathering, empowering and uplifting atmosphere",
    "Two Black women having meaningful conversation over coffee, peer support and friendship, natural lighting, authentic connection",
    "Multi-generational group of Black women in community meeting, mentorship and wisdom sharing, supportive environment",
    "Black women volunteering together in community service, giving back and supporting others, empowering community leadership",
    "Circle of Black women in support group setting, healing through community, safe space for sharing and growth"
  ],
  
  empowerment: [
    "Successful Black woman entrepreneur in her 30s, confident and professional, business success and leadership theme, inspiring and empowering representation",
    "Black woman celebrating personal achievement, genuine joy and pride, overcoming challenges and thriving, empowerment and success theme",
    "Black woman speaking confidently at podium, leadership and empowerment, professional setting, inspiring representation",
    "Young Black woman graduating or receiving award, educational achievement, pride and accomplishment, empowering milestone",
    "Black woman in business attire leading meeting, professional leadership, confidence and competence, workplace empowerment",
    "Black woman artist or creative professional at work, pursuing passion and talent, artistic empowerment and self-expression"
  ],
  
  joy: [
    "Black woman laughing joyfully with genuine happiness, healing through joy and laughter, natural lighting, authentic emotional expression",
    "Black woman in peaceful moment of self-reflection, healing and personal growth, serene natural setting, empowering self-care",
    "Black woman dancing freely with pure joy, celebration of life and healing, vibrant and uplifting atmosphere",
    "Black woman enjoying nature, walking in park or beach, connection with natural world, peaceful and restorative",
    "Black woman celebrating with family or friends, genuine happiness and connection, life milestones and joy",
    "Black woman reading or enjoying hobby, personal fulfillment and contentment, quiet joy and self-nurturing"
  ]
};

// Context-specific prompt selection
export function getCulturalPrompt(category: keyof CulturalPrompts): string {
  const prompts = CULTURAL_PROMPTS[category];
  const randomIndex = Math.floor(Math.random() * prompts.length);
  return prompts[randomIndex];
}

// Enhanced prompt with cultural validation keywords
export function getEnhancedCulturalPrompt(category: keyof CulturalPrompts): string {
  const basePrompt = getCulturalPrompt(category);
  const culturalEnhancement = ", authentic Black woman representation, dignified, empowering, culturally sensitive, professional photography, no stereotypes, respectful portrayal";
  return basePrompt + culturalEnhancement;
}

// Prompt validation - ensures prompts meet cultural standards
export function validatePrompt(prompt: string): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  // Check for problematic language
  const problematicTerms = ['exotic', 'ghetto', 'urban', 'sassy', 'attitude'];
  problematicTerms.forEach(term => {
    if (prompt.toLowerCase().includes(term)) {
      issues.push(`Contains potentially problematic term: ${term}`);
    }
  });
  
  // Ensure empowering language
  const empoweringTerms = ['confident', 'empowering', 'authentic', 'dignified', 'professional'];
  const hasEmpoweringLanguage = empoweringTerms.some(term => 
    prompt.toLowerCase().includes(term)
  );
  
  if (!hasEmpoweringLanguage) {
    issues.push('Should include empowering language');
  }
  
  // Check for Black woman representation
  if (!prompt.toLowerCase().includes('black woman') && !prompt.toLowerCase().includes('black women')) {
    issues.push('Must explicitly specify Black woman/women representation');
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}