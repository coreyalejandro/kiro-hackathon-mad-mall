import { useState } from 'react';
import {
  Container,
  Header,
  SpaceBetween,
  Box
} from '@cloudscape-design/components';
import HeroSection from '../components/HeroSection';
import AuthForm, { type AuthFormData } from '../components/AuthForm';
import OnboardingFlow from '../components/OnboardingFlow';
import ToastNotification from '../components/ToastNotification';

type AuthStep = 'login' | 'register' | 'onboarding' | 'complete';

export default function Authentication() {
  const [currentStep, setCurrentStep] = useState<AuthStep>('login');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'info' | 'warning' }>({ show: false, message: '', type: 'info' });
  const [, setUserEmail] = useState('');

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ show: true, message, type });
  };

  const handleAuthSubmit = async (data: AuthFormData) => {
    setLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (authMode === 'register') {
        // Simulate successful registration
        setUserEmail(data.email);
        showToast('Account created successfully! Please check your email for verification.', 'success');
        
        // For demo purposes, go directly to onboarding
        setTimeout(() => {
          setCurrentStep('onboarding');
        }, 2000);
      } else {
        // Simulate successful login
        setUserEmail(data.email);
        showToast('Welcome back! Redirecting to your dashboard...', 'success');
        
        // For demo purposes, simulate redirect to main app
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      }
    } catch (err) {
      setError(authMode === 'register' 
        ? 'Failed to create account. Please try again.' 
        : 'Invalid email or password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = async (_data: any) => {
    setLoading(true);
    setError('');

    try {
      // Simulate API call to save onboarding data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showToast('Welcome to our sisterhood! Your profile has been set up.', 'success');
      setCurrentStep('complete');
      
      // Redirect to main app after a delay
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    } catch (err) {
      setError('Failed to save your preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingSkip = () => {
    showToast('You can complete your profile setup anytime in settings.', 'info');
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
  };

  const handleModeChange = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setError('');
  };

  const floatingElements = [
    <div style={{ fontSize: '2rem', opacity: 0.6 }}>🌟</div>,
    <div style={{ fontSize: '1.5rem', opacity: 0.7 }}>💜</div>,
    <div style={{ fontSize: '1.8rem', opacity: 0.5 }}>🤝</div>
  ];

  const renderAuthStep = () => {
    switch (currentStep) {
      case 'login':
      case 'register':
        return (
          <div>
            <HeroSection
              pageName="Authentication"
              title={authMode === 'login' ? 'Welcome Back, Sister' : 'Join Our Sisterhood'}
              subtitle={authMode === 'login' 
                ? 'Sign in to continue your wellness journey with our supportive community of Black women living with Graves Disease.'
                : 'Create your account to access our safe space for sisterhood, support, and healing. You belong here.'
              }
              primaryCTA={{
                text: authMode === 'login' ? 'Sign In' : 'Get Started',
                onClick: () => document.getElementById('auth-form')?.scrollIntoView({ behavior: 'smooth' }),
                icon: authMode === 'login' ? '🔑' : '✨'
              }}
              secondaryCTA={{
                text: 'Learn More',
                onClick: () => console.log('Learn more about our community'),
                icon: '💜'
              }}
              backgroundGradient="linear-gradient(135deg, var(--color-dusty-rose), var(--color-golden-ochre), var(--color-sage-green))"
              floatingElements={floatingElements}
              imageContent={
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                    {authMode === 'login' ? '🤗' : '🌟'}
                  </div>
                  <div style={{ fontSize: '1.2rem', opacity: 0.9 }}>
                    {authMode === 'login' 
                      ? 'Welcome Home<br />Your Community Awaits'
                      : 'Your Journey Starts Here<br />Join Our Sisterhood'
                    }
                  </div>
                </div>
              }
            />
            
            <SpaceBetween size="l">
              <ToastNotification
                message={toast.message}
                type={toast.type}
                show={toast.show}
                onClose={() => setToast({ ...toast, show: false })}
              />

              <div id="auth-form">
                <AuthForm
                  mode={authMode}
                  onSubmit={handleAuthSubmit}
                  onModeChange={handleModeChange}
                  loading={loading}
                  error={error}
                />
              </div>

              <Container>
                <Box textAlign="center" padding="l" className="kadir-nelson-secondary">
                  <SpaceBetween size="s">
                    <Header variant="h3">Why Join Our Community?</Header>
                    <Box>
                      <SpaceBetween size="xs">
                        <Box>🤝 Connect with Black women who truly understand your journey</Box>
                        <Box>💚 Access culturally grounded wellness resources and support</Box>
                        <Box>😂 Find stress relief through therapeutic comedy and community</Box>
                        <Box>📚 Learn from shared experiences and expert-curated content</Box>
                        <Box>🛍️ Discover Black-owned wellness brands that support your health</Box>
                        <Box>🔒 Enjoy a safe, private space designed with your privacy in mind</Box>
                      </SpaceBetween>
                    </Box>
                  </SpaceBetween>
                </Box>
              </Container>
            </SpaceBetween>
          </div>
        );

      case 'onboarding':
        return (
          <div>
            <HeroSection
              pageName="Welcome"
              title="Let's Personalize Your Experience"
              subtitle="Help us create a space that feels like home to you. This quick setup ensures you get the most relevant support and connections."
              primaryCTA={{
                text: 'Complete Setup',
                onClick: () => document.getElementById('onboarding-form')?.scrollIntoView({ behavior: 'smooth' }),
                icon: '✨'
              }}
              secondaryCTA={{
                text: 'Skip for Now',
                onClick: handleOnboardingSkip,
                icon: '⏭️'
              }}
              backgroundGradient="linear-gradient(135deg, var(--color-sage-green), var(--color-golden-ochre), var(--color-dusty-rose))"
              floatingElements={floatingElements}
              imageContent={
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌱</div>
                  <div style={{ fontSize: '1.2rem', opacity: 0.9 }}>
                    Growing Together<br />
                    Personalized Support
                  </div>
                </div>
              }
            />
            
            <SpaceBetween size="l">
              <ToastNotification
                message={toast.message}
                type={toast.type}
                show={toast.show}
                onClose={() => setToast({ ...toast, show: false })}
              />

              <div id="onboarding-form">
                <OnboardingFlow
                  onComplete={handleOnboardingComplete}
                  onSkip={handleOnboardingSkip}
                  loading={loading}
                  error={error}
                />
              </div>
            </SpaceBetween>
          </div>
        );

      case 'complete':
        return (
          <Container>
            <SpaceBetween size="xl">
              <Box textAlign="center" padding="xl">
                <SpaceBetween size="l">
                  <Box fontSize="display-l">🎉</Box>
                  <Header variant="h1">Welcome to Our Sisterhood!</Header>
                  <Box fontSize="heading-m" color="text-body-secondary">
                    Your account has been set up successfully. You're now part of a supportive community of Black women who understand your journey.
                  </Box>
                  <Box padding="l" className="kadir-nelson-gradient-warm">
                    <SpaceBetween size="s">
                      <Header variant="h3">What's Next?</Header>
                      <Box>
                        <SpaceBetween size="xs">
                          <Box>✨ Explore peer circles and find your community</Box>
                          <Box>📖 Share your story or read others' experiences</Box>
                          <Box>😂 Visit the Comedy Lounge for stress relief</Box>
                          <Box>📚 Browse wellness resources curated for you</Box>
                          <Box>🛍️ Discover Black-owned wellness products</Box>
                        </SpaceBetween>
                      </Box>
                    </SpaceBetween>
                  </Box>
                  <Box color="text-body-secondary">
                    Redirecting you to your new community home...
                  </Box>
                </SpaceBetween>
              </Box>
            </SpaceBetween>
          </Container>
        );

      default:
        return null;
    }
  };

  return renderAuthStep();
}