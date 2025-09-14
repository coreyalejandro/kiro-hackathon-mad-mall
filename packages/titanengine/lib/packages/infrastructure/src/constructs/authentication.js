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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aGVudGljYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9pbmZyYXN0cnVjdHVyZS9zcmMvY29uc3RydWN0cy9hdXRoZW50aWNhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwyQ0FBdUM7QUFDdkMseURBZ0JpQztBQUNqQyxtRkFBb0c7QUFDcEcsaURBTTZCO0FBQzdCLHVFQUF3RDtBQUN4RCw2Q0FBa0Q7QUFxQ2xELE1BQWEsdUJBQXdCLFNBQVEsc0JBQVM7SUFRcEQsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFtQztRQUMzRSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRWpCLE1BQU0sRUFDSixXQUFXLEVBQ1gsWUFBWSxFQUNaLFlBQVksRUFDWixVQUFVLEVBQ1YsaUJBQWlCLEdBQUcsSUFBSSxFQUN4QixVQUFVLEdBQUcsV0FBVyxLQUFLLE1BQU0sR0FDcEMsR0FBRyxLQUFLLENBQUM7UUFFVixtQkFBbUI7UUFDbkIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUU3RCwwQkFBMEI7UUFDMUIsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQzdDLFdBQVcsRUFDWCxZQUFZLEVBQ1osVUFBVSxFQUNWLGlCQUFpQixDQUNsQixDQUFDO1FBRUYsMEJBQTBCO1FBQzFCLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFdBQVcsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUUzRSwyQ0FBMkM7UUFDM0MsSUFBSSxpQkFBaUIsRUFBRSxDQUFDO1lBQ3RCLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUM5QyxDQUFDO1FBRUQscUJBQXFCO1FBQ3JCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsQ0FB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QkFBK0IsQ0FDaEM7WUFDRCxXQUFXLEVBQUUsb0NBQW9DLFdBQVcsUUFBUTtTQUNyRSxDQUFDLENBQUM7UUFFSCxnREFBZ0Q7UUFDaEQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLHlCQUFlLENBQUM7WUFDbkMsTUFBTSxFQUFFLGdCQUFNLENBQUMsS0FBSztZQUNwQixPQUFPLEVBQUU7Z0JBQ1Asd0JBQXdCO2FBQ3pCO1lBQ0QsU0FBUyxFQUFFLENBQUMsR0FBRyxDQUFDO1NBQ2pCLENBQUMsQ0FBQyxDQUFDO1FBRUosa0JBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxXQUFXLFdBQVcsdUJBQXVCLENBQUMsQ0FBQztRQUN6RSxrQkFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBRTlDLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztDQUNGO0FBNVpELDBEQTRaQztBQUVELGtCQUFrQjtBQUNsQiw2Q0FBdUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcbmltcG9ydCB7XG4gIFVzZXJQb29sLFxuICBVc2VyUG9vbENsaWVudCxcbiAgVXNlclBvb2xEb21haW4sXG4gIFZlcmlmaWNhdGlvbkVtYWlsU3R5bGUsXG4gIE1mYSxcbiAgQWNjb3VudFJlY292ZXJ5LFxuICBVc2VyUG9vbElkZW50aXR5UHJvdmlkZXJHb29nbGUsXG4gIFVzZXJQb29sSWRlbnRpdHlQcm92aWRlckZhY2Vib29rLFxuICBVc2VyUG9vbElkZW50aXR5UHJvdmlkZXJBbWF6b24sXG4gIFByb3ZpZGVyQXR0cmlidXRlLFxuICBBdHRyaWJ1dGVNYXBwaW5nLFxuICBPQXV0aFNjb3BlLFxuICBPQXV0aEZsb3dzLFxuICBVc2VyUG9vbENsaWVudElkZW50aXR5UHJvdmlkZXIsXG4gIENmblVzZXJQb29sR3JvdXAsXG59IGZyb20gJ2F3cy1jZGstbGliL2F3cy1jb2duaXRvJztcbmltcG9ydCB7IElkZW50aXR5UG9vbCwgVXNlclBvb2xBdXRoZW50aWNhdGlvblByb3ZpZGVyIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWNvZ25pdG8taWRlbnRpdHlwb29sJztcbmltcG9ydCB7XG4gIFJvbGUsXG4gIFNlcnZpY2VQcmluY2lwYWwsXG4gIFBvbGljeVN0YXRlbWVudCxcbiAgRWZmZWN0LFxuICBGZWRlcmF0ZWRQcmluY2lwYWwsXG59IGZyb20gJ2F3cy1jZGstbGliL2F3cy1pYW0nO1xuaW1wb3J0IHsgU2VjcmV0IH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLXNlY3JldHNtYW5hZ2VyJztcbmltcG9ydCB7IFJlbW92YWxQb2xpY3ksIFRhZ3MgfSBmcm9tICdhd3MtY2RrLWxpYic7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQXV0aGVudGljYXRpb25Db25zdHJ1Y3RQcm9wcyB7XG4gIC8qKlxuICAgKiBFbnZpcm9ubWVudCBuYW1lIChkZXYsIHN0YWdpbmcsIHByb2QpXG4gICAqL1xuICBlbnZpcm9ubWVudDogc3RyaW5nO1xuICBcbiAgLyoqXG4gICAqIEN1c3RvbSBkb21haW4gZm9yIENvZ25pdG8gaG9zdGVkIFVJXG4gICAqIEBleGFtcGxlICdhdXRoLm1hZG1hbGwuY29tJ1xuICAgKi9cbiAgY3VzdG9tRG9tYWluPzogc3RyaW5nO1xuICBcbiAgLyoqXG4gICAqIENhbGxiYWNrIFVSTHMgZm9yIE9BdXRoIGZsb3dzXG4gICAqL1xuICBjYWxsYmFja1VybHM6IHN0cmluZ1tdO1xuICBcbiAgLyoqXG4gICAqIExvZ291dCBVUkxzIGZvciBPQXV0aCBmbG93c1xuICAgKi9cbiAgbG9nb3V0VXJsczogc3RyaW5nW107XG4gIFxuICAvKipcbiAgICogV2hldGhlciB0byBlbmFibGUgc29jaWFsIGxvZ2luIHByb3ZpZGVyc1xuICAgKiBAZGVmYXVsdCB0cnVlXG4gICAqL1xuICBlbmFibGVTb2NpYWxMb2dpbj86IGJvb2xlYW47XG4gIFxuICAvKipcbiAgICogV2hldGhlciB0byByZXF1aXJlIE1GQVxuICAgKiBAZGVmYXVsdCB0cnVlIGZvciBwcm9kLCBmYWxzZSBmb3Igb3RoZXJzXG4gICAqL1xuICByZXF1aXJlTWZhPzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNsYXNzIEF1dGhlbnRpY2F0aW9uQ29uc3RydWN0IGV4dGVuZHMgQ29uc3RydWN0IHtcbiAgcHVibGljIHJlYWRvbmx5IHVzZXJQb29sOiBVc2VyUG9vbDtcbiAgcHVibGljIHJlYWRvbmx5IHVzZXJQb29sQ2xpZW50OiBVc2VyUG9vbENsaWVudDtcbiAgcHVibGljIHJlYWRvbmx5IHVzZXJQb29sRG9tYWluOiBVc2VyUG9vbERvbWFpbjtcbiAgcHVibGljIHJlYWRvbmx5IGlkZW50aXR5UG9vbDogSWRlbnRpdHlQb29sO1xuICBwdWJsaWMgcmVhZG9ubHkgYXV0aGVudGljYXRlZFJvbGU6IFJvbGU7XG4gIHB1YmxpYyByZWFkb25seSB1bmF1dGhlbnRpY2F0ZWRSb2xlOiBSb2xlO1xuXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBBdXRoZW50aWNhdGlvbkNvbnN0cnVjdFByb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkKTtcblxuICAgIGNvbnN0IHtcbiAgICAgIGVudmlyb25tZW50LFxuICAgICAgY3VzdG9tRG9tYWluLFxuICAgICAgY2FsbGJhY2tVcmxzLFxuICAgICAgbG9nb3V0VXJscyxcbiAgICAgIGVuYWJsZVNvY2lhbExvZ2luID0gdHJ1ZSxcbiAgICAgIHJlcXVpcmVNZmEgPSBlbnZpcm9ubWVudCA9PT0gJ3Byb2QnLFxuICAgIH0gPSBwcm9wcztcblxuICAgIC8vIENyZWF0ZSBVc2VyIFBvb2xcbiAgICB0aGlzLnVzZXJQb29sID0gdGhpcy5jcmVhdGVVc2VyUG9vbChlbnZpcm9ubWVudCwgcmVxdWlyZU1mYSk7XG5cbiAgICAvLyBDcmVhdGUgVXNlciBQb29sIENsaWVudFxuICAgIHRoaXMudXNlclBvb2xDbGllbnQgPSB0aGlzLmNyZWF0ZVVzZXJQb29sQ2xpZW50KFxuICAgICAgZW52aXJvbm1lbnQsXG4gICAgICBjYWxsYmFja1VybHMsXG4gICAgICBsb2dvdXRVcmxzLFxuICAgICAgZW5hYmxlU29jaWFsTG9naW5cbiAgICApO1xuXG4gICAgLy8gQ3JlYXRlIFVzZXIgUG9vbCBEb21haW5cbiAgICB0aGlzLnVzZXJQb29sRG9tYWluID0gdGhpcy5jcmVhdGVVc2VyUG9vbERvbWFpbihlbnZpcm9ubWVudCwgY3VzdG9tRG9tYWluKTtcblxuICAgIC8vIFNldCB1cCBzb2NpYWwgbG9naW4gcHJvdmlkZXJzIGlmIGVuYWJsZWRcbiAgICBpZiAoZW5hYmxlU29jaWFsTG9naW4pIHtcbiAgICAgIHRoaXMuc2V0dXBTb2NpYWxMb2dpblByb3ZpZGVycyhlbnZpcm9ubWVudCk7XG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlIHVzZXIgZ3JvdXBzXG4gICAgdGhpcy5jcmVhdGVVc2VyR3JvdXBzKGVudmlyb25tZW50KTtcblxuICAgIC8vIENyZWF0ZSBJZGVudGl0eSBQb29sXG4gICAgdGhpcy5pZGVudGl0eVBvb2wgPSB0aGlzLmNyZWF0ZUlkZW50aXR5UG9vbChlbnZpcm9ubWVudCk7XG5cbiAgICAvLyBDcmVhdGUgSUFNIHJvbGVzIGZvciBhdXRoZW50aWNhdGVkIGFuZCB1bmF1dGhlbnRpY2F0ZWQgdXNlcnNcbiAgICB0aGlzLmF1dGhlbnRpY2F0ZWRSb2xlID0gdGhpcy5jcmVhdGVBdXRoZW50aWNhdGVkUm9sZShlbnZpcm9ubWVudCk7XG4gICAgdGhpcy51bmF1dGhlbnRpY2F0ZWRSb2xlID0gdGhpcy5jcmVhdGVVbmF1dGhlbnRpY2F0ZWRSb2xlKGVudmlyb25tZW50KTtcblxuICAgIC8vIEFzc2lnbiByb2xlcyB0byBJZGVudGl0eSBQb29sIHZpYSByb2xlQXR0YWNobWVudFxuICAgIHRoaXMuaWRlbnRpdHlQb29sLnJvbGVBdHRhY2htZW50LnJvbGVzID0ge1xuICAgICAgYXV0aGVudGljYXRlZDogdGhpcy5hdXRoZW50aWNhdGVkUm9sZS5yb2xlQXJuLFxuICAgICAgdW5hdXRoZW50aWNhdGVkOiB0aGlzLnVuYXV0aGVudGljYXRlZFJvbGUucm9sZUFybixcbiAgICB9IGFzIGFueTtcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlVXNlclBvb2woZW52aXJvbm1lbnQ6IHN0cmluZywgcmVxdWlyZU1mYTogYm9vbGVhbik6IFVzZXJQb29sIHtcbiAgICBjb25zdCB1c2VyUG9vbCA9IG5ldyBVc2VyUG9vbCh0aGlzLCAnVXNlclBvb2wnLCB7XG4gICAgICB1c2VyUG9vbE5hbWU6IGBtYWRtYWxsLSR7ZW52aXJvbm1lbnR9LXVzZXJzYCxcbiAgICAgIHNlbGZTaWduVXBFbmFibGVkOiB0cnVlLFxuICAgICAgc2lnbkluQWxpYXNlczoge1xuICAgICAgICBlbWFpbDogdHJ1ZSxcbiAgICAgICAgdXNlcm5hbWU6IGZhbHNlLFxuICAgICAgICBwaG9uZTogZmFsc2UsXG4gICAgICB9LFxuICAgICAgYXV0b1ZlcmlmeToge1xuICAgICAgICBlbWFpbDogdHJ1ZSxcbiAgICAgIH0sXG4gICAgICBzdGFuZGFyZEF0dHJpYnV0ZXM6IHtcbiAgICAgICAgZW1haWw6IHtcbiAgICAgICAgICByZXF1aXJlZDogdHJ1ZSxcbiAgICAgICAgICBtdXRhYmxlOiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgICBnaXZlbk5hbWU6IHtcbiAgICAgICAgICByZXF1aXJlZDogdHJ1ZSxcbiAgICAgICAgICBtdXRhYmxlOiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgICBmYW1pbHlOYW1lOiB7XG4gICAgICAgICAgcmVxdWlyZWQ6IHRydWUsXG4gICAgICAgICAgbXV0YWJsZTogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgICAgcHJvZmlsZVBpY3R1cmU6IHtcbiAgICAgICAgICByZXF1aXJlZDogZmFsc2UsXG4gICAgICAgICAgbXV0YWJsZTogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBjdXN0b21BdHRyaWJ1dGVzOiB7XG4gICAgICAgIGN1bHR1cmFsQmFja2dyb3VuZDogbmV3IChVc2VyUG9vbCBhcyBhbnkpLkN1c3RvbUF0dHJpYnV0ZSh7IG11dGFibGU6IHRydWUsIGRhdGFUeXBlOiAnU3RyaW5nJyB9KSxcbiAgICAgICAgY29tbXVuaWNhdGlvblN0eWxlOiBuZXcgKFVzZXJQb29sIGFzIGFueSkuQ3VzdG9tQXR0cmlidXRlKHsgbXV0YWJsZTogdHJ1ZSwgZGF0YVR5cGU6ICdTdHJpbmcnIH0pLFxuICAgICAgICBkaWFnbm9zaXNTdGFnZTogbmV3IChVc2VyUG9vbCBhcyBhbnkpLkN1c3RvbUF0dHJpYnV0ZSh7IG11dGFibGU6IHRydWUsIGRhdGFUeXBlOiAnU3RyaW5nJyB9KSxcbiAgICAgICAgdGVuYW50SWQ6IG5ldyAoVXNlclBvb2wgYXMgYW55KS5DdXN0b21BdHRyaWJ1dGUoeyBtdXRhYmxlOiBmYWxzZSwgZGF0YVR5cGU6ICdTdHJpbmcnIH0pLFxuICAgICAgfSBhcyBhbnksXG4gICAgICBwYXNzd29yZFBvbGljeToge1xuICAgICAgICBtaW5MZW5ndGg6IDgsXG4gICAgICAgIHJlcXVpcmVMb3dlcmNhc2U6IHRydWUsXG4gICAgICAgIHJlcXVpcmVVcHBlcmNhc2U6IHRydWUsXG4gICAgICAgIHJlcXVpcmVEaWdpdHM6IHRydWUsXG4gICAgICAgIHJlcXVpcmVTeW1ib2xzOiB0cnVlLFxuICAgICAgfSxcbiAgICAgIG1mYTogcmVxdWlyZU1mYSA/IE1mYS5SRVFVSVJFRCA6IE1mYS5PUFRJT05BTCxcbiAgICAgIG1mYVNlY29uZEZhY3Rvcjoge1xuICAgICAgICBzbXM6IHRydWUsXG4gICAgICAgIG90cDogdHJ1ZSxcbiAgICAgIH0sXG4gICAgICBhY2NvdW50UmVjb3Zlcnk6IEFjY291bnRSZWNvdmVyeS5FTUFJTF9PTkxZLFxuICAgICAgdXNlclZlcmlmaWNhdGlvbjoge1xuICAgICAgICBlbWFpbFN1YmplY3Q6ICdXZWxjb21lIHRvIE1BRE1hbGwgLSBWZXJpZnkgeW91ciBlbWFpbCcsXG4gICAgICAgIGVtYWlsQm9keTogJ0hlbGxvIHt1c2VybmFtZX0sIFdlbGNvbWUgdG8gTUFETWFsbCEgWW91ciB2ZXJpZmljYXRpb24gY29kZSBpcyB7IyMjI30nLFxuICAgICAgICBlbWFpbFN0eWxlOiBWZXJpZmljYXRpb25FbWFpbFN0eWxlLkNPREUsXG4gICAgICB9LFxuICAgICAgdXNlckludml0YXRpb246IHtcbiAgICAgICAgZW1haWxTdWJqZWN0OiAnWW91IGhhdmUgYmVlbiBpbnZpdGVkIHRvIGpvaW4gTUFETWFsbCcsXG4gICAgICAgIGVtYWlsQm9keTogJ0hlbGxvIHt1c2VybmFtZX0sIHlvdSBoYXZlIGJlZW4gaW52aXRlZCB0byBqb2luIE1BRE1hbGwuIFlvdXIgdGVtcG9yYXJ5IHBhc3N3b3JkIGlzIHsjIyMjfScsXG4gICAgICB9LFxuICAgICAgcmVtb3ZhbFBvbGljeTogZW52aXJvbm1lbnQgPT09ICdwcm9kJyA/IFJlbW92YWxQb2xpY3kuUkVUQUlOIDogUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLFxuICAgIH0pO1xuXG4gICAgVGFncy5vZih1c2VyUG9vbCkuYWRkKCdOYW1lJywgYG1hZG1hbGwtJHtlbnZpcm9ubWVudH0tdXNlci1wb29sYCk7XG4gICAgVGFncy5vZih1c2VyUG9vbCkuYWRkKCdFbnZpcm9ubWVudCcsIGVudmlyb25tZW50KTtcblxuICAgIHJldHVybiB1c2VyUG9vbDtcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlVXNlclBvb2xDbGllbnQoXG4gICAgZW52aXJvbm1lbnQ6IHN0cmluZyxcbiAgICBjYWxsYmFja1VybHM6IHN0cmluZ1tdLFxuICAgIGxvZ291dFVybHM6IHN0cmluZ1tdLFxuICAgIGVuYWJsZVNvY2lhbExvZ2luOiBib29sZWFuXG4gICk6IFVzZXJQb29sQ2xpZW50IHtcbiAgICBjb25zdCBzdXBwb3J0ZWRJZGVudGl0eVByb3ZpZGVycyA9IFtVc2VyUG9vbENsaWVudElkZW50aXR5UHJvdmlkZXIuQ09HTklUT107XG4gICAgXG4gICAgaWYgKGVuYWJsZVNvY2lhbExvZ2luKSB7XG4gICAgICBzdXBwb3J0ZWRJZGVudGl0eVByb3ZpZGVycy5wdXNoKFxuICAgICAgICBVc2VyUG9vbENsaWVudElkZW50aXR5UHJvdmlkZXIuR09PR0xFLFxuICAgICAgICBVc2VyUG9vbENsaWVudElkZW50aXR5UHJvdmlkZXIuRkFDRUJPT0ssXG4gICAgICAgIFVzZXJQb29sQ2xpZW50SWRlbnRpdHlQcm92aWRlci5BTUFaT05cbiAgICAgICk7XG4gICAgfVxuXG4gICAgY29uc3QgY2xpZW50ID0gbmV3IFVzZXJQb29sQ2xpZW50KHRoaXMsICdVc2VyUG9vbENsaWVudCcsIHtcbiAgICAgIHVzZXJQb29sOiB0aGlzLnVzZXJQb29sLFxuICAgICAgdXNlclBvb2xDbGllbnROYW1lOiBgbWFkbWFsbC0ke2Vudmlyb25tZW50fS1jbGllbnRgLFxuICAgICAgZ2VuZXJhdGVTZWNyZXQ6IGZhbHNlLCAvLyBGb3Igd2ViIGFwcGxpY2F0aW9uc1xuICAgICAgYXV0aEZsb3dzOiB7XG4gICAgICAgIHVzZXJTcnA6IHRydWUsXG4gICAgICAgIHVzZXJQYXNzd29yZDogZmFsc2UsIC8vIERpc2FibGUgZm9yIHNlY3VyaXR5XG4gICAgICAgIGFkbWluVXNlclBhc3N3b3JkOiB0cnVlLCAvLyBGb3Igc2VydmVyLXNpZGUgb3BlcmF0aW9uc1xuICAgICAgICBjdXN0b206IHRydWUsXG4gICAgICB9LFxuICAgICAgb0F1dGg6IHtcbiAgICAgICAgZmxvd3M6IHtcbiAgICAgICAgICBhdXRob3JpemF0aW9uQ29kZUdyYW50OiB0cnVlLFxuICAgICAgICAgIGltcGxpY2l0Q29kZUdyYW50OiBmYWxzZSwgLy8gRGlzYWJsZWQgZm9yIHNlY3VyaXR5XG4gICAgICAgIH0sXG4gICAgICAgIHNjb3BlczogW1xuICAgICAgICAgIE9BdXRoU2NvcGUuRU1BSUwsXG4gICAgICAgICAgT0F1dGhTY29wZS5PUEVOSUQsXG4gICAgICAgICAgT0F1dGhTY29wZS5QUk9GSUxFLFxuICAgICAgICAgIE9BdXRoU2NvcGUuQ09HTklUT19BRE1JTixcbiAgICAgICAgXSxcbiAgICAgICAgY2FsbGJhY2tVcmxzLFxuICAgICAgICBsb2dvdXRVcmxzLFxuICAgICAgfSxcbiAgICAgIHN1cHBvcnRlZElkZW50aXR5UHJvdmlkZXJzLFxuICAgICAgcmVhZEF0dHJpYnV0ZXM6IHVuZGVmaW5lZCxcbiAgICAgIHdyaXRlQXR0cmlidXRlczogdW5kZWZpbmVkLFxuICAgICAgcHJldmVudFVzZXJFeGlzdGVuY2VFcnJvcnM6IHRydWUsXG4gICAgICByZWZyZXNoVG9rZW5WYWxpZGl0eTogRHVyYXRpb24uZGF5cygzMCksXG4gICAgICBhY2Nlc3NUb2tlblZhbGlkaXR5OiBEdXJhdGlvbi5ob3VycygxKSxcbiAgICAgIGlkVG9rZW5WYWxpZGl0eTogRHVyYXRpb24uaG91cnMoMSksXG4gICAgfSk7XG5cbiAgICBUYWdzLm9mKGNsaWVudCkuYWRkKCdOYW1lJywgYG1hZG1hbGwtJHtlbnZpcm9ubWVudH0tdXNlci1wb29sLWNsaWVudGApO1xuICAgIFRhZ3Mub2YoY2xpZW50KS5hZGQoJ0Vudmlyb25tZW50JywgZW52aXJvbm1lbnQpO1xuXG4gICAgcmV0dXJuIGNsaWVudDtcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlVXNlclBvb2xEb21haW4oZW52aXJvbm1lbnQ6IHN0cmluZywgY3VzdG9tRG9tYWluPzogc3RyaW5nKTogVXNlclBvb2xEb21haW4ge1xuICAgIGNvbnN0IGRvbWFpblByb3BzOiBhbnkgPSB7XG4gICAgICB1c2VyUG9vbDogdGhpcy51c2VyUG9vbCxcbiAgICB9O1xuXG4gICAgaWYgKGN1c3RvbURvbWFpbikge1xuICAgICAgZG9tYWluUHJvcHMuY3VzdG9tRG9tYWluID0ge1xuICAgICAgICBkb21haW5OYW1lOiBjdXN0b21Eb21haW4sXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBkb21haW5Qcm9wcy5jb2duaXRvRG9tYWluID0ge1xuICAgICAgICBkb21haW5QcmVmaXg6IGBtYWRtYWxsLSR7ZW52aXJvbm1lbnR9YCxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgY29uc3QgZG9tYWluID0gbmV3IFVzZXJQb29sRG9tYWluKHRoaXMsICdVc2VyUG9vbERvbWFpbicsIGRvbWFpblByb3BzKTtcblxuICAgIFRhZ3Mub2YoZG9tYWluKS5hZGQoJ05hbWUnLCBgbWFkbWFsbC0ke2Vudmlyb25tZW50fS1hdXRoLWRvbWFpbmApO1xuICAgIFRhZ3Mub2YoZG9tYWluKS5hZGQoJ0Vudmlyb25tZW50JywgZW52aXJvbm1lbnQpO1xuXG4gICAgcmV0dXJuIGRvbWFpbjtcbiAgfVxuXG4gIHByaXZhdGUgc2V0dXBTb2NpYWxMb2dpblByb3ZpZGVycyhlbnZpcm9ubWVudDogc3RyaW5nKTogdm9pZCB7XG4gICAgLy8gQ3JlYXRlIHNlY3JldHMgZm9yIHNvY2lhbCBsb2dpbiBwcm92aWRlciBjcmVkZW50aWFsc1xuICAgIGNvbnN0IGdvb2dsZVNlY3JldCA9IG5ldyBTZWNyZXQodGhpcywgJ0dvb2dsZU9BdXRoU2VjcmV0Jywge1xuICAgICAgc2VjcmV0TmFtZTogYG1hZG1hbGwvJHtlbnZpcm9ubWVudH0vb2F1dGgvZ29vZ2xlYCxcbiAgICAgIGRlc2NyaXB0aW9uOiAnR29vZ2xlIE9BdXRoIGNyZWRlbnRpYWxzIGZvciBzb2NpYWwgbG9naW4nLFxuICAgICAgZ2VuZXJhdGVTZWNyZXRTdHJpbmc6IHtcbiAgICAgICAgc2VjcmV0U3RyaW5nVGVtcGxhdGU6IEpTT04uc3RyaW5naWZ5KHsgY2xpZW50SWQ6ICcnIH0pLFxuICAgICAgICBnZW5lcmF0ZVN0cmluZ0tleTogJ2NsaWVudFNlY3JldCcsXG4gICAgICAgIGV4Y2x1ZGVDaGFyYWN0ZXJzOiAnXCJAL1xcXFwnLFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIGNvbnN0IGZhY2Vib29rU2VjcmV0ID0gbmV3IFNlY3JldCh0aGlzLCAnRmFjZWJvb2tPQXV0aFNlY3JldCcsIHtcbiAgICAgIHNlY3JldE5hbWU6IGBtYWRtYWxsLyR7ZW52aXJvbm1lbnR9L29hdXRoL2ZhY2Vib29rYCxcbiAgICAgIGRlc2NyaXB0aW9uOiAnRmFjZWJvb2sgT0F1dGggY3JlZGVudGlhbHMgZm9yIHNvY2lhbCBsb2dpbicsXG4gICAgICBnZW5lcmF0ZVNlY3JldFN0cmluZzoge1xuICAgICAgICBzZWNyZXRTdHJpbmdUZW1wbGF0ZTogSlNPTi5zdHJpbmdpZnkoeyBjbGllbnRJZDogJycgfSksXG4gICAgICAgIGdlbmVyYXRlU3RyaW5nS2V5OiAnY2xpZW50U2VjcmV0JyxcbiAgICAgICAgZXhjbHVkZUNoYXJhY3RlcnM6ICdcIkAvXFxcXCcsXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgY29uc3QgYW1hem9uU2VjcmV0ID0gbmV3IFNlY3JldCh0aGlzLCAnQW1hem9uT0F1dGhTZWNyZXQnLCB7XG4gICAgICBzZWNyZXROYW1lOiBgbWFkbWFsbC8ke2Vudmlyb25tZW50fS9vYXV0aC9hbWF6b25gLFxuICAgICAgZGVzY3JpcHRpb246ICdBbWF6b24gT0F1dGggY3JlZGVudGlhbHMgZm9yIHNvY2lhbCBsb2dpbicsXG4gICAgICBnZW5lcmF0ZVNlY3JldFN0cmluZzoge1xuICAgICAgICBzZWNyZXRTdHJpbmdUZW1wbGF0ZTogSlNPTi5zdHJpbmdpZnkoeyBjbGllbnRJZDogJycgfSksXG4gICAgICAgIGdlbmVyYXRlU3RyaW5nS2V5OiAnY2xpZW50U2VjcmV0JyxcbiAgICAgICAgZXhjbHVkZUNoYXJhY3RlcnM6ICdcIkAvXFxcXCcsXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgLy8gTm90ZTogSW4gYSByZWFsIGltcGxlbWVudGF0aW9uLCB5b3Ugd291bGQgcmV0cmlldmUgdGhlc2UgdmFsdWVzIGZyb20gdGhlIHNlY3JldHNcbiAgICAvLyBhbmQgY29uZmlndXJlIHRoZSBpZGVudGl0eSBwcm92aWRlcnMuIEZvciBub3csIHdlJ2xsIGNyZWF0ZSBwbGFjZWhvbGRlciBwcm92aWRlcnMuXG4gICAgXG4gICAgLy8gR29vZ2xlIElkZW50aXR5IFByb3ZpZGVyXG4gICAgbmV3IFVzZXJQb29sSWRlbnRpdHlQcm92aWRlckdvb2dsZSh0aGlzLCAnR29vZ2xlUHJvdmlkZXInLCB7XG4gICAgICB1c2VyUG9vbDogdGhpcy51c2VyUG9vbCxcbiAgICAgIGNsaWVudElkOiAncGxhY2Vob2xkZXItZ29vZ2xlLWNsaWVudC1pZCcsXG4gICAgICBjbGllbnRTZWNyZXQ6ICdwbGFjZWhvbGRlci1nb29nbGUtY2xpZW50LXNlY3JldCcsXG4gICAgICBzY29wZXM6IFsnZW1haWwnLCAncHJvZmlsZSddLFxuICAgICAgYXR0cmlidXRlTWFwcGluZzoge1xuICAgICAgICBlbWFpbDogUHJvdmlkZXJBdHRyaWJ1dGUuR09PR0xFX0VNQUlMLFxuICAgICAgICBnaXZlbk5hbWU6IFByb3ZpZGVyQXR0cmlidXRlLkdPT0dMRV9HSVZFTl9OQU1FLFxuICAgICAgICBmYW1pbHlOYW1lOiBQcm92aWRlckF0dHJpYnV0ZS5HT09HTEVfRkFNSUxZX05BTUUsXG4gICAgICAgIHByb2ZpbGVQaWN0dXJlOiBQcm92aWRlckF0dHJpYnV0ZS5HT09HTEVfUElDVFVSRSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICAvLyBGYWNlYm9vayBJZGVudGl0eSBQcm92aWRlclxuICAgIG5ldyBVc2VyUG9vbElkZW50aXR5UHJvdmlkZXJGYWNlYm9vayh0aGlzLCAnRmFjZWJvb2tQcm92aWRlcicsIHtcbiAgICAgIHVzZXJQb29sOiB0aGlzLnVzZXJQb29sLFxuICAgICAgY2xpZW50SWQ6ICdwbGFjZWhvbGRlci1mYWNlYm9vay1jbGllbnQtaWQnLFxuICAgICAgY2xpZW50U2VjcmV0OiAncGxhY2Vob2xkZXItZmFjZWJvb2stY2xpZW50LXNlY3JldCcsXG4gICAgICBzY29wZXM6IFsnZW1haWwnLCAncHVibGljX3Byb2ZpbGUnXSxcbiAgICAgIGF0dHJpYnV0ZU1hcHBpbmc6IHtcbiAgICAgICAgZW1haWw6IFByb3ZpZGVyQXR0cmlidXRlLkZBQ0VCT09LX0VNQUlMLFxuICAgICAgICBnaXZlbk5hbWU6IFByb3ZpZGVyQXR0cmlidXRlLkZBQ0VCT09LX0ZJUlNUX05BTUUsXG4gICAgICAgIGZhbWlseU5hbWU6IFByb3ZpZGVyQXR0cmlidXRlLkZBQ0VCT09LX0xBU1RfTkFNRSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICAvLyBBbWF6b24gSWRlbnRpdHkgUHJvdmlkZXJcbiAgICBuZXcgVXNlclBvb2xJZGVudGl0eVByb3ZpZGVyQW1hem9uKHRoaXMsICdBbWF6b25Qcm92aWRlcicsIHtcbiAgICAgIHVzZXJQb29sOiB0aGlzLnVzZXJQb29sLFxuICAgICAgY2xpZW50SWQ6ICdwbGFjZWhvbGRlci1hbWF6b24tY2xpZW50LWlkJyxcbiAgICAgIGNsaWVudFNlY3JldDogJ3BsYWNlaG9sZGVyLWFtYXpvbi1jbGllbnQtc2VjcmV0JyxcbiAgICAgIHNjb3BlczogWydwcm9maWxlJ10sXG4gICAgICBhdHRyaWJ1dGVNYXBwaW5nOiB7XG4gICAgICAgIGVtYWlsOiBQcm92aWRlckF0dHJpYnV0ZS5BTUFaT05fRU1BSUwsXG4gICAgICAgIGdpdmVuTmFtZTogUHJvdmlkZXJBdHRyaWJ1dGUuQU1BWk9OX05BTUUsXG4gICAgICB9LFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVVc2VyR3JvdXBzKGVudmlyb25tZW50OiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBncm91cHMgPSBbXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdBZG1pbmlzdHJhdG9ycycsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnU3lzdGVtIGFkbWluaXN0cmF0b3JzIHdpdGggZnVsbCBhY2Nlc3MnLFxuICAgICAgICBwcmVjZWRlbmNlOiAxLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbmFtZTogJ01vZGVyYXRvcnMnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0NvbW11bml0eSBtb2RlcmF0b3JzIHdpdGggY29udGVudCBtYW5hZ2VtZW50IGFjY2VzcycsXG4gICAgICAgIHByZWNlZGVuY2U6IDIsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBuYW1lOiAnUHJlbWl1bVVzZXJzJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdQcmVtaXVtIHVzZXJzIHdpdGggZW5oYW5jZWQgZmVhdHVyZXMnLFxuICAgICAgICBwcmVjZWRlbmNlOiAzLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbmFtZTogJ1N0YW5kYXJkVXNlcnMnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1N0YW5kYXJkIHVzZXJzIHdpdGggYmFzaWMgYWNjZXNzJyxcbiAgICAgICAgcHJlY2VkZW5jZTogNCxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdUZW5hbnRBZG1pbnMnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1RlbmFudCBhZG1pbmlzdHJhdG9ycyBmb3IgbXVsdGktdGVuYW50IGRlcGxveW1lbnRzJyxcbiAgICAgICAgcHJlY2VkZW5jZTogMixcbiAgICAgIH0sXG4gICAgXTtcblxuICAgIGdyb3Vwcy5mb3JFYWNoKGdyb3VwID0+IHtcbiAgICAgIG5ldyBDZm5Vc2VyUG9vbEdyb3VwKHRoaXMsIGAke2dyb3VwLm5hbWV9R3JvdXBgLCB7XG4gICAgICAgIHVzZXJQb29sSWQ6IHRoaXMudXNlclBvb2wudXNlclBvb2xJZCxcbiAgICAgICAgZ3JvdXBOYW1lOiBncm91cC5uYW1lLFxuICAgICAgICBkZXNjcmlwdGlvbjogZ3JvdXAuZGVzY3JpcHRpb24sXG4gICAgICAgIHByZWNlZGVuY2U6IGdyb3VwLnByZWNlZGVuY2UsXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlSWRlbnRpdHlQb29sKGVudmlyb25tZW50OiBzdHJpbmcpOiBJZGVudGl0eVBvb2wge1xuICAgIGNvbnN0IGlkZW50aXR5UG9vbCA9IG5ldyBJZGVudGl0eVBvb2wodGhpcywgJ0lkZW50aXR5UG9vbCcsIHtcbiAgICAgIGlkZW50aXR5UG9vbE5hbWU6IGBtYWRtYWxsXyR7ZW52aXJvbm1lbnR9X2lkZW50aXR5X3Bvb2xgLFxuICAgICAgYWxsb3dVbmF1dGhlbnRpY2F0ZWRJZGVudGl0aWVzOiBmYWxzZSxcbiAgICAgIGF1dGhlbnRpY2F0aW9uUHJvdmlkZXJzOiB7XG4gICAgICAgIHVzZXJQb29sczogW1xuICAgICAgICAgIG5ldyBVc2VyUG9vbEF1dGhlbnRpY2F0aW9uUHJvdmlkZXIoe1xuICAgICAgICAgICAgdXNlclBvb2w6IHRoaXMudXNlclBvb2wsXG4gICAgICAgICAgICB1c2VyUG9vbENsaWVudDogdGhpcy51c2VyUG9vbENsaWVudCxcbiAgICAgICAgICB9KSxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBUYWdzLm9mKGlkZW50aXR5UG9vbCkuYWRkKCdOYW1lJywgYG1hZG1hbGwtJHtlbnZpcm9ubWVudH0taWRlbnRpdHktcG9vbGApO1xuICAgIFRhZ3Mub2YoaWRlbnRpdHlQb29sKS5hZGQoJ0Vudmlyb25tZW50JywgZW52aXJvbm1lbnQpO1xuXG4gICAgcmV0dXJuIGlkZW50aXR5UG9vbDtcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlQXV0aGVudGljYXRlZFJvbGUoZW52aXJvbm1lbnQ6IHN0cmluZyk6IFJvbGUge1xuICAgIGNvbnN0IHJvbGUgPSBuZXcgUm9sZSh0aGlzLCAnQXV0aGVudGljYXRlZFJvbGUnLCB7XG4gICAgICBhc3N1bWVkQnk6IG5ldyBGZWRlcmF0ZWRQcmluY2lwYWwoXG4gICAgICAgICdjb2duaXRvLWlkZW50aXR5LmFtYXpvbmF3cy5jb20nLFxuICAgICAgICB7XG4gICAgICAgICAgU3RyaW5nRXF1YWxzOiB7XG4gICAgICAgICAgICAnY29nbml0by1pZGVudGl0eS5hbWF6b25hd3MuY29tOmF1ZCc6IHRoaXMuaWRlbnRpdHlQb29sLmlkZW50aXR5UG9vbElkLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgJ0ZvckFueVZhbHVlOlN0cmluZ0xpa2UnOiB7XG4gICAgICAgICAgICAnY29nbml0by1pZGVudGl0eS5hbWF6b25hd3MuY29tOmFtcic6ICdhdXRoZW50aWNhdGVkJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICAnc3RzOkFzc3VtZVJvbGVXaXRoV2ViSWRlbnRpdHknXG4gICAgICApLFxuICAgICAgZGVzY3JpcHRpb246IGBBdXRoZW50aWNhdGVkIHJvbGUgZm9yIE1BRE1hbGwgJHtlbnZpcm9ubWVudH0gdXNlcnNgLFxuICAgIH0pO1xuXG4gICAgLy8gQWRkIHBlcm1pc3Npb25zIGZvciBhdXRoZW50aWNhdGVkIHVzZXJzXG4gICAgcm9sZS5hZGRUb1BvbGljeShuZXcgUG9saWN5U3RhdGVtZW50KHtcbiAgICAgIGVmZmVjdDogRWZmZWN0LkFMTE9XLFxuICAgICAgYWN0aW9uczogW1xuICAgICAgICAnY29nbml0by1pZGVudGl0eTpHZXRDcmVkZW50aWFsc0ZvcklkZW50aXR5JyxcbiAgICAgICAgJ2NvZ25pdG8taWRlbnRpdHk6R2V0SWQnLFxuICAgICAgXSxcbiAgICAgIHJlc291cmNlczogWycqJ10sXG4gICAgfSkpO1xuXG4gICAgLy8gQWRkIFMzIHBlcm1pc3Npb25zIGZvciB1c2VyLXNwZWNpZmljIGNvbnRlbnRcbiAgICByb2xlLmFkZFRvUG9saWN5KG5ldyBQb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgZWZmZWN0OiBFZmZlY3QuQUxMT1csXG4gICAgICBhY3Rpb25zOiBbXG4gICAgICAgICdzMzpHZXRPYmplY3QnLFxuICAgICAgICAnczM6UHV0T2JqZWN0JyxcbiAgICAgICAgJ3MzOkRlbGV0ZU9iamVjdCcsXG4gICAgICBdLFxuICAgICAgcmVzb3VyY2VzOiBbXG4gICAgICAgIGBhcm46YXdzOnMzOjo6bWFkbWFsbC0ke2Vudmlyb25tZW50fS11c2VyLWNvbnRlbnQvXFwke2NvZ25pdG8taWRlbnRpdHkuYW1hem9uYXdzLmNvbTpzdWJ9LypgLFxuICAgICAgXSxcbiAgICB9KSk7XG5cbiAgICBUYWdzLm9mKHJvbGUpLmFkZCgnTmFtZScsIGBtYWRtYWxsLSR7ZW52aXJvbm1lbnR9LWF1dGhlbnRpY2F0ZWQtcm9sZWApO1xuICAgIFRhZ3Mub2Yocm9sZSkuYWRkKCdFbnZpcm9ubWVudCcsIGVudmlyb25tZW50KTtcblxuICAgIHJldHVybiByb2xlO1xuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVVbmF1dGhlbnRpY2F0ZWRSb2xlKGVudmlyb25tZW50OiBzdHJpbmcpOiBSb2xlIHtcbiAgICBjb25zdCByb2xlID0gbmV3IFJvbGUodGhpcywgJ1VuYXV0aGVudGljYXRlZFJvbGUnLCB7XG4gICAgICBhc3N1bWVkQnk6IG5ldyBGZWRlcmF0ZWRQcmluY2lwYWwoXG4gICAgICAgICdjb2duaXRvLWlkZW50aXR5LmFtYXpvbmF3cy5jb20nLFxuICAgICAgICB7XG4gICAgICAgICAgU3RyaW5nRXF1YWxzOiB7XG4gICAgICAgICAgICAnY29nbml0by1pZGVudGl0eS5hbWF6b25hd3MuY29tOmF1ZCc6IHRoaXMuaWRlbnRpdHlQb29sLmlkZW50aXR5UG9vbElkLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgJ0ZvckFueVZhbHVlOlN0cmluZ0xpa2UnOiB7XG4gICAgICAgICAgICAnY29nbml0by1pZGVudGl0eS5hbWF6b25hd3MuY29tOmFtcic6ICd1bmF1dGhlbnRpY2F0ZWQnLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgICdzdHM6QXNzdW1lUm9sZVdpdGhXZWJJZGVudGl0eSdcbiAgICAgICksXG4gICAgICBkZXNjcmlwdGlvbjogYFVuYXV0aGVudGljYXRlZCByb2xlIGZvciBNQURNYWxsICR7ZW52aXJvbm1lbnR9IHVzZXJzYCxcbiAgICB9KTtcblxuICAgIC8vIE1pbmltYWwgcGVybWlzc2lvbnMgZm9yIHVuYXV0aGVudGljYXRlZCB1c2Vyc1xuICAgIHJvbGUuYWRkVG9Qb2xpY3kobmV3IFBvbGljeVN0YXRlbWVudCh7XG4gICAgICBlZmZlY3Q6IEVmZmVjdC5BTExPVyxcbiAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgJ2NvZ25pdG8taWRlbnRpdHk6R2V0SWQnLFxuICAgICAgXSxcbiAgICAgIHJlc291cmNlczogWycqJ10sXG4gICAgfSkpO1xuXG4gICAgVGFncy5vZihyb2xlKS5hZGQoJ05hbWUnLCBgbWFkbWFsbC0ke2Vudmlyb25tZW50fS11bmF1dGhlbnRpY2F0ZWQtcm9sZWApO1xuICAgIFRhZ3Mub2Yocm9sZSkuYWRkKCdFbnZpcm9ubWVudCcsIGVudmlyb25tZW50KTtcblxuICAgIHJldHVybiByb2xlO1xuICB9XG59XG5cbi8vIEltcG9ydCBEdXJhdGlvblxuaW1wb3J0IHsgRHVyYXRpb24gfSBmcm9tICdhd3MtY2RrLWxpYic7Il19