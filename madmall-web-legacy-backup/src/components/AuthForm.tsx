import { useState } from 'react';
import {
  Container,
  Header,
  FormField,
  Input,
  Button,
  SpaceBetween,
  Box,
  Alert,
  Link,
  Checkbox
} from '@cloudscape-design/components';

interface AuthFormProps {
  mode: 'login' | 'register';
  onSubmit: (data: AuthFormData) => Promise<void>;
  onModeChange: (mode: 'login' | 'register') => void;
  loading?: boolean;
  error?: string;
}

export interface AuthFormData {
  email: string;
  password: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  agreeToTerms?: boolean;
}

export default function AuthForm({ mode, onSubmit, onModeChange, loading = false, error }: AuthFormProps) {
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    agreeToTerms: false
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (mode === 'register') {
      // First name validation
      if (!formData.firstName?.trim()) {
        errors.firstName = 'First name is required';
      }

      // Last name validation
      if (!formData.lastName?.trim()) {
        errors.lastName = 'Last name is required';
      }

      // Confirm password validation
      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }

      // Terms agreement validation
      if (!formData.agreeToTerms) {
        errors.agreeToTerms = 'You must agree to the terms and conditions';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err) {
      // Error handling is done by parent component
    }
  };

  const handleInputChange = (field: keyof AuthFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Container>
      <SpaceBetween size="l">
        <Box textAlign="center">
          <Header variant="h1">
            {mode === 'login' ? 'Welcome Back, Sister' : 'Join Our Sisterhood'}
          </Header>
          <Box color="text-body-secondary">
            {mode === 'login' 
              ? 'Sign in to continue your wellness journey with us'
              : 'Create your account to access our supportive community'
            }
          </Box>
        </Box>

        {error && (
          <Alert type="error" dismissible>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <SpaceBetween size="m">
            {mode === 'register' && (
              <>
                <FormField
                  label="First Name"
                  errorText={validationErrors.firstName}
                  description="How would you like us to address you?"
                >
                  <Input
                    value={formData.firstName || ''}
                    onChange={({ detail }) => handleInputChange('firstName', detail.value)}
                    placeholder="Enter your first name"
                    invalid={!!validationErrors.firstName}
                  />
                </FormField>

                <FormField
                  label="Last Name"
                  errorText={validationErrors.lastName}
                >
                  <Input
                    value={formData.lastName || ''}
                    onChange={({ detail }) => handleInputChange('lastName', detail.value)}
                    placeholder="Enter your last name"
                    invalid={!!validationErrors.lastName}
                  />
                </FormField>
              </>
            )}

            <FormField
              label="Email Address"
              errorText={validationErrors.email}
              description="We'll use this to send you important updates and verify your account"
            >
              <Input
                value={formData.email}
                onChange={({ detail }) => handleInputChange('email', detail.value)}
                placeholder="Enter your email address"
                type="email"
                invalid={!!validationErrors.email}
              />
            </FormField>

            <FormField
              label="Password"
              errorText={validationErrors.password}
              description={mode === 'register' ? "Must be at least 8 characters with uppercase, lowercase, and number" : undefined}
            >
              <Input
                value={formData.password}
                onChange={({ detail }) => handleInputChange('password', detail.value)}
                placeholder="Enter your password"
                type="password"
                invalid={!!validationErrors.password}
              />
            </FormField>

            {mode === 'register' && (
              <>
                <FormField
                  label="Confirm Password"
                  errorText={validationErrors.confirmPassword}
                >
                  <Input
                    value={formData.confirmPassword || ''}
                    onChange={({ detail }) => handleInputChange('confirmPassword', detail.value)}
                    placeholder="Confirm your password"
                    type="password"
                    invalid={!!validationErrors.confirmPassword}
                  />
                </FormField>

                <FormField errorText={validationErrors.agreeToTerms}>
                  <Checkbox
                    checked={formData.agreeToTerms || false}
                    onChange={({ detail }) => handleInputChange('agreeToTerms', detail.checked)}
                  >
                    I agree to the{' '}
                    <Link href="/terms" external>
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" external>
                      Privacy Policy
                    </Link>
                  </Checkbox>
                </FormField>
              </>
            )}

            <SpaceBetween direction="horizontal" size="s">
              <Button
                variant="primary"
                loading={loading}
                disabled={loading}
              >
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </Button>
              
              {mode === 'login' && (
                <Button
                  variant="link"
                  onClick={() => console.log('Forgot password')}
                >
                  Forgot Password?
                </Button>
              )}
            </SpaceBetween>
          </SpaceBetween>
        </form>

        <Box textAlign="center">
          <SpaceBetween size="s">
            <Box>
              {mode === 'login' 
                ? "Don't have an account yet?" 
                : "Already have an account?"
              }
            </Box>
            <Button
              variant="link"
              onClick={() => onModeChange(mode === 'login' ? 'register' : 'login')}
            >
              {mode === 'login' ? 'Join Our Community' : 'Sign In Instead'}
            </Button>
          </SpaceBetween>
        </Box>
      </SpaceBetween>
    </Container>
  );
}