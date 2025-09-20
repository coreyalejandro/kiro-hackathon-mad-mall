'use client';

import { Container, ContentLayout, SpaceBetween, Button, Header } from '@cloudscape-design/components';
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
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="normal" iconName="add-plus" onClick={() => signInWithRedirect()}>Create Account</Button>
              <Button variant="primary" iconName="user-profile" onClick={() => signInWithRedirect()}>Sign In</Button>
            </SpaceBetween>
          }
        >
          Authentication
        </Header>
      }
    >
      <Container>
        <p>Sign in to your account or create a new one to join our wellness community.</p>
        <SpaceBetween direction="horizontal" size="s">
          <Button variant="primary" onClick={() => signInWithRedirect()}>Sign In</Button>
          <Button variant="normal" onClick={() => signInWithRedirect()}>Create Account</Button>
        </SpaceBetween>
      </Container>
    </ContentLayout>
  );
}
