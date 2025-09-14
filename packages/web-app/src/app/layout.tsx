import type { Metadata } from 'next';
import '@cloudscape-design/global-styles/index.css';
import { AppLayout, TopNavigation, SideNavigation } from '@cloudscape-design/components';
import { NavigationProvider } from '@/components/providers/NavigationProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { env } from '@/lib/env';

void env; // trigger environment validation on bootstrap

export const metadata: Metadata = {
  title: 'AIme - MADMall Social Wellness Hub',
  description: 'A culturally-centered social wellness platform for mental health support and community connection',
  keywords: ['mental health', 'wellness', 'community', 'support', 'cultural'],
  authors: [{ name: 'MADMall Team' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

const navigationItems = [
  { type: 'link' as const, text: 'Concourse', href: '/' },
  { type: 'divider' as const },
  { type: 'link' as const, text: 'Peer Circles', href: '/circles' },
  { type: 'link' as const, text: 'Comedy Lounge', href: '/comedy' },
  { type: 'link' as const, text: 'Story Booth', href: '/stories' },
  { type: 'divider' as const },
  { type: 'link' as const, text: 'Marketplace', href: '/marketplace' },
  { type: 'link' as const, text: 'Resource Hub', href: '/resources' },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <NavigationProvider>
            <div id="app">
            <TopNavigation
              identity={{
                href: '/',
                title: 'AIme - MADMall Social Wellness Hub',
                logo: {
                  src: '/logo.svg',
                  alt: 'AIme Logo'
                }
              }}
              utilities={[
                {
                  type: 'button',
                  text: 'Profile',
                  href: '/profile',
                  external: false
                },
                {
                  type: 'button',
                  text: 'Sign In',
                  href: '/auth',
                  external: false
                }
              ]}
            />

            <AppLayout
              navigation={
                <SideNavigation
                  header={{ text: 'Mall Sections', href: '/' }}
                  items={navigationItems}
                />
              }
              content={children}
              toolsHide
              navigationHide={false}
            />
          </div>
        </NavigationProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
