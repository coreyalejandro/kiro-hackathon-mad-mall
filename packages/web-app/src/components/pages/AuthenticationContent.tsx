'use client';

import { Container, ContentLayout } from '@cloudscape-design/components';
import PageHeader from '@/components/ui/PageHeader';
import { signInWithRedirect, signOut } from 'aws-amplify/auth';
import { env } from '@/lib/env';
import { useEffect } from 'react';
import AutoImageHero from '@/components/ui/AutoImageHero';

export function AuthenticationContent() {
  useEffect(() => {
    // Preload or verify auth domain/client id presence
  }, []);
  return (
    <>
      <AutoImageHero
        section="auth"
        title="Welcome Back"
        description="Sign in or create your account to join our community"
        eyebrow="Account"
        primaryAction={{ text: 'Sign In', onClick: () => signInWithRedirect(), iconName: 'lock' }}
        secondaryAction={{ text: 'Create Account', onClick: () => signInWithRedirect(), iconName: 'add-plus' }}
      />
      <ContentLayout header={<PageHeader title="Authentication" description="Sign in or create your account to join our community" primaryAction={{ text: 'Sign In', onClick: () => signInWithRedirect(), iconName: 'lock' }} secondaryAction={{ text: 'Create Account', onClick: () => signInWithRedirect(), iconName: 'add-plus' }} />}>
      <Container>
        <div>
          <p>Sign in to your account or create a new one to join our wellness community.</p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => signInWithRedirect()}>Sign In</button>
            <button onClick={() => signInWithRedirect()}>Create Account</button>
          </div>
        </div>
      </Container>
      </ContentLayout>
    </>
  );
}
