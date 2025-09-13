// Cultural Validation Examples and Usage Guide
// Demonstrates how to use the cultural validation framework

import { culturalValidator, CulturalContext } from './cultural-validation';

/**
 * Example Cultural Contexts for Testing
 */
export const EXAMPLE_CONTEXTS: Record<string, CulturalContext> = {
  blackWomanNewlyDiagnosed: {
    primaryCulture: 'African American',
    region: 'Southeast US',
    language: 'English',
    communicationStyle: 'informal_familial',
    socioeconomicContext: 'middle',
    generationalStatus: 'second',
    intersectionalIdentities: ['Black', 'Woman', 'Chronic Illness', 'Professional'],
  },
  
  blackWomanWorkingMother: {
    primaryCulture: 'African American',
    region: 'Urban Northeast',
    language: 'English',
    communicationStyle: 'direct',
    socioeconomicContext: 'middle',
    generationalStatus: 'second',
    intersectionalIdentities: ['Black', 'Woman', 'Mother', 'Professional', 'Chronic Illness'],
  },
  
  youngBlackWoman: {
    primaryCulture: 'African American',
    region: 'West Coast',
    language: 'English',
    communicationStyle: 'informal_familial',
    socioeconomicContext: 'low',
    generationalStatus: 'third_plus',
    intersectionalIdentities: ['Black', 'Woman', 'Young Adult', 'Student'],
  },
  
  caribbeanAmericanWoman: {
    primaryCulture: 'Caribbean American',
    secondaryCultures: ['Jamaican', 'African American'],
    region: 'Northeast US',
    language: 'English',
    communicationStyle: 'high-context',
    religiousAffiliation: 'Christian',
    generationalStatus: 'first',
    intersectionalIdentities: ['Caribbean', 'Black', 'Woman', 'Immigrant', 'Religious'],
  },
};

/**
 * Example Content for Validation Testing
 */
export const EXAMPLE_CONTENT = {
  // Excellent cultural competency examples
  excellent: {
    welcomeMessage: `Welcome to our community, sister! 🌟 We're so glad you're here. This is a safe space where your experiences matter and your voice is valued. As Black women navigating Graves' disease, we understand the unique challenges you face - from medical providers who might not listen to the intersection of racism and healthcare. You belong here, and we're here to support you every step of the way.`,
    
    supportPost: `Hey beautiful queens! 👑 Just wanted to remind everyone that your symptoms are REAL and VALID. If a doctor dismisses your concerns, that's about their bias, not about you. You know your body better than anyone. Keep advocating for yourself, and remember - we've got your back in this community. Your health matters, your experience matters, and YOU matter. 💜`,
    
    resourceShare: `Found this amazing Black woman endocrinologist who actually LISTENS and understands our experiences with Graves' disease. She gets the intersection of being Black and having an autoimmune condition. Happy to share her info via DM if anyone needs a culturally competent provider. We deserve doctors who see us as whole human beings! ✊🏾`,
  },
  
  // Good but could improve
  good: {
    generalSupport: `We're here to support you through your Graves' disease journey. This community understands what you're going through and we want to help. Feel free to share your experiences and ask questions. Everyone is welcome here and we believe in treating each other with respect and kindness.`,
    
    informationalPost: `Graves' disease can cause many symptoms including fatigue, anxiety, rapid heartbeat, and weight changes. It's important to work with your healthcare provider to find the right treatment plan. Remember that managing a chronic condition takes time and patience with yourself.`,
  },
  
  // Problematic examples that should be flagged
  problematic: {
    colorBlind: `I don't see color when I look at our community members. We're all just women dealing with the same health condition. Race doesn't matter here - we're all the same and should just focus on supporting each other without bringing up divisive topics like racism.`,
    
    medicalDismissal: `Maybe you're just being too sensitive about your symptoms. Have you tried just thinking more positively? A lot of people have it worse than you do. You should be grateful for the healthcare you have access to. Just relax and don't stress so much about it.`,
    
    stereotyping: `You're such a strong Black woman, I'm sure you can handle anything! You don't need as much support as other people because you're naturally resilient. I know you can just push through this - that's what strong Black women do.`,
    
    microaggressions: `Wow, you're so articulate when you describe your symptoms! You speak so well for someone from your background. It's great to see someone like you taking charge of their health and being so professional about it.`,
  },
  
  // Context-dependent examples that need careful evaluation
  contextDependent: {
    strengthLanguage: `You're such a strong woman for dealing with all of this. Your strength is inspiring to everyone in our community.`, // Could be supportive or dismissive depending on context
    
    familyReferences: `How is your family handling your diagnosis? Are they being supportive of your treatment journey?`, // Could be caring or intrusive
    
    appearanceComments: `You look great! No one would ever know you have Graves' disease.`, // Could be well-meaning but potentially invalidating
  },
};

