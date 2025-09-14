'use client';

import React, { useState } from 'react';
import {
  Container,
  Header,
  FormField,
  Input,
  Button,
  SpaceBetween,
  Box,
  Alert,
  Textarea,
  RadioGroup,
  Multiselect,
  Tabs,
  Toggle
} from '@cloudscape-design/components';
import { 
  User, 
  UserProfile as UserProfileType, 
  UserPreferences,
  DiagnosisStage,
  CommunicationStyle,
  UserGoal,
  SupportNeed
} from '@madmall/shared-types';

interface UserProfileData {
  // Basic Info
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  
  // Privacy Settings
  profileVisibility: string;
  showRealName: boolean;
  allowDirectMessages: boolean;
  shareHealthJourney: boolean;
  
  // Onboarding Data
  primaryGoals: UserGoal[];
  comfortLevel: string;
  culturalBackground: string[];
  communicationStyle: CommunicationStyle;
  diagnosisStage: DiagnosisStage;
  supportNeeds: SupportNeed[];
  
  // Notification Settings
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyDigest: boolean;
  circleNotifications: boolean;
  
  // Content Preferences
  contentPreferences: string[];
  circleInterests: string[];
}

interface UserProfileProps {
  userData: UserProfileData;
  onSave: (data: UserProfileData) => Promise<void>;
  onDeleteAccount: () => Promise<void>;
  loading?: boolean;
  error?: string;
}

