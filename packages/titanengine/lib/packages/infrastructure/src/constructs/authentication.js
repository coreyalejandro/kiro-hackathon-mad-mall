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
        new aws_secretsmanager_1.Secret(this, 'GoogleOAuthSecret', {
            secretName: `madmall/${environment}/oauth/google`,
            description: 'Google OAuth credentials for social login',
            generateSecretString: {
                secretStringTemplate: JSON.stringify({ clientId: '' }),
                generateStringKey: 'clientSecret',
                excludeCharacters: '"@/\\',
            },
        });
        new aws_secretsmanager_1.Secret(this, 'FacebookOAuthSecret', {
            secretName: `madmall/${environment}/oauth/facebook`,
            description: 'Facebook OAuth credentials for social login',
            generateSecretString: {
                secretStringTemplate: JSON.stringify({ clientId: '' }),
                generateStringKey: 'clientSecret',
                excludeCharacters: '"@/\\',
            },
        });
        new aws_secretsmanager_1.Secret(this, 'AmazonOAuthSecret', {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aGVudGljYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9pbmZyYXN0cnVjdHVyZS9zcmMvY29uc3RydWN0cy9hdXRoZW50aWNhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwyQ0FBdUM7QUFDdkMseURBY2lDO0FBQ2pDLG1GQUFvRztBQUNwRyxpREFLNkI7QUFDN0IsdUVBQXdEO0FBQ3hELDZDQUFrRDtBQXFDbEQsTUFBYSx1QkFBd0IsU0FBUSxzQkFBUztJQVFwRCxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQW1DO1FBQzNFLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFakIsTUFBTSxFQUNKLFdBQVcsRUFDWCxZQUFZLEVBQ1osWUFBWSxFQUNaLFVBQVUsRUFDVixpQkFBaUIsR0FBRyxJQUFJLEVBQ3hCLFVBQVUsR0FBRyxXQUFXLEtBQUssTUFBTSxHQUNwQyxHQUFHLEtBQUssQ0FBQztRQUVWLG1CQUFtQjtRQUNuQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBRTdELDBCQUEwQjtRQUMxQixJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FDN0MsV0FBVyxFQUNYLFlBQVksRUFDWixVQUFVLEVBQ1YsaUJBQWlCLENBQ2xCLENBQUM7UUFFRiwwQkFBMEI7UUFDMUIsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsV0FBVyxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBRTNFLDJDQUEyQztRQUMzQyxJQUFJLGlCQUFpQixFQUFFLENBQUM7WUFDdEIsSUFBSSxDQUFDLHlCQUF5QixDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzlDLENBQUM7UUFFRCxxQkFBcUI7UUFDckIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxDQUFD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Q3JFLENBQUMsQ0FBQztRQUVILGdEQUFnRDtRQUNoRCxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUkseUJBQWUsQ0FBQztZQUNuQyxNQUFNLEVBQUUsZ0JBQU0sQ0FBQyxLQUFLO1lBQ3BCLE9BQU8sRUFBRTtnQkFDUCx3QkFBd0I7YUFDekI7WUFDRCxTQUFTLEVBQUUsQ0FBQyxHQUFHLENBQUM7U0FDakIsQ0FBQyxDQUFDLENBQUM7UUFFSixrQkFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLFdBQVcsV0FBVyx1QkFBdUIsQ0FBQyxDQUFDO1FBQ3pFLGtCQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFFOUMsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0NBQ0Y7QUE1WkQsMERBNFpDO0FBRUQsa0JBQWtCO0FBQ2xCLDZDQUF1QyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0IHtcbiAgVXNlclBvb2wsXG4gIFVzZXJQb29sQ2xpZW50LFxuICBVc2VyUG9vbERvbWFpbixcbiAgVmVyaWZpY2F0aW9uRW1haWxTdHlsZSxcbiAgTWZhLFxuICBBY2NvdW50UmVjb3ZlcnksXG4gIFVzZXJQb29sSWRlbnRpdHlQcm92aWRlckdvb2dsZSxcbiAgVXNlclBvb2xJZGVudGl0eVByb3ZpZGVyRmFjZWJvb2ssXG4gIFVzZXJQb29sSWRlbnRpdHlQcm92aWRlckFtYXpvbixcbiAgUHJvdmlkZXJBdHRyaWJ1dGUsXG4gIE9BdXRoU2NvcGUsXG4gIFVzZXJQb29sQ2xpZW50SWRlbnRpdHlQcm92aWRlcixcbiAgQ2ZuVXNlclBvb2xHcm91cCxcbn0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWNvZ25pdG8nO1xuaW1wb3J0IHsgSWRlbnRpdHlQb29sLCBVc2VyUG9vbEF1dGhlbnRpY2F0aW9uUHJvdmlkZXIgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtY29nbml0by1pZGVudGl0eXBvb2wnO1xuaW1wb3J0IHtcbiAgUm9sZSxcbiAgUG9saWN5U3RhdGVtZW50LFxuICBFZmZlY3QsXG4gIEZlZGVyYXRlZFByaW5jaXBhbCxcbn0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWlhbSc7XG5pbXBvcnQgeyBTZWNyZXQgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3Mtc2VjcmV0c21hbmFnZXInO1xuaW1wb3J0IHsgUmVtb3ZhbFBvbGljeSwgVGFncyB9IGZyb20gJ2F3cy1jZGstbGliJztcblxuZXhwb3J0IGludGVyZmFjZSBBdXRoZW50aWNhdGlvbkNvbnN0cnVjdFByb3BzIHtcbiAgLyoqXG4gICAqIEVudmlyb25tZW50IG5hbWUgKGRldiwgc3RhZ2luZywgcHJvZClcbiAgICovXG4gIGVudmlyb25tZW50OiBzdHJpbmc7XG4gIFxuICAvKipcbiAgICogQ3VzdG9tIGRvbWFpbiBmb3IgQ29nbml0byBob3N0ZWQgVUlcbiAgICogQGV4YW1wbGUgJ2F1dGgubWFkbWFsbC5jb20nXG4gICAqL1xuICBjdXN0b21Eb21haW4/OiBzdHJpbmc7XG4gIFxuICAvKipcbiAgICogQ2FsbGJhY2sgVVJMcyBmb3IgT0F1dGggZmxvd3NcbiAgICovXG4gIGNhbGxiYWNrVXJsczogc3RyaW5nW107XG4gIFxuICAvKipcbiAgICogTG9nb3V0IFVSTHMgZm9yIE9BdXRoIGZsb3dzXG4gICAqL1xuICBsb2dvdXRVcmxzOiBzdHJpbmdbXTtcbiAgXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRvIGVuYWJsZSBzb2NpYWwgbG9naW4gcHJvdmlkZXJzXG4gICAqIEBkZWZhdWx0IHRydWVcbiAgICovXG4gIGVuYWJsZVNvY2lhbExvZ2luPzogYm9vbGVhbjtcbiAgXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRvIHJlcXVpcmUgTUZBXG4gICAqIEBkZWZhdWx0IHRydWUgZm9yIHByb2QsIGZhbHNlIGZvciBvdGhlcnNcbiAgICovXG4gIHJlcXVpcmVNZmE/OiBib29sZWFuO1xufVxuXG5leHBvcnQgY2xhc3MgQXV0aGVudGljYXRpb25Db25zdHJ1Y3QgZXh0ZW5kcyBDb25zdHJ1Y3Qge1xuICBwdWJsaWMgcmVhZG9ubHkgdXNlclBvb2w6IFVzZXJQb29sO1xuICBwdWJsaWMgcmVhZG9ubHkgdXNlclBvb2xDbGllbnQ6IFVzZXJQb29sQ2xpZW50O1xuICBwdWJsaWMgcmVhZG9ubHkgdXNlclBvb2xEb21haW46IFVzZXJQb29sRG9tYWluO1xuICBwdWJsaWMgcmVhZG9ubHkgaWRlbnRpdHlQb29sOiBJZGVudGl0eVBvb2w7XG4gIHB1YmxpYyByZWFkb25seSBhdXRoZW50aWNhdGVkUm9sZTogUm9sZTtcbiAgcHVibGljIHJlYWRvbmx5IHVuYXV0aGVudGljYXRlZFJvbGU6IFJvbGU7XG5cbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM6IEF1dGhlbnRpY2F0aW9uQ29uc3RydWN0UHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQpO1xuXG4gICAgY29uc3Qge1xuICAgICAgZW52aXJvbm1lbnQsXG4gICAgICBjdXN0b21Eb21haW4sXG4gICAgICBjYWxsYmFja1VybHMsXG4gICAgICBsb2dvdXRVcmxzLFxuICAgICAgZW5hYmxlU29jaWFsTG9naW4gPSB0cnVlLFxuICAgICAgcmVxdWlyZU1mYSA9IGVudmlyb25tZW50ID09PSAncHJvZCcsXG4gICAgfSA9IHByb3BzO1xuXG4gICAgLy8gQ3JlYXRlIFVzZXIgUG9vbFxuICAgIHRoaXMudXNlclBvb2wgPSB0aGlzLmNyZWF0ZVVzZXJQb29sKGVudmlyb25tZW50LCByZXF1aXJlTWZhKTtcblxuICAgIC8vIENyZWF0ZSBVc2VyIFBvb2wgQ2xpZW50XG4gICAgdGhpcy51c2VyUG9vbENsaWVudCA9IHRoaXMuY3JlYXRlVXNlclBvb2xDbGllbnQoXG4gICAgICBlbnZpcm9ubWVudCxcbiAgICAgIGNhbGxiYWNrVXJscyxcbiAgICAgIGxvZ291dFVybHMsXG4gICAgICBlbmFibGVTb2NpYWxMb2dpblxuICAgICk7XG5cbiAgICAvLyBDcmVhdGUgVXNlciBQb29sIERvbWFpblxuICAgIHRoaXMudXNlclBvb2xEb21haW4gPSB0aGlzLmNyZWF0ZVVzZXJQb29sRG9tYWluKGVudmlyb25tZW50LCBjdXN0b21Eb21haW4pO1xuXG4gICAgLy8gU2V0IHVwIHNvY2lhbCBsb2dpbiBwcm92aWRlcnMgaWYgZW5hYmxlZFxuICAgIGlmIChlbmFibGVTb2NpYWxMb2dpbikge1xuICAgICAgdGhpcy5zZXR1cFNvY2lhbExvZ2luUHJvdmlkZXJzKGVudmlyb25tZW50KTtcbiAgICB9XG5cbiAgICAvLyBDcmVhdGUgdXNlciBncm91cHNcbiAgICB0aGlzLmNyZWF0ZVVzZXJHcm91cHMoZW52aXJvbm1lbnQpO1xuXG4gICAgLy8gQ3JlYXRlIElkZW50aXR5IFBvb2xcbiAgICB0aGlzLmlkZW50aXR5UG9vbCA9IHRoaXMuY3JlYXRlSWRlbnRpdHlQb29sKGVudmlyb25tZW50KTtcblxuICAgIC8vIENyZWF0ZSBJQU0gcm9sZXMgZm9yIGF1dGhlbnRpY2F0ZWQgYW5kIHVuYXV0aGVudGljYXRlZCB1c2Vyc1xuICAgIHRoaXMuYXV0aGVudGljYXRlZFJvbGUgPSB0aGlzLmNyZWF0ZUF1dGhlbnRpY2F0ZWRSb2xlKGVudmlyb25tZW50KTtcbiAgICB0aGlzLnVuYXV0aGVudGljYXRlZFJvbGUgPSB0aGlzLmNyZWF0ZVVuYXV0aGVudGljYXRlZFJvbGUoZW52aXJvbm1lbnQpO1xuXG4gICAgLy8gQXNzaWduIHJvbGVzIHRvIElkZW50aXR5IFBvb2wgdmlhIHJvbGVBdHRhY2htZW50XG4gICAgdGhpcy5pZGVudGl0eVBvb2wucm9sZUF0dGFjaG1lbnQucm9sZXMgPSB7XG4gICAgICBhdXRoZW50aWNhdGVkOiB0aGlzLmF1dGhlbnRpY2F0ZWRSb2xlLnJvbGVBcm4sXG4gICAgICB1bmF1dGhlbnRpY2F0ZWQ6IHRoaXMudW5hdXRoZW50aWNhdGVkUm9sZS5yb2xlQXJuLFxuICAgIH0gYXMgYW55O1xuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVVc2VyUG9vbChlbnZpcm9ubWVudDogc3RyaW5nLCByZXF1aXJlTWZhOiBib29sZWFuKTogVXNlclBvb2wge1xuICAgIGNvbnN0IHVzZXJQb29sID0gbmV3IFVzZXJQb29sKHRoaXMsICdVc2VyUG9vbCcsIHtcbiAgICAgIHVzZXJQb29sTmFtZTogYG1hZG1hbGwtJHtlbnZpcm9ubWVudH0tdXNlcnNgLFxuICAgICAgc2VsZlNpZ25VcEVuYWJsZWQ6IHRydWUsXG4gICAgICBzaWduSW5BbGlhc2VzOiB7XG4gICAgICAgIGVtYWlsOiB0cnVlLFxuICAgICAgICB1c2VybmFtZTogZmFsc2UsXG4gICAgICAgIHBob25lOiBmYWxzZSxcbiAgICAgIH0sXG4gICAgICBhdXRvVmVyaWZ5OiB7XG4gICAgICAgIGVtYWlsOiB0cnVlLFxuICAgICAgfSxcbiAgICAgIHN0YW5kYXJkQXR0cmlidXRlczoge1xuICAgICAgICBlbWFpbDoge1xuICAgICAgICAgIHJlcXVpcmVkOiB0cnVlLFxuICAgICAgICAgIG11dGFibGU6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICAgIGdpdmVuTmFtZToge1xuICAgICAgICAgIHJlcXVpcmVkOiB0cnVlLFxuICAgICAgICAgIG11dGFibGU6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICAgIGZhbWlseU5hbWU6IHtcbiAgICAgICAgICByZXF1aXJlZDogdHJ1ZSxcbiAgICAgICAgICBtdXRhYmxlOiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgICBwcm9maWxlUGljdHVyZToge1xuICAgICAgICAgIHJlcXVpcmVkOiBmYWxzZSxcbiAgICAgICAgICBtdXRhYmxlOiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGN1c3RvbUF0dHJpYnV0ZXM6IHtcbiAgICAgICAgY3VsdHVyYWxCYWNrZ3JvdW5kOiBuZXcgKFVzZXJQb29sIGFzIGFueSkuQ3VzdG9tQXR0cmlidXRlKHsgbXV0YWJsZTogdHJ1ZSwgZGF0YVR5cGU6ICdTdHJpbmcnIH0pLFxuICAgICAgICBjb21tdW5pY2F0aW9uU3R5bGU6IG5ldyAoVXNlclBvb2wgYXMgYW55KS5DdXN0b21BdHRyaWJ1dGUoeyBtdXRhYmxlOiB0cnVlLCBkYXRhVHlwZTogJ1N0cmluZycgfSksXG4gICAgICAgIGRpYWdub3Npc1N0YWdlOiBuZXcgKFVzZXJQb29sIGFzIGFueSkuQ3VzdG9tQXR0cmlidXRlKHsgbXV0YWJsZTogdHJ1ZSwgZGF0YVR5cGU6ICdTdHJpbmcnIH0pLFxuICAgICAgICB0ZW5hbnRJZDogbmV3IChVc2VyUG9vbCBhcyBhbnkpLkN1c3RvbUF0dHJpYnV0ZSh7IG11dGFibGU6IGZhbHNlLCBkYXRhVHlwZTogJ1N0cmluZycgfSksXG4gICAgICB9IGFzIGFueSxcbiAgICAgIHBhc3N3b3JkUG9saWN5OiB7XG4gICAgICAgIG1pbkxlbmd0aDogOCxcbiAgICAgICAgcmVxdWlyZUxvd2VyY2FzZTogdHJ1ZSxcbiAgICAgICAgcmVxdWlyZVVwcGVyY2FzZTogdHJ1ZSxcbiAgICAgICAgcmVxdWlyZURpZ2l0czogdHJ1ZSxcbiAgICAgICAgcmVxdWlyZVN5bWJvbHM6IHRydWUsXG4gICAgICB9LFxuICAgICAgbWZhOiByZXF1aXJlTWZhID8gTWZhLlJFUVVJUkVEIDogTWZhLk9QVElPTkFMLFxuICAgICAgbWZhU2Vjb25kRmFjdG9yOiB7XG4gICAgICAgIHNtczogdHJ1ZSxcbiAgICAgICAgb3RwOiB0cnVlLFxuICAgICAgfSxcbiAgICAgIGFjY291bnRSZWNvdmVyeTogQWNjb3VudFJlY292ZXJ5LkVNQUlMX09OTFksXG4gICAgICB1c2VyVmVyaWZpY2F0aW9uOiB7XG4gICAgICAgIGVtYWlsU3ViamVjdDogJ1dlbGNvbWUgdG8gTUFETWFsbCAtIFZlcmlmeSB5b3VyIGVtYWlsJyxcbiAgICAgICAgZW1haWxCb2R5OiAnSGVsbG8ge3VzZXJuYW1lfSwgV2VsY29tZSB0byBNQURNYWxsISBZb3VyIHZlcmlmaWNhdGlvbiBjb2RlIGlzIHsjIyMjfScsXG4gICAgICAgIGVtYWlsU3R5bGU6IFZlcmlmaWNhdGlvbkVtYWlsU3R5bGUuQ09ERSxcbiAgICAgIH0sXG4gICAgICB1c2VySW52aXRhdGlvbjoge1xuICAgICAgICBlbWFpbFN1YmplY3Q6ICdZb3UgaGF2ZSBiZWVuIGludml0ZWQgdG8gam9pbiBNQURNYWxsJyxcbiAgICAgICAgZW1haWxCb2R5OiAnSGVsbG8ge3VzZXJuYW1lfSwgeW91IGhhdmUgYmVlbiBpbnZpdGVkIHRvIGpvaW4gTUFETWFsbC4gWW91ciB0ZW1wb3JhcnkgcGFzc3dvcmQgaXMgeyMjIyN9JyxcbiAgICAgIH0sXG4gICAgICByZW1vdmFsUG9saWN5OiBlbnZpcm9ubWVudCA9PT0gJ3Byb2QnID8gUmVtb3ZhbFBvbGljeS5SRVRBSU4gOiBSZW1vdmFsUG9saWN5LkRFU1RST1ksXG4gICAgfSk7XG5cbiAgICBUYWdzLm9mKHVzZXJQb29sKS5hZGQoJ05hbWUnLCBgbWFkbWFsbC0ke2Vudmlyb25tZW50fS11c2VyLXBvb2xgKTtcbiAgICBUYWdzLm9mKHVzZXJQb29sKS5hZGQoJ0Vudmlyb25tZW50JywgZW52aXJvbm1lbnQpO1xuXG4gICAgcmV0dXJuIHVzZXJQb29sO1xuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVVc2VyUG9vbENsaWVudChcbiAgICBlbnZpcm9ubWVudDogc3RyaW5nLFxuICAgIGNhbGxiYWNrVXJsczogc3RyaW5nW10sXG4gICAgbG9nb3V0VXJsczogc3RyaW5nW10sXG4gICAgZW5hYmxlU29jaWFsTG9naW46IGJvb2xlYW5cbiAgKTogVXNlclBvb2xDbGllbnQge1xuICAgIGNvbnN0IHN1cHBvcnRlZElkZW50aXR5UHJvdmlkZXJzID0gW1VzZXJQb29sQ2xpZW50SWRlbnRpdHlQcm92aWRlci5DT0dOSVRPXTtcbiAgICBcbiAgICBpZiAoZW5hYmxlU29jaWFsTG9naW4pIHtcbiAgICAgIHN1cHBvcnRlZElkZW50aXR5UHJvdmlkZXJzLnB1c2goXG4gICAgICAgIFVzZXJQb29sQ2xpZW50SWRlbnRpdHlQcm92aWRlci5HT09HTEUsXG4gICAgICAgIFVzZXJQb29sQ2xpZW50SWRlbnRpdHlQcm92aWRlci5GQUNFQk9PSyxcbiAgICAgICAgVXNlclBvb2xDbGllbnRJZGVudGl0eVByb3ZpZGVyLkFNQVpPTlxuICAgICAgKTtcbiAgICB9XG5cbiAgICBjb25zdCBjbGllbnQgPSBuZXcgVXNlclBvb2xDbGllbnQodGhpcywgJ1VzZXJQb29sQ2xpZW50Jywge1xuICAgICAgdXNlclBvb2w6IHRoaXMudXNlclBvb2wsXG4gICAgICB1c2VyUG9vbENsaWVudE5hbWU6IGBtYWRtYWxsLSR7ZW52aXJvbm1lbnR9LWNsaWVudGAsXG4gICAgICBnZW5lcmF0ZVNlY3JldDogZmFsc2UsIC8vIEZvciB3ZWIgYXBwbGljYXRpb25zXG4gICAgICBhdXRoRmxvd3M6IHtcbiAgICAgICAgdXNlclNycDogdHJ1ZSxcbiAgICAgICAgdXNlclBhc3N3b3JkOiBmYWxzZSwgLy8gRGlzYWJsZSBmb3Igc2VjdXJpdHlcbiAgICAgICAgYWRtaW5Vc2VyUGFzc3dvcmQ6IHRydWUsIC8vIEZvciBzZXJ2ZXItc2lkZSBvcGVyYXRpb25zXG4gICAgICAgIGN1c3RvbTogdHJ1ZSxcbiAgICAgIH0sXG4gICAgICBvQXV0aDoge1xuICAgICAgICBmbG93czoge1xuICAgICAgICAgIGF1dGhvcml6YXRpb25Db2RlR3JhbnQ6IHRydWUsXG4gICAgICAgICAgaW1wbGljaXRDb2RlR3JhbnQ6IGZhbHNlLCAvLyBEaXNhYmxlZCBmb3Igc2VjdXJpdHlcbiAgICAgICAgfSxcbiAgICAgICAgc2NvcGVzOiBbXG4gICAgICAgICAgT0F1dGhTY29wZS5FTUFJTCxcbiAgICAgICAgICBPQXV0aFNjb3BlLk9QRU5JRCxcbiAgICAgICAgICBPQXV0aFNjb3BlLlBST0ZJTEUsXG4gICAgICAgICAgT0F1dGhTY29wZS5DT0dOSVRPX0FETUlOLFxuICAgICAgICBdLFxuICAgICAgICBjYWxsYmFja1VybHMsXG4gICAgICAgIGxvZ291dFVybHMsXG4gICAgICB9LFxuICAgICAgc3VwcG9ydGVkSWRlbnRpdHlQcm92aWRlcnMsXG4gICAgICByZWFkQXR0cmlidXRlczogdW5kZWZpbmVkLFxuICAgICAgd3JpdGVBdHRyaWJ1dGVzOiB1bmRlZmluZWQsXG4gICAgICBwcmV2ZW50VXNlckV4aXN0ZW5jZUVycm9yczogdHJ1ZSxcbiAgICAgIHJlZnJlc2hUb2tlblZhbGlkaXR5OiBEdXJhdGlvbi5kYXlzKDMwKSxcbiAgICAgIGFjY2Vzc1Rva2VuVmFsaWRpdHk6IER1cmF0aW9uLmhvdXJzKDEpLFxuICAgICAgaWRUb2tlblZhbGlkaXR5OiBEdXJhdGlvbi5ob3VycygxKSxcbiAgICB9KTtcblxuICAgIFRhZ3Mub2YoY2xpZW50KS5hZGQoJ05hbWUnLCBgbWFkbWFsbC0ke2Vudmlyb25tZW50fS11c2VyLXBvb2wtY2xpZW50YCk7XG4gICAgVGFncy5vZihjbGllbnQpLmFkZCgnRW52aXJvbm1lbnQnLCBlbnZpcm9ubWVudCk7XG5cbiAgICByZXR1cm4gY2xpZW50O1xuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVVc2VyUG9vbERvbWFpbihlbnZpcm9ubWVudDogc3RyaW5nLCBjdXN0b21Eb21haW4/OiBzdHJpbmcpOiBVc2VyUG9vbERvbWFpbiB7XG4gICAgY29uc3QgZG9tYWluUHJvcHM6IGFueSA9IHtcbiAgICAgIHVzZXJQb29sOiB0aGlzLnVzZXJQb29sLFxuICAgIH07XG5cbiAgICBpZiAoY3VzdG9tRG9tYWluKSB7XG4gICAgICBkb21haW5Qcm9wcy5jdXN0b21Eb21haW4gPSB7XG4gICAgICAgIGRvbWFpbk5hbWU6IGN1c3RvbURvbWFpbixcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGRvbWFpblByb3BzLmNvZ25pdG9Eb21haW4gPSB7XG4gICAgICAgIGRvbWFpblByZWZpeDogYG1hZG1hbGwtJHtlbnZpcm9ubWVudH1gLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBjb25zdCBkb21haW4gPSBuZXcgVXNlclBvb2xEb21haW4odGhpcywgJ1VzZXJQb29sRG9tYWluJywgZG9tYWluUHJvcHMpO1xuXG4gICAgVGFncy5vZihkb21haW4pLmFkZCgnTmFtZScsIGBtYWRtYWxsLSR7ZW52aXJvbm1lbnR9LWF1dGgtZG9tYWluYCk7XG4gICAgVGFncy5vZihkb21haW4pLmFkZCgnRW52aXJvbm1lbnQnLCBlbnZpcm9ubWVudCk7XG5cbiAgICByZXR1cm4gZG9tYWluO1xuICB9XG5cbiAgcHJpdmF0ZSBzZXR1cFNvY2lhbExvZ2luUHJvdmlkZXJzKGVudmlyb25tZW50OiBzdHJpbmcpOiB2b2lkIHtcbiAgICAvLyBDcmVhdGUgc2VjcmV0cyBmb3Igc29jaWFsIGxvZ2luIHByb3ZpZGVyIGNyZWRlbnRpYWxzXG4gICAgbmV3IFNlY3JldCh0aGlzLCAnR29vZ2xlT0F1dGhTZWNyZXQnLCB7XG4gICAgICBzZWNyZXROYW1lOiBgbWFkbWFsbC8ke2Vudmlyb25tZW50fS9vYXV0aC9nb29nbGVgLFxuICAgICAgZGVzY3JpcHRpb246ICdHb29nbGUgT0F1dGggY3JlZGVudGlhbHMgZm9yIHNvY2lhbCBsb2dpbicsXG4gICAgICBnZW5lcmF0ZVNlY3JldFN0cmluZzoge1xuICAgICAgICBzZWNyZXRTdHJpbmdUZW1wbGF0ZTogSlNPTi5zdHJpbmdpZnkoeyBjbGllbnRJZDogJycgfSksXG4gICAgICAgIGdlbmVyYXRlU3RyaW5nS2V5OiAnY2xpZW50U2VjcmV0JyxcbiAgICAgICAgZXhjbHVkZUNoYXJhY3RlcnM6ICdcIkAvXFxcXCcsXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgbmV3IFNlY3JldCh0aGlzLCAnRmFjZWJvb2tPQXV0aFNlY3JldCcsIHtcbiAgICAgIHNlY3JldE5hbWU6IGBtYWRtYWxsLyR7ZW52aXJvbm1lbnR9L29hdXRoL2ZhY2Vib29rYCxcbiAgICAgIGRlc2NyaXB0aW9uOiAnRmFjZWJvb2sgT0F1dGggY3JlZGVudGlhbHMgZm9yIHNvY2lhbCBsb2dpbicsXG4gICAgICBnZW5lcmF0ZVNlY3JldFN0cmluZzoge1xuICAgICAgICBzZWNyZXRTdHJpbmdUZW1wbGF0ZTogSlNPTi5zdHJpbmdpZnkoeyBjbGllbnRJZDogJycgfSksXG4gICAgICAgIGdlbmVyYXRlU3RyaW5nS2V5OiAnY2xpZW50U2VjcmV0JyxcbiAgICAgICAgZXhjbHVkZUNoYXJhY3RlcnM6ICdcIkAvXFxcXCcsXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgbmV3IFNlY3JldCh0aGlzLCAnQW1hem9uT0F1dGhTZWNyZXQnLCB7XG4gICAgICBzZWNyZXROYW1lOiBgbWFkbWFsbC8ke2Vudmlyb25tZW50fS9vYXV0aC9hbWF6b25gLFxuICAgICAgZGVzY3JpcHRpb246ICdBbWF6b24gT0F1dGggY3JlZGVudGlhbHMgZm9yIHNvY2lhbCBsb2dpbicsXG4gICAgICBnZW5lcmF0ZVNlY3JldFN0cmluZzoge1xuICAgICAgICBzZWNyZXRTdHJpbmdUZW1wbGF0ZTogSlNPTi5zdHJpbmdpZnkoeyBjbGllbnRJZDogJycgfSksXG4gICAgICAgIGdlbmVyYXRlU3RyaW5nS2V5OiAnY2xpZW50U2VjcmV0JyxcbiAgICAgICAgZXhjbHVkZUNoYXJhY3RlcnM6ICdcIkAvXFxcXCcsXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgLy8gTm90ZTogSW4gYSByZWFsIGltcGxlbWVudGF0aW9uLCB5b3Ugd291bGQgcmV0cmlldmUgdGhlc2UgdmFsdWVzIGZyb20gdGhlIHNlY3JldHNcbiAgICAvLyBhbmQgY29uZmlndXJlIHRoZSBpZGVudGl0eSBwcm92aWRlcnMuIEZvciBub3csIHdlJ2xsIGNyZWF0ZSBwbGFjZWhvbGRlciBwcm92aWRlcnMuXG4gICAgXG4gICAgLy8gR29vZ2xlIElkZW50aXR5IFByb3ZpZGVyXG4gICAgbmV3IFVzZXJQb29sSWRlbnRpdHlQcm92aWRlckdvb2dsZSh0aGlzLCAnR29vZ2xlUHJvdmlkZXInLCB7XG4gICAgICB1c2VyUG9vbDogdGhpcy51c2VyUG9vbCxcbiAgICAgIGNsaWVudElkOiAncGxhY2Vob2xkZXItZ29vZ2xlLWNsaWVudC1pZCcsXG4gICAgICBjbGllbnRTZWNyZXQ6ICdwbGFjZWhvbGRlci1nb29nbGUtY2xpZW50LXNlY3JldCcsXG4gICAgICBzY29wZXM6IFsnZW1haWwnLCAncHJvZmlsZSddLFxuICAgICAgYXR0cmlidXRlTWFwcGluZzoge1xuICAgICAgICBlbWFpbDogUHJvdmlkZXJBdHRyaWJ1dGUuR09PR0xFX0VNQUlMLFxuICAgICAgICBnaXZlbk5hbWU6IFByb3ZpZGVyQXR0cmlidXRlLkdPT0dMRV9HSVZFTl9OQU1FLFxuICAgICAgICBmYW1pbHlOYW1lOiBQcm92aWRlckF0dHJpYnV0ZS5HT09HTEVfRkFNSUxZX05BTUUsXG4gICAgICAgIHByb2ZpbGVQaWN0dXJlOiBQcm92aWRlckF0dHJpYnV0ZS5HT09HTEVfUElDVFVSRSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICAvLyBGYWNlYm9vayBJZGVudGl0eSBQcm92aWRlclxuICAgIG5ldyBVc2VyUG9vbElkZW50aXR5UHJvdmlkZXJGYWNlYm9vayh0aGlzLCAnRmFjZWJvb2tQcm92aWRlcicsIHtcbiAgICAgIHVzZXJQb29sOiB0aGlzLnVzZXJQb29sLFxuICAgICAgY2xpZW50SWQ6ICdwbGFjZWhvbGRlci1mYWNlYm9vay1jbGllbnQtaWQnLFxuICAgICAgY2xpZW50U2VjcmV0OiAncGxhY2Vob2xkZXItZmFjZWJvb2stY2xpZW50LXNlY3JldCcsXG4gICAgICBzY29wZXM6IFsnZW1haWwnLCAncHVibGljX3Byb2ZpbGUnXSxcbiAgICAgIGF0dHJpYnV0ZU1hcHBpbmc6IHtcbiAgICAgICAgZW1haWw6IFByb3ZpZGVyQXR0cmlidXRlLkZBQ0VCT09LX0VNQUlMLFxuICAgICAgICBnaXZlbk5hbWU6IFByb3ZpZGVyQXR0cmlidXRlLkZBQ0VCT09LX0ZJUlNUX05BTUUsXG4gICAgICAgIGZhbWlseU5hbWU6IFByb3ZpZGVyQXR0cmlidXRlLkZBQ0VCT09LX0xBU1RfTkFNRSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICAvLyBBbWF6b24gSWRlbnRpdHkgUHJvdmlkZXJcbiAgICBuZXcgVXNlclBvb2xJZGVudGl0eVByb3ZpZGVyQW1hem9uKHRoaXMsICdBbWF6b25Qcm92aWRlcicsIHtcbiAgICAgIHVzZXJQb29sOiB0aGlzLnVzZXJQb29sLFxuICAgICAgY2xpZW50SWQ6ICdwbGFjZWhvbGRlci1hbWF6b24tY2xpZW50LWlkJyxcbiAgICAgIGNsaWVudFNlY3JldDogJ3BsYWNlaG9sZGVyLWFtYXpvbi1jbGllbnQtc2VjcmV0JyxcbiAgICAgIHNjb3BlczogWydwcm9maWxlJ10sXG4gICAgICBhdHRyaWJ1dGVNYXBwaW5nOiB7XG4gICAgICAgIGVtYWlsOiBQcm92aWRlckF0dHJpYnV0ZS5BTUFaT05fRU1BSUwsXG4gICAgICAgIGdpdmVuTmFtZTogUHJvdmlkZXJBdHRyaWJ1dGUuQU1BWk9OX05BTUUsXG4gICAgICB9LFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVVc2VyR3JvdXBzKGVudmlyb25tZW50OiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBncm91cHMgPSBbXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdBZG1pbmlzdHJhdG9ycycsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnU3lzdGVtIGFkbWluaXN0cmF0b3JzIHdpdGggZnVsbCBhY2Nlc3MnLFxuICAgICAgICBwcmVjZWRlbmNlOiAxLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbmFtZTogJ01vZGVyYXRvcnMnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0NvbW11bml0eSBtb2RlcmF0b3JzIHdpdGggY29udGVudCBtYW5hZ2VtZW50IGFjY2VzcycsXG4gICAgICAgIHByZWNlZGVuY2U6IDIsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBuYW1lOiAnUHJlbWl1bVVzZXJzJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdQcmVtaXVtIHVzZXJzIHdpdGggZW5oYW5jZWQgZmVhdHVyZXMnLFxuICAgICAgICBwcmVjZWRlbmNlOiAzLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbmFtZTogJ1N0YW5kYXJkVXNlcnMnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1N0YW5kYXJkIHVzZXJzIHdpdGggYmFzaWMgYWNjZXNzJyxcbiAgICAgICAgcHJlY2VkZW5jZTogNCxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdUZW5hbnRBZG1pbnMnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1RlbmFudCBhZG1pbmlzdHJhdG9ycyBmb3IgbXVsdGktdGVuYW50IGRlcGxveW1lbnRzJyxcbiAgICAgICAgcHJlY2VkZW5jZTogMixcbiAgICAgIH0sXG4gICAgXTtcblxuICAgIGdyb3Vwcy5mb3JFYWNoKGdyb3VwID0+IHtcbiAgICAgIG5ldyBDZm5Vc2VyUG9vbEdyb3VwKHRoaXMsIGAke2dyb3VwLm5hbWV9R3JvdXBgLCB7XG4gICAgICAgIHVzZXJQb29sSWQ6IHRoaXMudXNlclBvb2wudXNlclBvb2xJZCxcbiAgICAgICAgZ3JvdXBOYW1lOiBncm91cC5uYW1lLFxuICAgICAgICBkZXNjcmlwdGlvbjogZ3JvdXAuZGVzY3JpcHRpb24sXG4gICAgICAgIHByZWNlZGVuY2U6IGdyb3VwLnByZWNlZGVuY2UsXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlSWRlbnRpdHlQb29sKGVudmlyb25tZW50OiBzdHJpbmcpOiBJZGVudGl0eVBvb2wge1xuICAgIGNvbnN0IGlkZW50aXR5UG9vbCA9IG5ldyBJZGVudGl0eVBvb2wodGhpcywgJ0lkZW50aXR5UG9vbCcsIHtcbiAgICAgIGlkZW50aXR5UG9vbE5hbWU6IGBtYWRtYWxsXyR7ZW52aXJvbm1lbnR9X2lkZW50aXR5X3Bvb2xgLFxuICAgICAgYWxsb3dVbmF1dGhlbnRpY2F0ZWRJZGVudGl0aWVzOiBmYWxzZSxcbiAgICAgIGF1dGhlbnRpY2F0aW9uUHJvdmlkZXJzOiB7XG4gICAgICAgIHVzZXJQb29sczogW1xuICAgICAgICAgIG5ldyBVc2VyUG9vbEF1dGhlbnRpY2F0aW9uUHJvdmlkZXIoe1xuICAgICAgICAgICAgdXNlclBvb2w6IHRoaXMudXNlclBvb2wsXG4gICAgICAgICAgICB1c2VyUG9vbENsaWVudDogdGhpcy51c2VyUG9vbENsaWVudCxcbiAgICAgICAgICB9KSxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBUYWdzLm9mKGlkZW50aXR5UG9vbCkuYWRkKCdOYW1lJywgYG1hZG1hbGwtJHtlbnZpcm9ubWVudH0taWRlbnRpdHktcG9vbGApO1xuICAgIFRhZ3Mub2YoaWRlbnRpdHlQb29sKS5hZGQoJ0Vudmlyb25tZW50JywgZW52aXJvbm1lbnQpO1xuXG4gICAgcmV0dXJuIGlkZW50aXR5UG9vbDtcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlQXV0aGVudGljYXRlZFJvbGUoZW52aXJvbm1lbnQ6IHN0cmluZyk6IFJvbGUge1xuICAgIGNvbnN0IHJvbGUgPSBuZXcgUm9sZSh0aGlzLCAnQXV0aGVudGljYXRlZFJvbGUnLCB7XG4gICAgICBhc3N1bWVkQnk6IG5ldyBGZWRlcmF0ZWRQcmluY2lwYWwoXG4gICAgICAgICdjb2duaXRvLWlkZW50aXR5LmFtYXpvbmF3cy5jb20nLFxuICAgICAgICB7XG4gICAgICAgICAgU3RyaW5nRXF1YWxzOiB7XG4gICAgICAgICAgICAnY29nbml0by1pZGVudGl0eS5hbWF6b25hd3MuY29tOmF1ZCc6IHRoaXMuaWRlbnRpdHlQb29sLmlkZW50aXR5UG9vbElkLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgJ0ZvckFueVZhbHVlOlN0cmluZ0xpa2UnOiB7XG4gICAgICAgICAgICAnY29nbml0by1pZGVudGl0eS5hbWF6b25hd3MuY29tOmFtcic6ICdhdXRoZW50aWNhdGVkJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICAnc3RzOkFzc3VtZVJvbGVXaXRoV2ViSWRlbnRpdHknXG4gICAgICApLFxuICAgICAgZGVzY3JpcHRpb246IGBBdXRoZW50aWNhdGVkIHJvbGUgZm9yIE1BRE1hbGwgJHtlbnZpcm9ubWVudH0gdXNlcnNgLFxuICAgIH0pO1xuXG4gICAgLy8gQWRkIHBlcm1pc3Npb25zIGZvciBhdXRoZW50aWNhdGVkIHVzZXJzXG4gICAgcm9sZS5hZGRUb1BvbGljeShuZXcgUG9saWN5U3RhdGVtZW50KHtcbiAgICAgIGVmZmVjdDogRWZmZWN0LkFMTE9XLFxuICAgICAgYWN0aW9uczogW1xuICAgICAgICAnY29nbml0by1pZGVudGl0eTpHZXRDcmVkZW50aWFsc0ZvcklkZW50aXR5JyxcbiAgICAgICAgJ2NvZ25pdG8taWRlbnRpdHk6R2V0SWQnLFxuICAgICAgXSxcbiAgICAgIHJlc291cmNlczogWycqJ10sXG4gICAgfSkpO1xuXG4gICAgLy8gQWRkIFMzIHBlcm1pc3Npb25zIGZvciB1c2VyLXNwZWNpZmljIGNvbnRlbnRcbiAgICByb2xlLmFkZFRvUG9saWN5KG5ldyBQb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgZWZmZWN0OiBFZmZlY3QuQUxMT1csXG4gICAgICBhY3Rpb25zOiBbXG4gICAgICAgICdzMzpHZXRPYmplY3QnLFxuICAgICAgICAnczM6UHV0T2JqZWN0JyxcbiAgICAgICAgJ3MzOkRlbGV0ZU9iamVjdCcsXG4gICAgICBdLFxuICAgICAgcmVzb3VyY2VzOiBbXG4gICAgICAgIGBhcm46YXdzOnMzOjo6bWFkbWFsbC0ke2Vudmlyb25tZW50fS11c2VyLWNvbnRlbnQvXFwke2NvZ25pdG8taWRlbnRpdHkuYW1hem9uYXdzLmNvbTpzdWJ9LypgLFxuICAgICAgXSxcbiAgICB9KSk7XG5cbiAgICBUYWdzLm9mKHJvbGUpLmFkZCgnTmFtZScsIGBtYWRtYWxsLSR7ZW52aXJvbm1lbnR9LWF1dGhlbnRpY2F0ZWQtcm9sZWApO1xuICAgIFRhZ3Mub2Yocm9sZSkuYWRkKCdFbnZpcm9ubWVudCcsIGVudmlyb25tZW50KTtcblxuICAgIHJldHVybiByb2xlO1xuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVVbmF1dGhlbnRpY2F0ZWRSb2xlKGVudmlyb25tZW50OiBzdHJpbmcpOiBSb2xlIHtcbiAgICBjb25zdCByb2xlID0gbmV3IFJvbGUodGhpcywgJ1VuYXV0aGVudGljYXRlZFJvbGUnLCB7XG4gICAgICBhc3N1bWVkQnk6IG5ldyBGZWRlcmF0ZWRQcmluY2lwYWwoXG4gICAgICAgICdjb2duaXRvLWlkZW50aXR5LmFtYXpvbmF3cy5jb20nLFxuICAgICAgICB7XG4gICAgICAgICAgU3RyaW5nRXF1YWxzOiB7XG4gICAgICAgICAgICAnY29nbml0by1pZGVudGl0eS5hbWF6b25hd3MuY29tOmF1ZCc6IHRoaXMuaWRlbnRpdHlQb29sLmlkZW50aXR5UG9vbElkLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgJ0ZvckFueVZhbHVlOlN0cmluZ0xpa2UnOiB7XG4gICAgICAgICAgICAnY29nbml0by1pZGVudGl0eS5hbWF6b25hd3MuY29tOmFtcic6ICd1bmF1dGhlbnRpY2F0ZWQnLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgICdzdHM6QXNzdW1lUm9sZVdpdGhXZWJJZGVudGl0eSdcbiAgICAgICksXG4gICAgICBkZXNjcmlwdGlvbjogYFVuYXV0aGVudGljYXRlZCByb2xlIGZvciBNQURNYWxsICR7ZW52aXJvbm1lbnR9IHVzZXJzYCxcbiAgICB9KTtcblxuICAgIC8vIE1pbmltYWwgcGVybWlzc2lvbnMgZm9yIHVuYXV0aGVudGljYXRlZCB1c2Vyc1xuICAgIHJvbGUuYWRkVG9Qb2xpY3kobmV3IFBvbGljeVN0YXRlbWVudCh7XG4gICAgICBlZmZlY3Q6IEVmZmVjdC5BTExPVyxcbiAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgJ2NvZ25pdG8taWRlbnRpdHk6R2V0SWQnLFxuICAgICAgXSxcbiAgICAgIHJlc291cmNlczogWycqJ10sXG4gICAgfSkpO1xuXG4gICAgVGFncy5vZihyb2xlKS5hZGQoJ05hbWUnLCBgbWFkbWFsbC0ke2Vudmlyb25tZW50fS11bmF1dGhlbnRpY2F0ZWQtcm9sZWApO1xuICAgIFRhZ3Mub2Yocm9sZSkuYWRkKCdFbnZpcm9ubWVudCcsIGVudmlyb25tZW50KTtcblxuICAgIHJldHVybiByb2xlO1xuICB9XG59XG5cbi8vIEltcG9ydCBEdXJhdGlvblxuaW1wb3J0IHsgRHVyYXRpb24gfSBmcm9tICdhd3MtY2RrLWxpYic7Il19