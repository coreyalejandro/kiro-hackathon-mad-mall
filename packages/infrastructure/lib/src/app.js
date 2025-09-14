#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support/register");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const main_stack_1 = require("./stacks/main-stack");
const cdk_nag_1 = require("cdk-nag");
const app = new aws_cdk_lib_1.App();
// Get environment configuration from context or environment variables
const environment = app.node.tryGetContext('environment') || process.env.ENVIRONMENT || 'dev';
const account = app.node.tryGetContext('account') || process.env.CDK_DEFAULT_ACCOUNT;
const region = app.node.tryGetContext('region') || process.env.CDK_DEFAULT_REGION || 'us-east-1';
// Environment-specific configuration
const environmentConfig = {
    dev: {
        apiDomainName: undefined, // Use default API Gateway domain
        authDomainName: undefined, // Use default Cognito domain
        callbackUrls: [
            'http://localhost:3000/auth/callback',
            'http://localhost:5173/auth/callback',
        ],
        logoutUrls: [
            'http://localhost:3000/auth/logout',
            'http://localhost:5173/auth/logout',
        ],
        alertEmails: ['dev-team@madmall.com'],
        enableSocialLogin: false, // Disabled for dev to avoid OAuth setup complexity
        requireMfa: false,
    },
    staging: {
        apiDomainName: 'api-staging.madmall.com',
        authDomainName: 'auth-staging.madmall.com',
        callbackUrls: [
            'https://staging.madmall.com/auth/callback',
        ],
        logoutUrls: [
            'https://staging.madmall.com/auth/logout',
        ],
        alertEmails: ['staging-alerts@madmall.com'],
        enableSocialLogin: true,
        requireMfa: false,
    },
    prod: {
        apiDomainName: 'api.madmall.com',
        authDomainName: 'auth.madmall.com',
        callbackUrls: [
            'https://madmall.com/auth/callback',
            'https://www.madmall.com/auth/callback',
        ],
        logoutUrls: [
            'https://madmall.com/auth/logout',
            'https://www.madmall.com/auth/logout',
        ],
        alertEmails: [
            'alerts@madmall.com',
            'engineering@madmall.com',
        ],
        slackWebhookUrl: process.env.SLACK_WEBHOOK_URL,
        enableSocialLogin: true,
        requireMfa: true,
    },
};
// Get configuration for the current environment
const config = environmentConfig[environment];
if (!config) {
    throw new Error(`Unknown environment: ${environment}. Supported environments: dev, staging, prod`);
}
// AWS environment configuration
const env = {
    account,
    region,
};
// Create the main stack
new main_stack_1.MainStack(app, `MADMallStack-${environment}`, {
    env,
    environment,
    stackName: `madmall-${environment}`,
    description: `MADMall ${environment} infrastructure stack`,
    tags: {
        Project: 'MADMall',
        Environment: environment,
        ManagedBy: 'AWS-CDK',
        Repository: 'madmall-aws-pdk-migration',
    },
    ...config,
});
// Add global tags to all resources
// Global tagging could be implemented via Aspects or stack-level tags already set.
// Synthesize the app
// Enable cdk-nag AwsSolutions checks
aws_cdk_lib_1.Aspects.of(app).add(new cdk_nag_1.AwsSolutionsChecks({ verbose: true }));
app.synth();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2FwcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSx1Q0FBcUM7QUFDckMsNkNBQXdEO0FBQ3hELG9EQUFnRDtBQUNoRCxxQ0FBNkM7QUFFN0MsTUFBTSxHQUFHLEdBQUcsSUFBSSxpQkFBRyxFQUFFLENBQUM7QUFFdEIsc0VBQXNFO0FBQ3RFLE1BQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxJQUFJLEtBQUssQ0FBQztBQUM5RixNQUFNLE9BQU8sR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixDQUFDO0FBQ3JGLE1BQU0sTUFBTSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLElBQUksV0FBVyxDQUFDO0FBRWpHLHFDQUFxQztBQUNyQyxNQUFNLGlCQUFpQixHQUFHO0lBQ3hCLEdBQUcsRUFBRTtRQUNILGFBQWEsRUFBRSxTQUFTLEVBQUUsaUNBQWlDO1FBQzNELGNBQWMsRUFBRSxTQUFTLEVBQUUsNkJBQTZCO1FBQ3hELFlBQVksRUFBRTtZQUNaLHFDQUFxQztZQUNyQyxxQ0FBcUM7U0FDdEM7UUFDRCxVQUFVLEVBQUU7WUFDVixtQ0FBbUM7WUFDbkMsbUNBQW1DO1NBQ3BDO1FBQ0QsV0FBVyxFQUFFLENBQUMsc0JBQXNCLENBQUM7UUFDckMsaUJBQWlCLEVBQUUsS0FBSyxFQUFFLG1EQUFtRDtRQUM3RSxVQUFVLEVBQUUsS0FBSztLQUNsQjtJQUNELE9BQU8sRUFBRTtRQUNQLGFBQWEsRUFBRSx5QkFBeUI7UUFDeEMsY0FBYyxFQUFFLDBCQUEwQjtRQUMxQyxZQUFZLEVBQUU7WUFDWiwyQ0FBMkM7U0FDNUM7UUFDRCxVQUFVLEVBQUU7WUFDVix5Q0FBeUM7U0FDMUM7UUFDRCxXQUFXLEVBQUUsQ0FBQyw0QkFBNEIsQ0FBQztRQUMzQyxpQkFBaUIsRUFBRSxJQUFJO1FBQ3ZCLFVBQVUsRUFBRSxLQUFLO0tBQ2xCO0lBQ0QsSUFBSSxFQUFFO1FBQ0osYUFBYSxFQUFFLGlCQUFpQjtRQUNoQyxjQUFjLEVBQUUsa0JBQWtCO1FBQ2xDLFlBQVksRUFBRTtZQUNaLG1DQUFtQztZQUNuQyx1Q0FBdUM7U0FDeEM7UUFDRCxVQUFVLEVBQUU7WUFDVixpQ0FBaUM7WUFDakMscUNBQXFDO1NBQ3RDO1FBQ0QsV0FBVyxFQUFFO1lBQ1gsb0JBQW9CO1lBQ3BCLHlCQUF5QjtTQUMxQjtRQUNELGVBQWUsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQjtRQUM5QyxpQkFBaUIsRUFBRSxJQUFJO1FBQ3ZCLFVBQVUsRUFBRSxJQUFJO0tBQ2pCO0NBQ0YsQ0FBQztBQUVGLGdEQUFnRDtBQUNoRCxNQUFNLE1BQU0sR0FBRyxpQkFBaUIsQ0FBQyxXQUE2QyxDQUFDLENBQUM7QUFFaEYsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ1osTUFBTSxJQUFJLEtBQUssQ0FBQyx3QkFBd0IsV0FBVyw4Q0FBOEMsQ0FBQyxDQUFDO0FBQ3JHLENBQUM7QUFFRCxnQ0FBZ0M7QUFDaEMsTUFBTSxHQUFHLEdBQWdCO0lBQ3ZCLE9BQU87SUFDUCxNQUFNO0NBQ1AsQ0FBQztBQUVGLHdCQUF3QjtBQUN4QixJQUFJLHNCQUFTLENBQUMsR0FBRyxFQUFFLGdCQUFnQixXQUFXLEVBQUUsRUFBRTtJQUNoRCxHQUFHO0lBQ0gsV0FBVztJQUNYLFNBQVMsRUFBRSxXQUFXLFdBQVcsRUFBRTtJQUNuQyxXQUFXLEVBQUUsV0FBVyxXQUFXLHVCQUF1QjtJQUMxRCxJQUFJLEVBQUU7UUFDSixPQUFPLEVBQUUsU0FBUztRQUNsQixXQUFXLEVBQUUsV0FBVztRQUN4QixTQUFTLEVBQUUsU0FBUztRQUNwQixVQUFVLEVBQUUsMkJBQTJCO0tBQ3hDO0lBQ0QsR0FBRyxNQUFNO0NBQ1YsQ0FBQyxDQUFDO0FBRUgsbUNBQW1DO0FBQ25DLG1GQUFtRjtBQUVuRixxQkFBcUI7QUFDckIscUNBQXFDO0FBQ3JDLHFCQUFPLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLDRCQUFrQixDQUFDLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztBQUUvRCxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG5pbXBvcnQgJ3NvdXJjZS1tYXAtc3VwcG9ydC9yZWdpc3Rlcic7XG5pbXBvcnQgeyBBcHAsIEVudmlyb25tZW50LCBBc3BlY3RzIH0gZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgTWFpblN0YWNrIH0gZnJvbSAnLi9zdGFja3MvbWFpbi1zdGFjayc7XG5pbXBvcnQgeyBBd3NTb2x1dGlvbnNDaGVja3MgfSBmcm9tICdjZGstbmFnJztcblxuY29uc3QgYXBwID0gbmV3IEFwcCgpO1xuXG4vLyBHZXQgZW52aXJvbm1lbnQgY29uZmlndXJhdGlvbiBmcm9tIGNvbnRleHQgb3IgZW52aXJvbm1lbnQgdmFyaWFibGVzXG5jb25zdCBlbnZpcm9ubWVudCA9IGFwcC5ub2RlLnRyeUdldENvbnRleHQoJ2Vudmlyb25tZW50JykgfHwgcHJvY2Vzcy5lbnYuRU5WSVJPTk1FTlQgfHwgJ2Rldic7XG5jb25zdCBhY2NvdW50ID0gYXBwLm5vZGUudHJ5R2V0Q29udGV4dCgnYWNjb3VudCcpIHx8IHByb2Nlc3MuZW52LkNES19ERUZBVUxUX0FDQ09VTlQ7XG5jb25zdCByZWdpb24gPSBhcHAubm9kZS50cnlHZXRDb250ZXh0KCdyZWdpb24nKSB8fCBwcm9jZXNzLmVudi5DREtfREVGQVVMVF9SRUdJT04gfHwgJ3VzLWVhc3QtMSc7XG5cbi8vIEVudmlyb25tZW50LXNwZWNpZmljIGNvbmZpZ3VyYXRpb25cbmNvbnN0IGVudmlyb25tZW50Q29uZmlnID0ge1xuICBkZXY6IHtcbiAgICBhcGlEb21haW5OYW1lOiB1bmRlZmluZWQsIC8vIFVzZSBkZWZhdWx0IEFQSSBHYXRld2F5IGRvbWFpblxuICAgIGF1dGhEb21haW5OYW1lOiB1bmRlZmluZWQsIC8vIFVzZSBkZWZhdWx0IENvZ25pdG8gZG9tYWluXG4gICAgY2FsbGJhY2tVcmxzOiBbXG4gICAgICAnaHR0cDovL2xvY2FsaG9zdDozMDAwL2F1dGgvY2FsbGJhY2snLFxuICAgICAgJ2h0dHA6Ly9sb2NhbGhvc3Q6NTE3My9hdXRoL2NhbGxiYWNrJyxcbiAgICBdLFxuICAgIGxvZ291dFVybHM6IFtcbiAgICAgICdodHRwOi8vbG9jYWxob3N0OjMwMDAvYXV0aC9sb2dvdXQnLFxuICAgICAgJ2h0dHA6Ly9sb2NhbGhvc3Q6NTE3My9hdXRoL2xvZ291dCcsXG4gICAgXSxcbiAgICBhbGVydEVtYWlsczogWydkZXYtdGVhbUBtYWRtYWxsLmNvbSddLFxuICAgIGVuYWJsZVNvY2lhbExvZ2luOiBmYWxzZSwgLy8gRGlzYWJsZWQgZm9yIGRldiB0byBhdm9pZCBPQXV0aCBzZXR1cCBjb21wbGV4aXR5XG4gICAgcmVxdWlyZU1mYTogZmFsc2UsXG4gIH0sXG4gIHN0YWdpbmc6IHtcbiAgICBhcGlEb21haW5OYW1lOiAnYXBpLXN0YWdpbmcubWFkbWFsbC5jb20nLFxuICAgIGF1dGhEb21haW5OYW1lOiAnYXV0aC1zdGFnaW5nLm1hZG1hbGwuY29tJyxcbiAgICBjYWxsYmFja1VybHM6IFtcbiAgICAgICdodHRwczovL3N0YWdpbmcubWFkbWFsbC5jb20vYXV0aC9jYWxsYmFjaycsXG4gICAgXSxcbiAgICBsb2dvdXRVcmxzOiBbXG4gICAgICAnaHR0cHM6Ly9zdGFnaW5nLm1hZG1hbGwuY29tL2F1dGgvbG9nb3V0JyxcbiAgICBdLFxuICAgIGFsZXJ0RW1haWxzOiBbJ3N0YWdpbmctYWxlcnRzQG1hZG1hbGwuY29tJ10sXG4gICAgZW5hYmxlU29jaWFsTG9naW46IHRydWUsXG4gICAgcmVxdWlyZU1mYTogZmFsc2UsXG4gIH0sXG4gIHByb2Q6IHtcbiAgICBhcGlEb21haW5OYW1lOiAnYXBpLm1hZG1hbGwuY29tJyxcbiAgICBhdXRoRG9tYWluTmFtZTogJ2F1dGgubWFkbWFsbC5jb20nLFxuICAgIGNhbGxiYWNrVXJsczogW1xuICAgICAgJ2h0dHBzOi8vbWFkbWFsbC5jb20vYXV0aC9jYWxsYmFjaycsXG4gICAgICAnaHR0cHM6Ly93d3cubWFkbWFsbC5jb20vYXV0aC9jYWxsYmFjaycsXG4gICAgXSxcbiAgICBsb2dvdXRVcmxzOiBbXG4gICAgICAnaHR0cHM6Ly9tYWRtYWxsLmNvbS9hdXRoL2xvZ291dCcsXG4gICAgICAnaHR0cHM6Ly93d3cubWFkbWFsbC5jb20vYXV0aC9sb2dvdXQnLFxuICAgIF0sXG4gICAgYWxlcnRFbWFpbHM6IFtcbiAgICAgICdhbGVydHNAbWFkbWFsbC5jb20nLFxuICAgICAgJ2VuZ2luZWVyaW5nQG1hZG1hbGwuY29tJyxcbiAgICBdLFxuICAgIHNsYWNrV2ViaG9va1VybDogcHJvY2Vzcy5lbnYuU0xBQ0tfV0VCSE9PS19VUkwsXG4gICAgZW5hYmxlU29jaWFsTG9naW46IHRydWUsXG4gICAgcmVxdWlyZU1mYTogdHJ1ZSxcbiAgfSxcbn07XG5cbi8vIEdldCBjb25maWd1cmF0aW9uIGZvciB0aGUgY3VycmVudCBlbnZpcm9ubWVudFxuY29uc3QgY29uZmlnID0gZW52aXJvbm1lbnRDb25maWdbZW52aXJvbm1lbnQgYXMga2V5b2YgdHlwZW9mIGVudmlyb25tZW50Q29uZmlnXTtcblxuaWYgKCFjb25maWcpIHtcbiAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIGVudmlyb25tZW50OiAke2Vudmlyb25tZW50fS4gU3VwcG9ydGVkIGVudmlyb25tZW50czogZGV2LCBzdGFnaW5nLCBwcm9kYCk7XG59XG5cbi8vIEFXUyBlbnZpcm9ubWVudCBjb25maWd1cmF0aW9uXG5jb25zdCBlbnY6IEVudmlyb25tZW50ID0ge1xuICBhY2NvdW50LFxuICByZWdpb24sXG59O1xuXG4vLyBDcmVhdGUgdGhlIG1haW4gc3RhY2tcbm5ldyBNYWluU3RhY2soYXBwLCBgTUFETWFsbFN0YWNrLSR7ZW52aXJvbm1lbnR9YCwge1xuICBlbnYsXG4gIGVudmlyb25tZW50LFxuICBzdGFja05hbWU6IGBtYWRtYWxsLSR7ZW52aXJvbm1lbnR9YCxcbiAgZGVzY3JpcHRpb246IGBNQURNYWxsICR7ZW52aXJvbm1lbnR9IGluZnJhc3RydWN0dXJlIHN0YWNrYCxcbiAgdGFnczoge1xuICAgIFByb2plY3Q6ICdNQURNYWxsJyxcbiAgICBFbnZpcm9ubWVudDogZW52aXJvbm1lbnQsXG4gICAgTWFuYWdlZEJ5OiAnQVdTLUNESycsXG4gICAgUmVwb3NpdG9yeTogJ21hZG1hbGwtYXdzLXBkay1taWdyYXRpb24nLFxuICB9LFxuICAuLi5jb25maWcsXG59KTtcblxuLy8gQWRkIGdsb2JhbCB0YWdzIHRvIGFsbCByZXNvdXJjZXNcbi8vIEdsb2JhbCB0YWdnaW5nIGNvdWxkIGJlIGltcGxlbWVudGVkIHZpYSBBc3BlY3RzIG9yIHN0YWNrLWxldmVsIHRhZ3MgYWxyZWFkeSBzZXQuXG5cbi8vIFN5bnRoZXNpemUgdGhlIGFwcFxuLy8gRW5hYmxlIGNkay1uYWcgQXdzU29sdXRpb25zIGNoZWNrc1xuQXNwZWN0cy5vZihhcHApLmFkZChuZXcgQXdzU29sdXRpb25zQ2hlY2tzKHsgdmVyYm9zZTogdHJ1ZSB9KSk7XG5cbmFwcC5zeW50aCgpOyJdfQ==