export default function UserProfile({ 
  userData, 
  onSave, 
  onDeleteAccount, 
  loading = false, 
  error 
}: UserProfileProps) {
  const [data, setData] = useState<UserProfileData>(userData);
  const [activeTab, setActiveTab] = useState('profile');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const updateData = (field: keyof UserProfileData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await onSave(data);
    } catch (err) {
      // Error handling is done by parent component
    }
  };

  const renderProfileTab = () => (
    <SpaceBetween size="l">
      <Header variant="h3">Profile Information</Header>
      
      <FormField label="First Name">
        <Input
          value={data.firstName}
          onChange={({ detail }) => updateData('firstName', detail.value)}
          placeholder="Enter your first name"
        />
      </FormField>

      <FormField label="Last Name">
        <Input
          value={data.lastName}
          onChange={({ detail }) => updateData('lastName', detail.value)}
          placeholder="Enter your last name"
        />
      </FormField>

      <FormField 
        label="Email Address"
        description="This is used for account verification and important notifications"
      >
        <Input
          value={data.email}
          onChange={({ detail }) => updateData('email', detail.value)}
          placeholder="Enter your email address"
          type="email"
        />
      </FormField>

      <FormField 
        label="Bio"
        description="Share a little about yourself with the community (optional)"
      >
        <Textarea
          value={data.bio}
          onChange={({ detail }) => updateData('bio', detail.value)}
          placeholder="Tell us about your journey, interests, or what brings you to our community..."
          rows={4}
        />
      </FormField>

      <Header variant="h3">Health Journey</Header>
      
      <FormField label="Where are you in your Graves Disease journey?">
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

      <FormField label="Primary goals for being in our community">
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
    </SpaceBetween>
  );

  const renderPrivacyTab = () => (
    <SpaceBetween size="l">
      <Header variant="h3">Privacy & Safety Settings</Header>
      
      <Alert type="info">
        Your privacy and safety are our top priorities. You have full control over what you share and who can see it.
      </Alert>

      <FormField 
        label="Profile Visibility"
        description="Who can see your profile information?"
      >
        <RadioGroup
          value={data.profileVisibility}
          onChange={({ detail }) => updateData('profileVisibility', detail.value)}
          items={[
            { value: 'public', label: 'Public - Anyone in the community can see my profile' },
            { value: 'circles_only', label: 'Circles only - Only members of my circles can see my profile' },
            { value: 'private', label: 'Private - Only I can see my full profile information' }
          ]}
        />
      </FormField>

      <SpaceBetween size="m">
        <FormField>
          <Toggle
            checked={data.showRealName}
            onChange={({ detail }) => updateData('showRealName', detail.checked)}
          >
            Show my real name in the community
          </Toggle>
        </FormField>

        <FormField>
          <Toggle
            checked={data.allowDirectMessages}
            onChange={({ detail }) => updateData('allowDirectMessages', detail.checked)}
          >
            Allow other members to send me direct messages
          </Toggle>
        </FormField>

        <FormField>
          <Toggle
            checked={data.shareHealthJourney}
            onChange={({ detail }) => updateData('shareHealthJourney', detail.checked)}
          >
            Include my health journey stage in my profile
          </Toggle>
        </FormField>
      </SpaceBetween>

      <Header variant="h3">Data & Account</Header>
      
      <Box padding="l"
        style={{
          border: '1px solid var(--color-border-divider-default, #e9ebed)',
          borderRadius: 8,
          background: 'var(--color-background-container-content, #fff)'
        }}
      >
        <SpaceBetween size="s">
          <Header variant="h3">Account Actions</Header>
          <Box>
            <SpaceBetween direction="horizontal" size="s">
              <Button variant="normal">
                Download My Data
              </Button>
              <Button variant="normal">
                Export Profile
              </Button>
            </SpaceBetween>
          </Box>
        </SpaceBetween>
      </Box>

      <Box padding="l"
        style={{
          border: '1px solid var(--color-border-divider-default, #e9ebed)',
          borderRadius: 8,
          background: 'var(--color-background-warning, #fff7ed)'
        }}
      >
        <SpaceBetween size="s">
          <Header variant="h3">Danger Zone</Header>
          <Box>
            If you no longer want to be part of our community, you can delete your account. This action cannot be undone.
          </Box>
          {!showDeleteConfirm ? (
            <Button 
              variant="normal"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete Account
            </Button>
          ) : (
            <SpaceBetween size="s">
              <Alert type="warning">
                Are you sure you want to delete your account? This will permanently remove all your data, posts, and connections.
              </Alert>
              <SpaceBetween direction="horizontal" size="s">
                <Button 
                  variant="primary"
                  onClick={onDeleteAccount}
                  loading={loading}
                >
                  Yes, Delete My Account
                </Button>
                <Button 
                  variant="normal"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
              </SpaceBetween>
            </SpaceBetween>
          )}
        </SpaceBetween>
      </Box>
    </SpaceBetween>
  );

  const renderNotificationsTab = () => (
    <SpaceBetween size="l">
      <Header variant="h3">Notification Preferences</Header>
      
      <Box>
        <SpaceBetween size="m">
          <FormField>
            <Toggle
              checked={data.emailNotifications}
              onChange={({ detail }) => updateData('emailNotifications', detail.checked)}
            >
              Email notifications for important updates
            </Toggle>
          </FormField>

          <FormField>
            <Toggle
              checked={data.pushNotifications}
              onChange={({ detail }) => updateData('pushNotifications', detail.checked)}
            >
              Push notifications for real-time updates
            </Toggle>
          </FormField>

          <FormField>
            <Toggle
              checked={data.weeklyDigest}
              onChange={({ detail }) => updateData('weeklyDigest', detail.checked)}
            >
              Weekly digest of community highlights
            </Toggle>
          </FormField>

          <FormField>
            <Toggle
              checked={data.circleNotifications}
              onChange={({ detail }) => updateData('circleNotifications', detail.checked)}
            >
              Notifications when someone posts in my circles
            </Toggle>
          </FormField>
        </SpaceBetween>
      </Box>
    </SpaceBetween>
  );

  const renderPreferencesTab = () => (
    <SpaceBetween size="l">
      <Header variant="h3">Content & Community Preferences</Header>
      
      <FormField label="Circle interests">
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

      <FormField label="Content preferences">
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

      <FormField label="Communication style preference">
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
    </SpaceBetween>
  );

  return (
    <Container>
      <SpaceBetween size="l">
        <Header variant="h1">Profile Settings</Header>
        
        {error && (
          <Alert type="error" dismissible>
            {error}
          </Alert>
        )}

        <Tabs
          activeTabId={activeTab}
          onChange={({ detail }) => setActiveTab(detail.activeTabId)}
          tabs={[
            {
              id: 'profile',
              label: 'Profile',
              content: renderProfileTab()
            },
            {
              id: 'privacy',
              label: 'Privacy & Safety',
              content: renderPrivacyTab()
            },
            {
              id: 'notifications',
              label: 'Notifications',
              content: renderNotificationsTab()
            },
            {
              id: 'preferences',
              label: 'Preferences',
              content: renderPreferencesTab()
            }
          ]}
        />

        <SpaceBetween direction="horizontal" size="s">
          <Button
            variant="primary"
            onClick={handleSave}
            loading={loading}
            disabled={loading}
          >
            Save Changes
          </Button>
          <Button
            variant="normal"
            onClick={() => setData(userData)}
            disabled={loading}
          >
            Reset Changes
          </Button>
        </SpaceBetween>
      </SpaceBetween>
    </Container>
  );
}
