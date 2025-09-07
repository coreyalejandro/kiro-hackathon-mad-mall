import { Metadata } from 'next';
import { UserProfileContent } from '@/components/pages/UserProfileContent';

export const metadata: Metadata = {
  title: 'Profile - MADMall Social Wellness Hub',
  description: 'Manage your profile and account settings',
};

export default function ProfilePage() {
  return <UserProfileContent />;
}