/**
 * Validation Testing Examples
 */
export class CulturalValidationExamples {
  
  /**
   * Test excellent content examples
   */
  static async testExcellentContent() {
    console.log('🧪 Testing Excellent Cultural Competency Content\n');
    
    for (const [key, content] of Object.entries(EXAMPLE_CONTENT.excellent)) {
      console.log(`Testing: ${key}`);
      console.log(`Content: "${content.substring(0, 100)}..."`);
      
      const result = await culturalValidator.validateContent(
        content,
        EXAMPLE_CONTEXTS.blackWomanNewlyDiagnosed
      );
      
      console.log(`Overall Score: ${(result.overallScore * 100).toFixed(1)}%`);
      console.log(`Appropriateness: ${(result.appropriateness * 100).toFixed(1)}%`);
      console.log(`Sensitivity: ${(result.sensitivity * 100).toFixed(1)}%`);
      console.log(`Inclusivity: ${(result.inclusivity * 100).toFixed(1)}%`);
      console.log(`Authenticity: ${(result.authenticity * 100).toFixed(1)}%`);
      console.log(`Harm Prevention: ${(result.harmPrevention * 100).toFixed(1)}%`);
      
      if (result.flags.length > 0) {
        console.log('Flags:', result.flags.map(f => f.message));
      }
      
      console.log('Recommendations:', result.recommendations);
      console.log('---\n');
    }
  }
  
  /**
   * Test problematic content examples
   */
  static async testProblematicContent() {
    console.log('🚨 Testing Problematic Content (Should Be Flagged)\n');
    
    for (const [key, content] of Object.entries(EXAMPLE_CONTENT.problematic)) {
      console.log(`Testing: ${key}`);
      console.log(`Content: "${content.substring(0, 100)}..."`);
      
      const result = await culturalValidator.validateContent(
        content,
        EXAMPLE_CONTEXTS.blackWomanNewlyDiagnosed
      );
      
      console.log(`Overall Score: ${(result.overallScore * 100).toFixed(1)}% (Should be LOW)`);
      console.log(`Harm Prevention: ${(result.harmPrevention * 100).toFixed(1)}% (Should be LOW)`);
      
      console.log('Critical Flags:');
      result.flags
        .filter(f => f.severity === 'critical' || f.severity === 'high')
        .forEach(flag => {
          console.log(`  - ${flag.type.toUpperCase()}: ${flag.message}`);
        });
      
      console.log('---\n');
    }
  }
  
  /**
   * Test healthcare-specific validation
   */
  static async testHealthcareValidation() {
    console.log('🏥 Testing Healthcare-Specific Validation\n');
    
    const healthcareContent = `
      I understand that as a Black woman, you may have experienced medical providers who didn't take your symptoms seriously. 
      That's unfortunately common due to bias in healthcare. Your Graves' disease symptoms - the fatigue, anxiety, heart palpitations - 
      are real and deserve proper attention. Let's work together to find you a culturally competent endocrinologist who will listen 
      to your concerns and provide the care you deserve.
    `;
    
    const result = await culturalValidator.validateHealthcareContent(
      healthcareContent,
      EXAMPLE_CONTEXTS.blackWomanNewlyDiagnosed,
      'graves_disease'
    );
    
    console.log('Healthcare Content Validation Results:');
    console.log(`Overall Score: ${(result.overallScore * 100).toFixed(1)}%`);
    console.log(`Medical Sensitivity: ${(result.sensitivity * 100).toFixed(1)}%`);
    console.log(`Harm Prevention: ${(result.harmPrevention * 100).toFixed(1)}%`);
    console.log(`Confidence: ${(result.confidence * 100).toFixed(1)}%`);
    
    if (result.recommendations.length > 0) {
      console.log('Recommendations:');
      result.recommendations.forEach(rec => console.log(`  - ${rec}`));
    }
    
    console.log('---\n');
  }
  
  /**
   * Test different cultural contexts
   */
  static async testMultipleCulturalContexts() {
    console.log('🌍 Testing Multiple Cultural Contexts\n');
    
    const testContent = `Welcome to our community! We're here to support each other through our health journeys.`;
    
    for (const [contextName, context] of Object.entries(EXAMPLE_CONTEXTS)) {
      console.log(`Testing Context: ${contextName}`);
      
      const result = await culturalValidator.validateContent(testContent, context);
      
      console.log(`Score: ${(result.overallScore * 100).toFixed(1)}%`);
      console.log(`Confidence: ${(result.confidence * 100).toFixed(1)}%`);
      
      if (result.flags.length > 0) {
        console.log(`Flags: ${result.flags.length}`);
      }
      
      console.log('---');
    }
    
    console.log('\n');
  }
  
