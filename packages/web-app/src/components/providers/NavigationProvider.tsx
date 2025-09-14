'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import { env } from '@/lib/env';

interface NavigationContextType {
  currentPath: string;
  setCurrentPath: (path: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [currentPath, setCurrentPath] = useState('/');

  useEffect(() => {
    // Configure Amplify Auth (Cognito Hosted UI) only when all required vars are present
    const userPoolId = process.env.NEXT_PUBLIC_USER_POOL_ID;
    const hasAuthConfig = Boolean(env.AUTH_DOMAIN && env.AUTH_CLIENT_ID && userPoolId);
    if (hasAuthConfig) {
      try {
        Amplify.configure({
          Auth: {
            Cognito: {
              userPoolClientId: env.AUTH_CLIENT_ID,
              userPoolId,
              loginWith: {
                oauth: {
                  domain: env.AUTH_DOMAIN.replace(/^https?:\/\//, ''),
                  scopes: ['email', 'openid', 'profile'],
                  redirectSignIn: `${window.location.origin}/auth/callback`,
                  redirectSignOut: `${window.location.origin}/auth/logout`,
                  responseType: 'code',
                },
              },
            },
          },
        });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Amplify configuration failed', e);
      }
    } else {
      // eslint-disable-next-line no-console
      console.info('Auth not configured: missing NEXT_PUBLIC_AUTH_DOMAIN / NEXT_PUBLIC_AUTH_CLIENT_ID / NEXT_PUBLIC_USER_POOL_ID');
    }
  }, []);

  return (
    <NavigationContext.Provider value={{ currentPath, setCurrentPath }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
