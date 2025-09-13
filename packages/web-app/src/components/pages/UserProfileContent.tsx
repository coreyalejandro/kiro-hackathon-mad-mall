'use client';

import { useEffect, useState } from 'react';
import {
  Container,
  Header,
  ContentLayout,
  SpaceBetween,
  FormField,
  Input,
  Textarea,
  Toggle,
  RadioGroup,
  Button,
  Alert
} from '@cloudscape-design/components';

interface ProfileData {
  firstName: string;
  lastName: string;
  bio: string;
}

interface NotificationPrefs {
  email: boolean;
  sms: boolean;
}

export function UserProfileContent() {
  const [profile, setProfile] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    bio: ''
  });
  const [notifications, setNotifications] = useState<NotificationPrefs>({
    email: false,
    sms: false
  });
  const [visibility, setVisibility] = useState('public');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [p, n, pr] = await Promise.all([
          fetch('/api/profile').then(r => r.json()),
          fetch('/api/notifications').then(r => r.json()),
          fetch('/api/privacy').then(r => r.json())
        ]);
        setProfile(p);
        setNotifications(n);
        setVisibility(pr.visibility);
      } catch (err) {
        // ignore load errors in mock implementation
      }
    }
    load();
  }, []);

  const handleProfileChange = (field: keyof ProfileData, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });
    setMessage('Profile updated');
  };

  const handleNotificationsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notifications)
    });
    setMessage('Notification preferences saved');
  };

  const handlePrivacySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/privacy', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visibility })
    });
    setMessage('Privacy settings updated');
  };

  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          description="Manage your profile and account settings"
        >
          User Profile
        </Header>
      }
    >
      <SpaceBetween size="l">
        <Container>
          <div className="hero-section hero-contained">
            <div className="hero-container">
              <div className="hero-main-grid">
                <div className="hero-content">
                  <div className="hero-page-name">Account Management</div>
                  <h1 className="hero-title">Your Profile</h1>
                  <p className="hero-subtitle">
                    Manage your account settings, preferences, and community profile.
                  </p>
                  <div className="hero-cta-group">
                    <button className="hero-cta hero-cta-primary">
                      <span className="hero-cta-icon">⚙️</span>
                      Edit Profile
                    </button>
                    <button className="hero-cta hero-cta-secondary">
                      <span className="hero-cta-icon">🔒</span>
                      Privacy Settings
                    </button>
                  </div>
                </div>
                <div className="hero-visual-container">
                  <div className="hero-image-container">
                    <div className="hero-image-layer hero-image-main">
                      <div className="hero-default-content">
                        <div className="hero-default-icon">👤</div>
                        <div className="hero-default-text">
                          Your<br />Profile
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>

        {message && (
          <Alert type="success" onDismiss={() => setMessage('')}>
            {message}
          </Alert>
        )}

        <Container header={<Header variant="h2">Edit Profile</Header>}>
          <form onSubmit={handleProfileSubmit}>
            <SpaceBetween size="m">
              <FormField label="First Name">
                <Input
                  value={profile.firstName}
                  onChange={({ detail }) => handleProfileChange('firstName', detail.value)}
                />
              </FormField>
              <FormField label="Last Name">
                <Input
                  value={profile.lastName}
                  onChange={({ detail }) => handleProfileChange('lastName', detail.value)}
                />
              </FormField>
              <FormField label="Bio">
                <Textarea
                  value={profile.bio}
                  onChange={({ detail }) => handleProfileChange('bio', detail.value)}
                />
              </FormField>
              <Button variant="primary" formAction="submit">
                Save Profile
              </Button>
            </SpaceBetween>
          </form>
        </Container>

        <Container header={<Header variant="h2">Notification Preferences</Header>}>
          <form onSubmit={handleNotificationsSubmit}>
            <SpaceBetween size="m">
              <FormField label="Email Notifications">
                <Toggle
                  checked={notifications.email}
                  onChange={({ detail }) =>
                    setNotifications(prev => ({ ...prev, email: detail.checked }))
                  }
                />
              </FormField>
              <FormField label="SMS Notifications">
                <Toggle
                  checked={notifications.sms}
                  onChange={({ detail }) =>
                    setNotifications(prev => ({ ...prev, sms: detail.checked }))
                  }
                />
              </FormField>
              <Button variant="primary" formAction="submit">
                Save Preferences
              </Button>
            </SpaceBetween>
          </form>
        </Container>

        <Container header={<Header variant="h2">Privacy Settings</Header>}>
          <form onSubmit={handlePrivacySubmit}>
            <SpaceBetween size="m">
              <FormField label="Profile Visibility">
                <RadioGroup
                  value={visibility}
                  onChange={({ detail }) => setVisibility(detail.value)}
                  items={[
                    { value: 'public', label: 'Public' },
                    { value: 'circles', label: 'Circles only' },
                    { value: 'private', label: 'Private' }
                  ]}
                />
              </FormField>
              <Button variant="primary" formAction="submit">
                Save Privacy
              </Button>
            </SpaceBetween>
          </form>
        </Container>
      </SpaceBetween>
    </ContentLayout>
  );
}
