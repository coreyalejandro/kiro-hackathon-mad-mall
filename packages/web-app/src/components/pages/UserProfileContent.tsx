"use client";

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
  Button,
  Alert,
} from '@cloudscape-design/components';
import { api } from '@/lib/mock-api';
import { ActivityItem } from '@/lib/types';
import AutoImageHero from '@/components/ui/AutoImageHero';

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
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [profile, setProfile] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    bio: '',
  });
  const [notifications, setNotifications] = useState<NotificationPrefs>({
    email: false,
    sms: false,
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch community activity
    api.getCommunityActivity().then(res => setActivity(res.data));

    // Fetch user profile data
    api.getUserProfile().then(res => {
      setProfile(res.data);
      // Optionally set notifications based on user preferences
      setNotifications({
        email: res.data.notifications.email,
        sms: res.data.notifications.sms,
      });
    });
  }, []);

  const handleProfileSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Handle profile update logic here
    api.updateUserProfile(profile, notifications).then(() => {
      setMessage('Profile updated successfully!');
    }).catch(err => {
      setMessage('Failed to update profile.');
    });
  };

  return (
    <SpaceBetween size="l">
      <AutoImageHero
        section="profile"
        title="Your Profile"
        description="Manage your information and preferences"
        eyebrow="Account"
      />
      <Container>
        <Header variant="h1">User Profile</Header>
        <form onSubmit={handleProfileSubmit}>
          <FormField label="First Name">
            <Input
              value={profile.firstName}
              onChange={({ detail }) => setProfile({ ...profile, firstName: detail.value })}
              required
            />
          </FormField>
          <FormField label="Last Name">
            <Input
              value={profile.lastName}
              onChange={({ detail }) => setProfile({ ...profile, lastName: detail.value })}
              required
            />
          </FormField>
          <FormField label="Bio">
            <Textarea
              value={profile.bio}
              onChange={({ detail }) => setProfile({ ...profile, bio: detail.value })}
              resize="vertical"
            />
          </FormField>
          <FormField label="Notification Preferences">
            <Toggle
              checked={notifications.email}
              onChange={({ detail }) => setNotifications({ ...notifications, email: detail.checked })}
            >
              Email Notifications
            </Toggle>
            <Toggle
              checked={notifications.sms}
              onChange={({ detail }) => setNotifications({ ...notifications, sms: detail.checked })}
            >
              SMS Notifications
            </Toggle>
          </FormField>
          <Button type="submit">Save Changes</Button>
        </form>

        {message && (
          <Alert type="success" onDismiss={() => setMessage('')}>
            {message}
          </Alert>
        )}

        <ContentLayout header={<Header variant="h2">Community Activity</Header>}>
          <ul>
            {activity.map(a => (
              <li key={a.id}>{a.content}</li>
            ))}
          </ul>
        </ContentLayout>
      </Container>
    </SpaceBetween>
  );
}
