---
title: Authentication and Authorization
description: Cognito integration, RBAC, tokens, and web app usage
---

## Overview

This guide describes how authentication and authorization are implemented using AWS Cognito across infrastructure, APIs, and the Next.js web app.

## Infrastructure

- User Pool with MFA optional in non-prod, required in prod
- User Pool Client using Authorization Code flow
- Hosted UI with optional custom domain
- Identity Pool providing IAM roles for authenticated/unauthenticated identities
- Cognito Groups for RBAC: Administrators, Moderators, PremiumUsers, StandardUsers, TenantAdmins
- API Gateway protected by a Cognito User Pools authorizer

Key files:
- `packages/infrastructure/src/constructs/authentication.ts`
- `packages/infrastructure/src/constructs/api-gateway.ts`
- `packages/infrastructure/src/stacks/main-stack.ts`

Outputs (use after deploy):
- `UserPoolId`, `UserPoolClientId`, `IdentityPoolId`, `AuthDomainUrl`

## Web App

- Uses `aws-amplify` to integrate Hosted UI sign-in/out
- Env vars:
  - `NEXT_PUBLIC_AUTH_DOMAIN`
  - `NEXT_PUBLIC_AUTH_CLIENT_ID`
  - `NEXT_PUBLIC_USER_POOL_ID` (optional for Amplify)

Configuration happens in `NavigationProvider` to ensure client-side initialization.

## API Protection

- API Gateway applies Cognito authorizer on all `v1/*` resources
- Lambda functions receive JWT claims via `event.requestContext.authorizer`

## RBAC

- Assign users to Cognito groups. Group membership is available in `cognito:groups` claim. Use it to authorize operations server-side.

## Local Development

For local testing without Hosted UI, you can:
- Use Cognito test users created in the pool
- Call the authorization endpoint at `https://<auth-domain>/oauth2/authorize` and complete the code exchange

## Security Notes

- Authorization Code with PKCE is used for browser clients
- Access and ID tokens are short-lived; refresh token validity is 30 days

