'use client';

import { Container, Header, ContentLayout } from '@cloudscape-design/components';
import { signInWithRedirect, signOut } from 'aws-amplify/auth';
import { env } from '@/lib/env';
import { useEffect } from 'react';

export function AuthenticationContent() {
  useEffect(() => {
    // Preload or verify auth domain/client id presence
  }, []);
  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          description="Sign in or create your account to join our community"
        >
          Authentication
        </Header>
      }
    >
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
  );
}
