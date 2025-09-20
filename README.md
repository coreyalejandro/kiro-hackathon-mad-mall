# MADMall - AI-Powered Wellness Platform

[![Watch the video](https://img.youtube.com/vi/OjhfPaGNkH0/maxresdefault.jpg)](https://youtu.be/OjhfPaGNkH0)

A social wellness hub platform called "AIme" built for the Kiro Hackathon, focusing on mental health support and community connection with cultural sensitivity for African American women.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Access the platform at `http//localhost:3000`

## 📱 Features

### Core Platform

- **Concourse**: Main social feed and interaction space
- **Peer Circles**: Group support communities
- **Comedy Lounge**: Wellness through humor
- **Story Booth**: Personal narrative sharing
- **Marketplace**: Wellness products and services
- **Resource Hub**: Mental health resources

### AI Integration (Zaji)

- **Image Generation**: AWS Bedrock SDXL for culturally-sensitive imagery
- **Content Validation**: AWS Bedrock Claude-3 for cultural appropriateness
- **Care Recommendations**: Personalized wellness suggestions
- **Auto-Approval Workflow**: Images auto-approved based on validation scores >0.8

## 🛠️ Architecture

### Monorepo Structure

- `packages/web-app`: Next.js 15 App Router frontend with Cloudscape Design
- `packages/api-gateway`: AWS Lambda handlers
- `packages/infrastructure`: AWS CDK constructs
- `packages/shared-types`: Common TypeScript types

### Tech Stack

- **Frontend**: Next.js 15, React 19, Cloudscape Design System
- **Backend**: AWS Lambda, DynamoDB
- **AI**: AWS Bedrock (SDXL, Claude-3)
- **Build**: Projen + Nx with PNPM workspaces

## 🎨 Image Generation System

### Admin Interface

Visit `/admin/images` to:

- Generate images for all site sections
- View approval workflow results
- Manage culturally-appropriate imagery

### API Endpoints

- `POST /api/images/generate-for-site` - Generate section-specific images
- `GET/POST /api/images/approve` - Approval workflow management
- `POST /api/generate-image` - Single image generation
- `POST /api/validate-image` - Cultural sensitivity validation
- `POST /api/care-model` - Wellness recommendations

### Image Flow

1. Admin generates images via `/admin/images`
2. AWS Bedrock SDXL creates culturally-sensitive images
3. Claude-3 validates for cultural appropriateness
4. Auto-approval for scores >0.8 on all metrics
5. Approved images stored and served to site pages
6. Pages fetch images via API for hero sections

## 🔧 Development Commands

```bash
# Full setup
pnpm install && pnpm build:all

# Development
pnpm dev              # Start all services
pnpm build:all        # Build all packages
pnpm test:all         # Run all tests
pnpm lint:all         # Lint all packages

# Per-package (from package directory)
pnpm dev              # Package-specific dev server
pnpm build            # Package build
pnpm test             # Package tests
```

## 🌍 Environment Setup

Create `/packages/web-app/.env.local`:

```bash
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
```

## 🎯 Platform Context

This platform emphasizes:

- Cultural sensitivity for African American women
- Community-driven mental health support
- AI-generated imagery with approval workflows
- Wellness through multiple engagement methods (humor, stories, peer support)
- Marketplace for Black-owned wellness businesses
