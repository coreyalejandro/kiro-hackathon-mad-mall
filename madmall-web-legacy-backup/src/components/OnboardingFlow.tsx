import React, { useState } from 'react';
import {
  Container,
  Header,
  Form,
  FormField,
  Button,
  SpaceBetween,
  Box,
  Alert,
  Textarea,
  RadioGroup,
  Multiselect,
  Checkbox,
  ProgressBar,
  Cards
} from '@cloudscape-design/components';

interface OnboardingData {
  // Step 1: Welcome & Goals
  primaryGoals: string[];
  comfortLevel: string;
  
  // Step 2: Cultural Preferences
  culturalBackground: string[];
  communicationStyle: string;
  privacyLevel: string;
  
  // Step 3: Health Journey
  diagnosisStage: string;
  supportNeeds: string[];
  shareComfortLevel: string;
  
  // Step 4: Community Preferences
  circleInterests: string[];
  contentPreferences: string[];
  notificationPreferences: string[];
}

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => Promise<void>;
  onSkip: () => void;
  loading?: boolean;
  error?: string;
}

export default function OnboardingFlow({ onComplete, onSkip, loading = false, error }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    primaryGoals: [],
    comfortLevel: '',
    culturalBackground: [],
    communicationStyle: '',
    privacyLevel: '',
    diagnosisStage: '',
    supportNeeds: [],
    shareComfortLevel: '',
    circleInterests: [],
    contentPreferences: [],
    notificationPreferences: []
  });

  const totalSteps = 4;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      await onComplete(data);
    } catch (err) {
      // Error handling is done by parent component
    }
  };

  const updateData = (field: keyof OnboardingData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const renderStep1 = () => (
    <SpaceBetween size="l">
      <Box textAlign="center">
        <Header variant="h2">Welcome to Our Sisterhood! 🌟</Header>
        <Box color="text-body-secondary">
          Let's personalize your experience to make sure you feel supported and comfortable in our community.
        </Box>
      </Box>

      <FormField
        label="What are your primary goals for joining our community?"
        description="Select all that apply - this helps us recommend the right circles and content for you"
      >
        <Multiselect
          selectedOptions={data.primaryGoals.map(goal => ({ label: goal, value: goal }))}
          onChange={({ detail }) => 
            updateData('primaryGoals', detail.selectedOptions.map(opt => opt.value))
          }
          options={[
            { label: 'Find emotional support and understanding', value: 'emotional_support' },
            { label: 'Learn about managing Graves Disease', value: 'health_education' },
            { label: 'Connect with other Black women with similar experiences', value: 'community_connection' },
            { label: 'Access stress relief and wellness resources', value: 'stress_relief' },
            { label: 'Share my story and help others', value: 'share_story' },
            { label: 'Find healthcare advocacy support', value: 'healthcare_advocacy' },
            { label: 'Discover Black-owned wellness products', value: 'wellness_products' }
          ]}
          placeholder="Choose your goals..."
        />
      </FormField>

      <FormField
        label="How comfortable are you with online communities?"
        description="This helps us adjust how we introduce you to different features"
      >
        <RadioGroup
          value={data.comfortLevel}
          onChange={({ detail }) => updateData('comfortLevel', detail.value)}
          items={[
            { value: 'very_comfortable', label: 'Very comfortable - I love connecting online!' },
            { value: 'somewhat_comfortable', label: 'Somewhat comfortable - I participate but prefer to observe first' },
            { value: 'cautious', label: 'Cautious - I prefer to take things slowly and build trust gradually' },
            { value: 'new_to_this', label: 'New to this - I could use some guidance on how online communities work' }
          ]}
        />
      </FormField>
    </SpaceBetween>
  );

  const renderStep2 = () => (
    <SpaceBetween size="l">
      <Box textAlign="center">
        <Header variant="h2">Cultural Preferences 🌍</Header>
        <Box color="text-body-secondary">
          Help us create a culturally affirming space that feels like home to you.
        </Box>
      </Box>

      <FormField
        label="How do you identify culturally?"
        description="This helps us understand your background and provide relevant content (optional)"
      >
        <Multiselect
          selectedOptions={data.culturalBackground.map(bg => ({ label: bg, value: bg }))}
          onChange={({ detail }) => 
            updateData('culturalBackground', detail.selectedOptions.map(opt => opt.value))
          }
          options={[
            { label: 'African American', value: 'african_american' },
            { label: 'Caribbean', value: 'caribbean' },
            { label: 'African', value: 'african' },
            { label: 'Afro-Latina', value: 'afro_latina' },
            { label: 'Biracial/Multiracial', value: 'biracial' },
            { label: 'Other', value: 'other' },
            { label: 'Prefer not to specify', value: 'prefer_not_to_specify' }
          ]}
          placeholder="Select your cultural background..."
        />
      </FormField>

      <FormField
        label="What communication style feels most comfortable to you?"
        description="We want to match you with circles that communicate in ways that feel natural"
      >
        <RadioGroup
          value={data.communicationStyle}
          onChange={({ detail }) => updateData('communicationStyle', detail.value)}
          items={[
            { value: 'direct_supportive', label: 'Direct and supportive - I appreciate honest, caring feedback' },
            { value: 'gentle_encouraging', label: 'Gentle and encouraging - I prefer softer, uplifting communication' },
            { value: 'humor_based', label: 'Humor-based - I love when we can laugh together through challenges' },
            { value: 'spiritual_grounded', label: 'Spiritually grounded - I appreciate faith-based perspectives' },
            { value: 'no_preference', label: 'No preference - I adapt to different communication styles' }
          ]}
        />
      </FormField>

      <FormField
        label="Privacy comfort level"
        description="How much personal information are you comfortable sharing?"
      >
        <RadioGroup
          value={data.privacyLevel}
          onChange={({ detail }) => updateData('privacyLevel', detail.value)}
          items={[
            { value: 'open_book', label: 'Open book - I\'m comfortable sharing my experiences openly' },
            { value: 'selective_sharing', label: 'Selective sharing - I share some things but keep others private' },
            { value: 'mostly_private', label: 'Mostly private - I prefer to listen and share minimally' },
            { value: 'anonymous', label: 'Anonymous - I want to participate without revealing personal details' }
          ]}
        />
      </FormField>
    </SpaceBetween>
  );

  const renderStep3 = () => (
    <SpaceBetween size="l">
      <Box textAlign="center">
        <Header variant="h2">Your Health Journey 💚</Header>
        <Box color="text-body-secondary">
          Understanding where you are in your journey helps us provide the most relevant support.
        </Box>
      </Box>

      <FormField
        label="Where are you in your Graves Disease journey?"
        description="This helps us connect you with others at similar stages"
      >
        <RadioGroup
          value={data.diagnosisStage}
          onChange={({ detail }) => updateData('diagnosisStage', detail.value)}
          items={[
            { value: 'newly_diagnosed', label: 'Newly diagnosed (within the last 6 months)' },
            { value: 'adjusting', label: 'Adjusting to treatment (6 months - 2 years)' },
            { value: 'managing_well', label: 'Managing well (2+ years, stable treatment)' },
            { value: 'experienced', label: 'Experienced (5+ years, want to help others)' },
            { value: 'complications', label: 'Dealing with complications or treatment changes' },
            { value: 'remission', label: 'In remission but staying connected to community' }
          ]}
        />
      </FormField>

      <FormField
        label="What kind of support would be most helpful right now?"
        description="Select all that apply"
      >
        <Multiselect
          selectedOptions={data.supportNeeds.map(need => ({ label: need, value: need }))}
          onChange={({ detail }) => 
            updateData('supportNeeds', detail.selectedOptions.map(opt => opt.value))
          }
          options={[
            { label: 'Understanding symptoms and side effects', value: 'symptom_understanding' },
            { label: 'Medication management tips', value: 'medication_management' },
            { label: 'Emotional support and encouragement', value: 'emotional_support' },
            { label: 'Advocacy in healthcare settings', value: 'healthcare_advocacy' },
            { label: 'Workplace accommodations guidance', value: 'workplace_support' },
            { label: 'Family and relationship support', value: 'relationship_support' },
            { label: 'Stress management techniques', value: 'stress_management' },
            { label: 'Nutrition and lifestyle guidance', value: 'lifestyle_guidance' }
          ]}
          placeholder="Choose your support needs..."
        />
      </FormField>

      <FormField
        label="How comfortable are you sharing your health experiences?"
        description="This helps us suggest appropriate circles and content"
      >
        <RadioGroup
          value={data.shareComfortLevel}
          onChange={({ detail }) => updateData('shareComfortLevel', detail.value)}
          items={[
            { value: 'very_open', label: 'Very open - I want to share my story to help others' },
            { value: 'moderately_open', label: 'Moderately open - I\'ll share some experiences in the right setting' },
            { value: 'listener_first', label: 'Listener first - I prefer to observe and learn before sharing' },
            { value: 'private', label: 'Private - I want support but prefer not to share personal details' }
          ]}
        />
      </FormField>
    </SpaceBetween>
  );

  const renderStep4 = () => (
    <SpaceBetween size="l">
      <Box textAlign="center">
        <Header variant="h2">Community Preferences 🤝</Header>
        <Box color="text-body-secondary">
          Let's customize your experience based on what interests you most.
        </Box>
      </Box>

      <FormField
        label="Which peer circles interest you most?"
        description="We'll suggest these circles first"
      >
        <Multiselect
          selectedOptions={data.circleInterests.map(interest => ({ label: interest, value: interest }))}
          onChange={({ detail }) => 
            updateData('circleInterests', detail.selectedOptions.map(opt => opt.value))
          }
          options={[
            { label: 'Newly Diagnosed Support', value: 'newly_diagnosed' },
            { label: 'Managing Anxiety Together', value: 'anxiety_management' },
            { label: 'Thyroid Warriors (Experienced)', value: 'thyroid_warriors' },
            { label: 'Self-Care Sunday', value: 'self_care' },
            { label: 'Workplace Wellness', value: 'workplace_wellness' },
            { label: 'Family & Relationships', value: 'family_relationships' },
            { label: 'Healthcare Advocacy', value: 'healthcare_advocacy' },
            { label: 'Nutrition & Lifestyle', value: 'nutrition_lifestyle' }
          ]}
          placeholder="Choose circles that interest you..."
        />
      </FormField>

      <FormField
        label="What type of content would you like to see more of?"
        description="This helps personalize your feed"
      >
        <Multiselect
          selectedOptions={data.contentPreferences.map(pref => ({ label: pref, value: pref }))}
          onChange={({ detail }) => 
            updateData('contentPreferences', detail.selectedOptions.map(opt => opt.value))
          }
          options={[
            { label: 'Educational articles about Graves Disease', value: 'educational_content' },
            { label: 'Personal stories and experiences', value: 'personal_stories' },
            { label: 'Comedy and stress relief content', value: 'comedy_content' },
            { label: 'Wellness product recommendations', value: 'product_recommendations' },
            { label: 'Self-care tips and techniques', value: 'self_care_tips' },
            { label: 'Healthcare advocacy resources', value: 'advocacy_resources' },
            { label: 'Community events and activities', value: 'community_events' }
          ]}
          placeholder="Select your content preferences..."
        />
      </FormField>

      <FormField
        label="Notification preferences"
        description="How would you like to stay updated?"
      >
        <Multiselect
          selectedOptions={data.notificationPreferences.map(pref => ({ label: pref, value: pref }))}
          onChange={({ detail }) => 
            updateData('notificationPreferences', detail.selectedOptions.map(opt => opt.value))
          }
          options={[
            { label: 'New replies to my posts', value: 'post_replies' },
            { label: 'New posts in my circles', value: 'circle_posts' },
            { label: 'Weekly community highlights', value: 'weekly_highlights' },
            { label: 'New wellness resources', value: 'new_resources' },
            { label: 'Community events', value: 'community_events' },
            { label: 'Product recommendations', value: 'product_recommendations' }
          ]}
          placeholder="Choose your notification preferences..."
        />
      </FormField>
    </SpaceBetween>
  );

  const getCurrentStepContent = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return renderStep1();
    }
  };

  return (
    <Container>
      <SpaceBetween size="l">
        <Box>
          <ProgressBar
            value={progressPercentage}
            label={`Step ${currentStep} of ${totalSteps}`}
            description="Complete your profile to get the most out of our community"
          />
        </Box>

        {error && (
          <Alert type="error" dismissible>
            {error}
          </Alert>
        )}

        {getCurrentStepContent()}

        <SpaceBetween direction="horizontal" size="s">
          {currentStep > 1 && (
            <Button
              variant="normal"
              onClick={handleBack}
              disabled={loading}
            >
              Back
            </Button>
          )}
          
          <Button
            variant="primary"
            onClick={handleNext}
            loading={loading}
            disabled={loading}
          >
            {currentStep === totalSteps ? 'Complete Setup' : 'Next'}
          </Button>

          <Button
            variant="link"
            onClick={onSkip}
            disabled={loading}
          >
            Skip for now
          </Button>
        </SpaceBetween>

        <Box textAlign="center" color="text-body-secondary" fontSize="body-s">
          You can always update these preferences later in your profile settings.
        </Box>
      </SpaceBetween>
    </Container>
  );
}