  /**
   * Demonstrate real-time validation workflow
   */
  static async demonstrateRealTimeValidation() {
    console.log('⚡ Real-Time Validation Workflow Demo\n');
    
    const userInputs = [
      "Hey girl, how you been?",
      "I don't see color in our community",
      "You're so articulate!",
      "Sister, your experience matters and we hear you",
      "Just think positive thoughts",
    ];
    
    for (const input of userInputs) {
      console.log(`User Input: "${input}"`);
      
      const result = await culturalValidator.validateContent(
        input,
        EXAMPLE_CONTEXTS.blackWomanNewlyDiagnosed
      );
      
      // Simulate real-time decision making
      if (result.overallScore < 0.7) {
        console.log('❌ BLOCKED - Content needs review');
        console.log(`Reason: ${result.flags[0]?.message || 'Low cultural competency score'}`);
      } else if (result.overallScore < 0.8) {
        console.log('⚠️  WARNING - Suggest improvements');
        console.log(`Suggestion: ${result.recommendations[0] || 'Consider more inclusive language'}`);
      } else {
        console.log('✅ APPROVED - Culturally appropriate');
      }
      
      console.log(`Score: ${(result.overallScore * 100).toFixed(1)}%\n`);
    }
  }
  
  /**
   * Run all validation tests
   */
  static async runAllTests() {
    await this.testExcellentContent();
    await this.testProblematicContent();
    await this.testHealthcareValidation();
    await this.testMultipleCulturalContexts();
    await this.demonstrateRealTimeValidation();
    
    console.log('🎉 All Cultural Validation Tests Complete!');
    console.log('\nResearch Citations:');
    culturalValidator.getResearchCitations().forEach((citation, index) => {
      console.log(`${index + 1}. ${citation}`);
    });
  }
}

/**
 * Integration helpers for platform use
 */
export class CulturalValidationIntegration {
  
  /**
   * Validate user-generated content before posting
   */
  static async validateUserPost(
    content: string,
    userId: string,
    circleId: string
  ): Promise<{ approved: boolean; feedback?: string; score: number }> {
    
    // Get user's cultural context (would come from user profile)
    const userContext = EXAMPLE_CONTEXTS.blackWomanNewlyDiagnosed; // Placeholder
    
    const result = await culturalValidator.validateContent(content, userContext);
    
    if (result.overallScore >= 0.8) {
      return { approved: true, score: result.overallScore };
    } else if (result.overallScore >= 0.6) {
      return {
        approved: false,
        feedback: result.recommendations[0] || 'Please review your message for cultural sensitivity',
        score: result.overallScore
      };
    } else {
      return {
        approved: false,
        feedback: 'This content may be harmful to community members. Please revise before posting.',
        score: result.overallScore
      };
    }
  }
  
  /**
   * Validate AI-generated content before display
   */
  static async validateAIContent(
    content: string,
    targetAudience: CulturalContext
  ): Promise<{ safe: boolean; improvements?: string[] }> {
    
    const result = await culturalValidator.validateHealthcareContent(
      content,
      targetAudience,
      'graves_disease'
    );
    
    if (result.harmPrevention < 0.9) {
      return {
        safe: false,
        improvements: ['CRITICAL: Content may cause harm - requires immediate review']
      };
    }
    
    if (result.overallScore < 0.8) {
      return {
        safe: true,
        improvements: result.recommendations
      };
    }
    
    return { safe: true };
  }
  
  /**
   * Generate cultural competency report for content creators
   */
  static async generateCompetencyReport(
    contentSamples: string[],
    context: CulturalContext
  ): Promise<{
    overallGrade: string;
    strengths: string[];
    improvements: string[];
    trainingRecommendations: string[];
  }> {
    
    const results = await Promise.all(
      contentSamples.map(content => 
        culturalValidator.validateContent(content, context)
      )
    );
    
    const averageScore = results.reduce((sum, r) => sum + r.overallScore, 0) / results.length;
    
    const getGrade = (score: number): string => {
      if (score >= 0.9) return 'A';
      if (score >= 0.8) return 'B';
      if (score >= 0.7) return 'C';
      if (score >= 0.6) return 'D';
      return 'F';
    };
    
    const allRecommendations = results.flatMap(r => r.recommendations);
    const uniqueRecommendations = [...new Set(allRecommendations)];
    
    return {
      overallGrade: getGrade(averageScore),
      strengths: averageScore >= 0.8 ? ['Strong cultural awareness', 'Appropriate language use'] : [],
      improvements: uniqueRecommendations.slice(0, 3),
      trainingRecommendations: [
        'Complete cultural competency training module',
        'Review Black women\'s healthcare experiences',
        'Practice trauma-informed communication'
      ]
    };
  }
}

// Export for testing and development
export { culturalValidator };