'use client';

import { usePathname, useRouter } from 'next/navigation';
import { SideNavigation } from '@cloudscape-design/components';

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

export function CustomSideNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  // Transform navigation items to include active state
  const itemsWithActiveState = navigationItems.map((item) => {
    if (item.type === 'link') {
      return {
        ...item,
        active: pathname === item.href,
      };
    }
    return item;
  });

  return (
    <SideNavigation
      header={{ text: 'Mall Sections', href: '/' }}
      items={itemsWithActiveState}
      onFollow={(event) => {
        // Prevent default navigation behavior
        event.preventDefault();
        
        // Find the clicked item
        const clickedItem = navigationItems.find(
          (item) => item.type === 'link' && item.text === event.detail.text
        );
        
        if (clickedItem && clickedItem.type === 'link') {
          // Use Next.js router for client-side navigation
          router.push(clickedItem.href!);
        }
      }}
    />
  );
}
