# Technology Stack & Build System

## Build System
- **Package Manager**: pnpm (v10+) with workspaces
- **Monorepo Tool**: Nx for build orchestration and caching
- **Project Generator**: Projen for configuration management
- **Infrastructure**: AWS CDK with AWS PDK

## Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Runtime**: React 19
- **UI Components**: AWS Cloudscape Design System
- **State Management**: TanStack Query (React Query)
- **Authentication**: AWS Amplify
- **Styling**: CSS modules with Cloudscape theming

### Backend
- **API**: Smithy IDL for API definitions
- **Runtime**: AWS Lambda (Node.js)
- **Database**: DynamoDB
- **Storage**: S3
- **AI Services**: AWS Bedrock
- **Real-time**: Socket.io

### Development Tools
- **Language**: TypeScript 5.x
- **Testing**: Jest with React Testing Library
- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier
- **CI/CD**: AWS CodeCatalyst workflows

## Common Commands

### Development
```bash
# Start full development environment
pnpm run dev

# Start individual services
pnpm --filter @madmall/web-app dev
pnpm --filter @madmall/api-gateway dev
```

### Building
```bash
# Build all packages
pnpm run build:all

# Build affected packages only
pnpm run affected:build
```

### Testing
```bash
# Test all packages
pnpm run test:all

# Test with coverage
pnpm --filter @madmall/web-app test:coverage
```

### Infrastructure
```bash
# Deploy to development
pnpm run dev:infra:deploy

# Synthesize CDK templates
pnpm --filter @madmall/infrastructure synth
```

### API Generation
```bash
# Generate API clients from Smithy models
pnpm --filter @madmall/api-gateway generate

# Update OpenAPI documentation
pnpm run docs:api
```

## Environment Setup
- Node.js 16+ required
- AWS CLI configured for infrastructure deployment
- Docker for LocalStack development environment
- Environment files: `.env.example` → `.env` and `packages/web-app/.env.local.example` → `packages/web-app/.env.local`