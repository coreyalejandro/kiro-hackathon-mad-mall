import { Construct } from 'constructs';
import {
  UserPool,
  UserPoolClient,
  UserPoolDomain,
  VerificationEmailStyle,
  Mfa,
  AccountRecovery,
  UserPoolIdentityProviderGoogle,
  UserPoolIdentityProviderFacebook,
  UserPoolIdentityProviderAmazon,
  ProviderAttribute,
  AttributeMapping,
  OAuthScope,
  OAuthFlows,
  UserPoolClientIdentityProvider,
  CfnUserPoolGroup,
} from 'aws-cdk-lib/aws-cognito';
import {
  IdentityPool,
  UserPoolAuthenticationProvider,
} from '@aws-cdk/aws-cognito-identitypool-alpha';
import {
  Role,
  ServicePrincipal,
  PolicyStatement,
  Effect,
  FederatedPrincipal,
} from 'aws-cdk-lib/aws-iam';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { RemovalPolicy, Tags } from 'aws-cdk-lib';

export interface AuthenticationConstructProps {
  /**
   * Environment name (dev, staging, prod)
   */
  environment: string;
  
  /**
   * Custom domain for Cognito hosted UI
   * @example 'auth.madmall.com'
   */
  customDomain?: string;
  
  /**
   * Callback URLs for OAuth flows
   */
  callbackUrls: string[];
  
  /**
   * Logout URLs for OAuth flows
   */
  logoutUrls: string[];
  
  /**
   * Whether to enable social login providers
   * @default true
   */
  enableSocialLogin?: boolean;
  
  /**
   * Whether to require MFA
   * @default true for prod, false for others
   */
  requireMfa?: boolean;
}

export class AuthenticationConstruct extends Construct {
  public readonly userPool: UserPool;
  public readonly userPoolClient: UserPoolClient;
  public readonly userPoolDomain: UserPoolDomain;
  public readonly identityPool: IdentityPool;
  public readonly authenticatedRole: Role;
  public readonly unauthenticatedRole: Role;

  constructor(scope: Construct, id: string, props: AuthenticationConstructProps) {
    super(scope, id);

    const {
      environment,
      customDomain,
      callbackUrls,
      logoutUrls,
      enableSocialLogin = true,
      requireMfa = environment === 'prod',
    } = props;

    // Create User Pool
    this.userPool = this.createUserPool(environment, requireMfa);

    // Create User Pool Client
    this.userPoolClient = this.createUserPoolClient(
      environment,
      callbackUrls,
      logoutUrls,
      enableSocialLogin
    );

    // Create User Pool Domain
    this.userPoolDomain = this.createUserPoolDomain(environment, customDomain);

    // Set up social login providers if enabled
    if (enableSocialLogin) {
      this.setupSocialLoginProviders(environment);
    }

    // Create user groups
    this.createUserGroups(environment);

    // Create Identity Pool
    this.identityPool = this.createIdentityPool(environment);

    // Create IAM roles for authenticated and unauthenticated users
    this.authenticatedRole = this.createAuthenticatedRole(environment);
    this.unauthenticatedRole = this.createUnauthenticatedRole(environment);

    // Attach roles to Identity Pool
    this.identityPool.addRoleAttachment('authenticated', {
      role: this.authenticatedRole,
    });

    this.identityPool.addRoleAttachment('unauthenticated', {
      role: this.unauthenticatedRole,
    });
  }

  private createUserPool(environment: string, requireMfa: boolean): UserPool {
    const userPool = new UserPool(this, 'UserPool', {
      userPoolName: `madmall-${environment}-users`,
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
        username: false,
        phone: false,
      },
      autoVerify: {
        email: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
        givenName: {
          required: true,
          mutable: true,
        },
        familyName: {
          required: true,
          mutable: true,
        },
        profilePicture: {
          required: false,
          mutable: true,
        },
      },
      customAttributes: {
        culturalBackground: {
          dataType: 'String',
          mutable: true,
        },
        communicationStyle: {
          dataType: 'String',
          mutable: true,
        },
        diagnosisStage: {
          dataType: 'String',
          mutable: true,
        },
        tenantId: {
          dataType: 'String',
          mutable: false,
        },
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
      mfa: requireMfa ? Mfa.REQUIRED : Mfa.OPTIONAL,
      mfaSecondFactor: {
        sms: true,
        otp: true,
      },
      accountRecovery: AccountRecovery.EMAIL_ONLY,
      userVerification: {
        emailSubject: 'Welcome to MADMall - Verify your email',
        emailBody: 'Hello {username}, Welcome to MADMall! Your verification code is {####}',
        emailStyle: VerificationEmailStyle.CODE,
      },
      userInvitation: {
        emailSubject: 'You have been invited to join MADMall',
        emailBody: 'Hello {username}, you have been invited to join MADMall. Your temporary password is {####}',
      },
      removalPolicy: environment === 'prod' ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    });

    Tags.of(userPool).add('Name', `madmall-${environment}-user-pool`);
    Tags.of(userPool).add('Environment', environment);

    return userPool;
  }

