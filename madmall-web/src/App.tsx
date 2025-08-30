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
import Authentication from './pages/Authentication';
import UserProfile from './components/UserProfile';

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
          content={
            <Routes>
              <Route path="/" element={<Concourse />} />
              <Route path="/circles" element={<PeerCircles />} />
              <Route path="/comedy" element={<ComedyLounge />} />
              <Route path="/stories" element={<StoryBooth />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/resources" element={<ResourceHub />} />
              <Route path="/auth" element={<Authentication />} />
              <Route path="/profile" element={
                <UserProfile
                  userData={{
                    firstName: 'Demo',
                    lastName: 'User',
                    email: 'demo@example.com',
                    bio: 'Welcome to our community!',
                    profileVisibility: 'circles_only',
                    showRealName: true,
                    allowDirectMessages: true,
                    shareHealthJourney: true,
                    primaryGoals: ['emotional_support', 'community_connection'],
                    comfortLevel: 'somewhat_comfortable',
                    culturalBackground: ['african_american'],
                    communicationStyle: 'direct_supportive',
                    diagnosisStage: 'managing_well',
                    supportNeeds: ['emotional_support', 'stress_management'],
                    emailNotifications: true,
                    pushNotifications: false,
                    weeklyDigest: true,
                    circleNotifications: true,
                    contentPreferences: ['personal_stories', 'self_care_tips'],
                    circleInterests: ['anxiety_management', 'self_care']
                  }}
                  onSave={async (data) => {
                    console.log('Saving profile data:', data);
                    // Simulate API call
                    await new Promise(resolve => setTimeout(resolve, 1000));
                  }}
                  onDeleteAccount={async () => {
                    console.log('Deleting account');
                    // Simulate API call
                    await new Promise(resolve => setTimeout(resolve, 1000));
                  }}
                />
              } />
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