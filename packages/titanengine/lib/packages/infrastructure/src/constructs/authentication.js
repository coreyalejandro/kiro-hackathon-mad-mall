"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationConstruct = void 0;
const constructs_1 = require("constructs");
const aws_cognito_1 = require("aws-cdk-lib/aws-cognito");
const aws_cognito_identitypool_1 = require("aws-cdk-lib/aws-cognito-identitypool");
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
const aws_secretsmanager_1 = require("aws-cdk-lib/aws-secretsmanager");
const aws_cdk_lib_1 = require("aws-cdk-lib");
class AuthenticationConstruct extends constructs_1.Construct {
    constructor(scope, id, props) {
        super(scope, id);
        const { environment, customDomain, callbackUrls, logoutUrls, enableSocialLogin = true, requireMfa = environment === 'prod', } = props;
        // Create User Pool
        this.userPool = this.createUserPool(environment, requireMfa);
        // Create User Pool Client
        this.userPoolClient = this.createUserPoolClient(environment, callbackUrls, logoutUrls, enableSocialLogin);
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
        // Assign roles to Identity Pool via roleAttachment
        this.identityPool.roleAttachment.roles = {
            authenticated: this.authenticatedRole.roleArn,
            unauthenticated: this.unauthenticatedRole.roleArn,
        };
    }
    createUserPool(environment, requireMfa) {
        const userPool = new aws_cognito_1.UserPool(this, 'UserPool', {
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
                culturalBackground: new aws_cognito_1.UserPool.CustomAttribute({ mutable: true, dataType: 'String' }),
                communicationStyle: new aws_cognito_1.UserPool.CustomAttribute({ mutable: true, dataType: 'String' }),
                diagnosisStage: new aws_cognito_1.UserPool.CustomAttribute({ mutable: true, dataType: 'String' }),
                tenantId: new aws_cognito_1.UserPool.CustomAttribute({ mutable: false, dataType: 'String' }),
            },
            passwordPolicy: {
                minLength: 8,
                requireLowercase: true,
                requireUppercase: true,
                requireDigits: true,
                requireSymbols: true,
            },
            mfa: requireMfa ? aws_cognito_1.Mfa.REQUIRED : aws_cognito_1.Mfa.OPTIONAL,
            mfaSecondFactor: {
                sms: true,
                otp: true,
            },
            accountRecovery: aws_cognito_1.AccountRecovery.EMAIL_ONLY,
            userVerification: {
                emailSubject: 'Welcome to MADMall - Verify your email',
                emailBody: 'Hello {username}, Welcome to MADMall! Your verification code is {####}',
                emailStyle: aws_cognito_1.VerificationEmailStyle.CODE,
            },
            userInvitation: {
                emailSubject: 'You have been invited to join MADMall',
                emailBody: 'Hello {username}, you have been invited to join MADMall. Your temporary password is {####}',
            },
            removalPolicy: environment === 'prod' ? aws_cdk_lib_1.RemovalPolicy.RETAIN : aws_cdk_lib_1.RemovalPolicy.DESTROY,
        });
        aws_cdk_lib_1.Tags.of(userPool).add('Name', `madmall-${environment}-user-pool`);
        aws_cdk_lib_1.Tags.of(userPool).add('Environment', environment);
        return userPool;
    }
    createUserPoolClient(environment, callbackUrls, logoutUrls, enableSocialLogin) {
        const supportedIdentityProviders = [aws_cognito_1.UserPoolClientIdentityProvider.COGNITO];
        if (enableSocialLogin) {
            supportedIdentityProviders.push(aws_cognito_1.UserPoolClientIdentityProvider.GOOGLE, aws_cognito_1.UserPoolClientIdentityProvider.FACEBOOK, aws_cognito_1.UserPoolClientIdentityProvider.AMAZON);
        }
        const client = new aws_cognito_1.UserPoolClient(this, 'UserPoolClient', {
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
                    aws_cognito_1.OAuthScope.EMAIL,
                    aws_cognito_1.OAuthScope.OPENID,
                    aws_cognito_1.OAuthScope.PROFILE,
                    aws_cognito_1.OAuthScope.COGNITO_ADMIN,
                ],
                callbackUrls,
                logoutUrls,
            },
            supportedIdentityProviders,
            readAttributes: undefined,
            writeAttributes: undefined,
            preventUserExistenceErrors: true,
            refreshTokenValidity: aws_cdk_lib_2.Duration.days(30),
            accessTokenValidity: aws_cdk_lib_2.Duration.hours(1),
            idTokenValidity: aws_cdk_lib_2.Duration.hours(1),
        });
        aws_cdk_lib_1.Tags.of(client).add('Name', `madmall-${environment}-user-pool-client`);
        aws_cdk_lib_1.Tags.of(client).add('Environment', environment);
        return client;
    }
    createUserPoolDomain(environment, customDomain) {
        const domainProps = {
            userPool: this.userPool,
        };
        if (customDomain) {
            domainProps.customDomain = {
                domainName: customDomain,
            };
        }
        else {
            domainProps.cognitoDomain = {
                domainPrefix: `madmall-${environment}`,
            };
        }
        const domain = new aws_cognito_1.UserPoolDomain(this, 'UserPoolDomain', domainProps);
        aws_cdk_lib_1.Tags.of(domain).add('Name', `madmall-${environment}-auth-domain`);
        aws_cdk_lib_1.Tags.of(domain).add('Environment', environment);
        return domain;
    }
    setupSocialLoginProviders(environment) {
        // Create secrets for social login provider credentials
        const googleSecret = new aws_secretsmanager_1.Secret(this, 'GoogleOAuthSecret', {
            secretName: `madmall/${environment}/oauth/google`,
            description: 'Google OAuth credentials for social login',
            generateSecretString: {
                secretStringTemplate: JSON.stringify({ clientId: '' }),
                generateStringKey: 'clientSecret',
                excludeCharacters: '"@/\\',
            },
        });
        const facebookSecret = new aws_secretsmanager_1.Secret(this, 'FacebookOAuthSecret', {
            secretName: `madmall/${environment}/oauth/facebook`,
            description: 'Facebook OAuth credentials for social login',
            generateSecretString: {
                secretStringTemplate: JSON.stringify({ clientId: '' }),
                generateStringKey: 'clientSecret',
                excludeCharacters: '"@/\\',
            },
        });
        const amazonSecret = new aws_secretsmanager_1.Secret(this, 'AmazonOAuthSecret', {
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
        new aws_cognito_1.UserPoolIdentityProviderGoogle(this, 'GoogleProvider', {
            userPool: this.userPool,
            clientId: 'placeholder-google-client-id',
            clientSecret: 'placeholder-google-client-secret',
            scopes: ['email', 'profile'],
            attributeMapping: {
                email: aws_cognito_1.ProviderAttribute.GOOGLE_EMAIL,
                givenName: aws_cognito_1.ProviderAttribute.GOOGLE_GIVEN_NAME,
                familyName: aws_cognito_1.ProviderAttribute.GOOGLE_FAMILY_NAME,
                profilePicture: aws_cognito_1.ProviderAttribute.GOOGLE_PICTURE,
            },
        });
        // Facebook Identity Provider
        new aws_cognito_1.UserPoolIdentityProviderFacebook(this, 'FacebookProvider', {
            userPool: this.userPool,
            clientId: 'placeholder-facebook-client-id',
            clientSecret: 'placeholder-facebook-client-secret',
            scopes: ['email', 'public_profile'],
            attributeMapping: {
                email: aws_cognito_1.ProviderAttribute.FACEBOOK_EMAIL,
                givenName: aws_cognito_1.ProviderAttribute.FACEBOOK_FIRST_NAME,
                familyName: aws_cognito_1.ProviderAttribute.FACEBOOK_LAST_NAME,
            },
        });
        // Amazon Identity Provider
        new aws_cognito_1.UserPoolIdentityProviderAmazon(this, 'AmazonProvider', {
            userPool: this.userPool,
            clientId: 'placeholder-amazon-client-id',
            clientSecret: 'placeholder-amazon-client-secret',
            scopes: ['profile'],
            attributeMapping: {
                email: aws_cognito_1.ProviderAttribute.AMAZON_EMAIL,
                givenName: aws_cognito_1.ProviderAttribute.AMAZON_NAME,
            },
        });
    }
    createUserGroups(environment) {
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
            new aws_cognito_1.CfnUserPoolGroup(this, `${group.name}Group`, {
                userPoolId: this.userPool.userPoolId,
                groupName: group.name,
                description: group.description,
                precedence: group.precedence,
            });
        });
    }
    createIdentityPool(environment) {
        const identityPool = new aws_cognito_identitypool_1.IdentityPool(this, 'IdentityPool', {
            identityPoolName: `madmall_${environment}_identity_pool`,
            allowUnauthenticatedIdentities: false,
            authenticationProviders: {
                userPools: [
                    new aws_cognito_identitypool_1.UserPoolAuthenticationProvider({
                        userPool: this.userPool,
                        userPoolClient: this.userPoolClient,
                    }),
                ],
            },
        });
        aws_cdk_lib_1.Tags.of(identityPool).add('Name', `madmall-${environment}-identity-pool`);
        aws_cdk_lib_1.Tags.of(identityPool).add('Environment', environment);
        return identityPool;
    }
    createAuthenticatedRole(environment) {
        const role = new aws_iam_1.Role(this, 'AuthenticatedRole', {
            assumedBy: new aws_iam_1.FederatedPrincipal('cognito-identity.amazonaws.com', {
                StringEquals: {
                    'cognito-identity.amazonaws.com:aud': this.identityPool.identityPoolId,
                },
                'ForAnyValue:StringLike': {
                    'cognito-identity.amazonaws.com:amr': 'authenticated',
                },
            }, 'sts:AssumeRoleWithWebIdentity'),
            description: `Authenticated role for MADMall ${environment} users`,
        });
        // Add permissions for authenticated users
        role.addToPolicy(new aws_iam_1.PolicyStatement({
            effect: aws_iam_1.Effect.ALLOW,
            actions: [
                'cognito-identity:GetCredentialsForIdentity',
                'cognito-identity:GetId',
            ],
            resources: ['*'],
        }));
        // Add S3 permissions for user-specific content
        role.addToPolicy(new aws_iam_1.PolicyStatement({
            effect: aws_iam_1.Effect.ALLOW,
            actions: [
                's3:GetObject',
                's3:PutObject',
                's3:DeleteObject',
            ],
            resources: [
                `arn:aws:s3:::madmall-${environment}-user-content/\${cognito-identity.amazonaws.com:sub}/*`,
            ],
        }));
        aws_cdk_lib_1.Tags.of(role).add('Name', `madmall-${environment}-authenticated-role`);
        aws_cdk_lib_1.Tags.of(role).add('Environment', environment);
        return role;
    }
    createUnauthenticatedRole(environment) {
        const role = new aws_iam_1.Role(this, 'UnauthenticatedRole', {
            assumedBy: new aws_iam_1.FederatedPrincipal('cognito-identity.amazonaws.com', {
                StringEquals: {
                    'cognito-identity.amazonaws.com:aud': this.identityPool.identityPoolId,
                },
                'ForAnyValue:StringLike': {
                    'cognito-identity.amazonaws.com:amr': 'unauthenticated',
                },
            }, 'sts:AssumeRoleWithWebIdentity'),
            description: `Unauthenticated role for MADMall ${environment} users`,
        });
        // Minimal permissions for unauthenticated users
        role.addToPolicy(new aws_iam_1.PolicyStatement({
            effect: aws_iam_1.Effect.ALLOW,
            actions: [
                'cognito-identity:GetId',
            ],
            resources: ['*'],
        }));
        aws_cdk_lib_1.Tags.of(role).add('Name', `madmall-${environment}-unauthenticated-role`);
        aws_cdk_lib_1.Tags.of(role).add('Environment', environment);
        return role;
    }
}
exports.AuthenticationConstruct = AuthenticationConstruct;
// Import Duration
const aws_cdk_lib_2 = require("aws-cdk-lib");
//# sourceMappingURL=authentication.js.map