  private createUserPoolClient(
    environment: string,
    callbackUrls: string[],
    logoutUrls: string[],
    enableSocialLogin: boolean
  ): UserPoolClient {
    const supportedIdentityProviders = [UserPoolClientIdentityProvider.COGNITO];
    
    if (enableSocialLogin) {
      supportedIdentityProviders.push(
        UserPoolClientIdentityProvider.GOOGLE,
        UserPoolClientIdentityProvider.FACEBOOK,
        UserPoolClientIdentityProvider.AMAZON
      );
    }

    const client = new UserPoolClient(this, 'UserPoolClient', {
      userPool: this.userPool,
      userPoolClientName: `madmall-${environment}-client`,
      generateSecret: false, // For web applications
      authFlows: {
        userSrp: true,
        userPassword: false, // Disable for security
        adminUserPassword: true, // For server-side operations
        custom: true,
      },
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
          implicitCodeGrant: false, // Disabled for security
        },
        scopes: [
          OAuthScope.EMAIL,
          OAuthScope.OPENID,
          OAuthScope.PROFILE,
          OAuthScope.COGNITO_ADMIN,
        ],
        callbackUrls,
        logoutUrls,
      },
      supportedIdentityProviders,
      readAttributes: [
        'email',
        'email_verified',
        'given_name',
        'family_name',
        'picture',
        'custom:culturalBackground',
        'custom:communicationStyle',
        'custom:diagnosisStage',
        'custom:tenantId',
      ],
      writeAttributes: [
        'email',
        'given_name',
        'family_name',
        'picture',
        'custom:culturalBackground',
        'custom:communicationStyle',
        'custom:diagnosisStage',
      ],
      preventUserExistenceErrors: true,
      refreshTokenValidity: Duration.days(30),
      accessTokenValidity: Duration.hours(1),
      idTokenValidity: Duration.hours(1),
    });

    Tags.of(client).add('Name', `madmall-${environment}-user-pool-client`);
    Tags.of(client).add('Environment', environment);

    return client;
  }

  private createUserPoolDomain(environment: string, customDomain?: string): UserPoolDomain {
    const domainProps: any = {
      userPool: this.userPool,
    };

    if (customDomain) {
      domainProps.customDomain = {
        domainName: customDomain,
      };
    } else {
      domainProps.cognitoDomain = {
        domainPrefix: `madmall-${environment}`,
      };
    }

    const domain = new UserPoolDomain(this, 'UserPoolDomain', domainProps);

    Tags.of(domain).add('Name', `madmall-${environment}-auth-domain`);
    Tags.of(domain).add('Environment', environment);

    return domain;
  }

  private setupSocialLoginProviders(environment: string): void {
    // Create secrets for social login provider credentials
    const googleSecret = new Secret(this, 'GoogleOAuthSecret', {
      secretName: `madmall/${environment}/oauth/google`,
      description: 'Google OAuth credentials for social login',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ clientId: '' }),
        generateStringKey: 'clientSecret',
        excludeCharacters: '"@/\\',
      },
    });

    const facebookSecret = new Secret(this, 'FacebookOAuthSecret', {
      secretName: `madmall/${environment}/oauth/facebook`,
      description: 'Facebook OAuth credentials for social login',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ clientId: '' }),
        generateStringKey: 'clientSecret',
        excludeCharacters: '"@/\\',
      },
    });

    const amazonSecret = new Secret(this, 'AmazonOAuthSecret', {
      secretName: `madmall/${environment}/oauth/amazon`,
      description: 'Amazon OAuth credentials for social login',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ clientId: '' }),
        generateStringKey: 'clientSecret',
        excludeCharacters: '"@/\\',
      },
    });

    // Note: In a real implementation, you would retrieve these values from the secrets
    // and configure the identity providers. For now, we'll create placeholder providers.
    
    // Google Identity Provider
    new UserPoolIdentityProviderGoogle(this, 'GoogleProvider', {
      userPool: this.userPool,
      clientId: 'placeholder-google-client-id',
      clientSecret: 'placeholder-google-client-secret',
      scopes: ['email', 'profile'],
      attributeMapping: {
        email: ProviderAttribute.GOOGLE_EMAIL,
        givenName: ProviderAttribute.GOOGLE_GIVEN_NAME,
        familyName: ProviderAttribute.GOOGLE_FAMILY_NAME,
        profilePicture: ProviderAttribute.GOOGLE_PICTURE,
      },
    });

    // Facebook Identity Provider
    new UserPoolIdentityProviderFacebook(this, 'FacebookProvider', {
      userPool: this.userPool,
      clientId: 'placeholder-facebook-client-id',
      clientSecret: 'placeholder-facebook-client-secret',
      scopes: ['email', 'public_profile'],
      attributeMapping: {
        email: ProviderAttribute.FACEBOOK_EMAIL,
        givenName: ProviderAttribute.FACEBOOK_FIRST_NAME,
        familyName: ProviderAttribute.FACEBOOK_LAST_NAME,
      },
    });

    // Amazon Identity Provider
    new UserPoolIdentityProviderAmazon(this, 'AmazonProvider', {
      userPool: this.userPool,
      clientId: 'placeholder-amazon-client-id',
      clientSecret: 'placeholder-amazon-client-secret',
      scopes: ['profile'],
      attributeMapping: {
        email: ProviderAttribute.AMAZON_EMAIL,
        givenName: ProviderAttribute.AMAZON_NAME,
      },
    });
  }

  private createUserGroups(environment: string): void {
    const groups = [
      {
        name: 'Administrators',
        description: 'System administrators with full access',
        precedence: 1,
      },
      {
        name: 'Moderators',
        description: 'Community moderators with content management access',
        precedence: 2,
      },
      {
        name: 'PremiumUsers',
        description: 'Premium users with enhanced features',
        precedence: 3,
      },
      {
        name: 'StandardUsers',
        description: 'Standard users with basic access',
        precedence: 4,
      },
      {
        name: 'TenantAdmins',
        description: 'Tenant administrators for multi-tenant deployments',
        precedence: 2,
      },
    ];

    groups.forEach(group => {
      new CfnUserPoolGroup(this, `${group.name}Group`, {
        userPoolId: this.userPool.userPoolId,
        groupName: group.name,
        description: group.description,
        precedence: group.precedence,
      });
    });
  }

  private createIdentityPool(environment: string): IdentityPool {
    const identityPool = new IdentityPool(this, 'IdentityPool', {
      identityPoolName: `madmall_${environment}_identity_pool`,
      allowUnauthenticatedIdentities: false,
      authenticationProviders: {
        userPools: [
          new UserPoolAuthenticationProvider({
            userPool: this.userPool,
            userPoolClient: this.userPoolClient,
          }),
        ],
      },
    });

    Tags.of(identityPool).add('Name', `madmall-${environment}-identity-pool`);
    Tags.of(identityPool).add('Environment', environment);

    return identityPool;
  }

  private createAuthenticatedRole(environment: string): Role {
    const role = new Role(this, 'AuthenticatedRole', {
      assumedBy: new FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: {
            'cognito-identity.amazonaws.com:aud': this.identityPool.identityPoolId,
          },
          'ForAnyValue:StringLike': {
            'cognito-identity.amazonaws.com:amr': 'authenticated',
          },
        },
        'sts:AssumeRoleWithWebIdentity'
      ),
      description: `Authenticated role for MADMall ${environment} users`,
    });

    // Add permissions for authenticated users
    role.addToPolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        'cognito-identity:GetCredentialsForIdentity',
        'cognito-identity:GetId',
      ],
      resources: ['*'],
    }));

    // Add S3 permissions for user-specific content
    role.addToPolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        's3:GetObject',
        's3:PutObject',
        's3:DeleteObject',
      ],
      resources: [
        `arn:aws:s3:::madmall-${environment}-user-content/\${cognito-identity.amazonaws.com:sub}/*`,
      ],
    }));

    Tags.of(role).add('Name', `madmall-${environment}-authenticated-role`);
    Tags.of(role).add('Environment', environment);

    return role;
  }

  private createUnauthenticatedRole(environment: string): Role {
    const role = new Role(this, 'UnauthenticatedRole', {
      assumedBy: new FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: {
            'cognito-identity.amazonaws.com:aud': this.identityPool.identityPoolId,
          },
          'ForAnyValue:StringLike': {
            'cognito-identity.amazonaws.com:amr': 'unauthenticated',
          },
        },
        'sts:AssumeRoleWithWebIdentity'
      ),
      description: `Unauthenticated role for MADMall ${environment} users`,
    });

    // Minimal permissions for unauthenticated users
    role.addToPolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        'cognito-identity:GetId',
      ],
      resources: ['*'],
    }));

    Tags.of(role).add('Name', `madmall-${environment}-unauthenticated-role`);
    Tags.of(role).add('Environment', environment);

    return role;
  }
}

// Import Duration
import { Duration } from 'aws-cdk-lib';