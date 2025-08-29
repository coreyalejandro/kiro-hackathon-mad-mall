import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import '@cloudscape-design/global-styles/index.css';
import './styles/kadir-nelson-theme.css';
import './styles/hero-sections.css';
import { AppLayout, TopNavigation, SideNavigation } from '@cloudscape-design/components';
import Concourse from './pages/Concourse';
import PeerCircles from './pages/PeerCircles';
import ComedyLounge from './pages/ComedyLounge';
import Marketplace from './pages/Marketplace';
import ResourceHub from './pages/ResourceHub';
import StoryBooth from './pages/StoryBooth';

const navigationItems = [
  { type: 'link', text: 'Concourse', href: '/' },
  { type: 'divider' },
  { type: 'link', text: 'Peer Circles', href: '/circles' },
  { type: 'link', text: 'Comedy Lounge', href: '/comedy' },
  { type: 'link', text: 'Story Booth', href: '/stories' },
  { type: 'divider' },
  { type: 'link', text: 'Marketplace', href: '/marketplace' },
  { type: 'link', text: 'Resource Hub', href: '/resources' },
];

function App() {
  return (
    <Router>
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
              text: 'Settings',
              href: '/settings',
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
          content={
            <Routes>
              <Route path="/" element={<Concourse />} />
              <Route path="/circles" element={<PeerCircles />} />
              <Route path="/comedy" element={<ComedyLounge />} />
              <Route path="/stories" element={<StoryBooth />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/resources" element={<ResourceHub />} />
            </Routes>
          }
          toolsHide
          navigationHide={false}
        />
      </div>
    </Router>
  );
}

export default App;