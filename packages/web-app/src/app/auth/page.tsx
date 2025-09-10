import { Metadata } from 'next';
import { AuthenticationContent } from '@/components/pages/AuthenticationContent';
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Authentication - MADMall Social Wellness Hub',
  description: 'Sign in or create your account to join our community',
};

export default function AuthPage() {
  return <AuthenticationContent />;
}