# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "MADMall" (Kiro Hackathon) - a social wellness hub platform called "AIme". It's a monorepo built with AWS CDK, Next.js, and TypeScript, focusing on mental health support and community connection with cultural sensitivity.

## Architecture

### Monorepo Structure
- **Projen + Nx**: Uses Projen for project configuration and Nx for task orchestration with build caching
- **PNPM Workspaces**: Package management with workspace dependencies
- **AWS PDK**: Leverages AWS Project Development Kit for enterprise-grade patterns

### Key Packages
- `@madmall/web-app`: Next.js 15 App Router frontend with Cloudscape Design
- `@madmall/api-gateway`: AWS Lambda handlers with Smithy IDL definitions
- `@madmall/infrastructure`: AWS CDK constructs for cloud infrastructure
- `@madmall/shared-types`: Common TypeScript types across packages

## Development Commands

### Setup & Installation
```bash
pnpm install           # Install dependencies
pnpm setup            # Full setup: install + build all packages
```

### Development
```bash
pnpm dev              # Start all development servers in parallel
pnpm run dev          # Same as above (alias)
```

### Building & Testing
```bash
pnpm build:all        # Build all packages
pnpm test:all         # Run tests for all packages
pnpm lint:all         # Lint all packages
```

### Nx-powered Commands (for affected packages only)
```bash
pnpm affected:build   # Build only affected packages
pnpm affected:test    # Test only affected packages
pnpm affected:lint    # Lint only affected packages
```

### Per-Package Commands
```bash
# Web App (Next.js)
cd packages/web-app
pnpm dev              # Next.js dev server
pnpm build            # Production build
pnpm type-check       # TypeScript validation
pnpm test             # Jest tests

# API Gateway
cd packages/api-gateway
pnpm generate         # Generate from Smithy IDL
pnpm build            # TypeScript compilation
pnpm test             # Lambda handler tests

# Infrastructure
cd packages/infrastructure
pnpm cdk synth        # Synthesize CloudFormation
pnpm cdk deploy       # Deploy to AWS
pnpm cdk diff         # Show deployment diff

# Shared Types
cd packages/shared-types
pnpm build            # Compile types
pnpm dev              # Watch mode compilation
```

## Key Architecture Patterns

### Frontend (Next.js App Router)
- **Cloudscape Design System**: AWS's design components for enterprise UX
- **App Router**: Uses Next.js 15 with React 19, server components by default
- **Navigation**: Centralized NavigationProvider with AppLayout + SideNavigation
- **Theming**: Custom "Kadir Nelson" theme with wellness-focused styling

### Backend (AWS Serverless)
- **Lambda Handlers**: Event-driven functions in api-gateway package
- **Smithy IDL**: API definitions with code generation (use `pnpm generate`)
- **DynamoDB**: Database integration via AWS SDK v3
- **CDK Constructs**: Reusable infrastructure patterns in separate modules

### Type System
- **Workspace References**: Packages reference `@madmall/shared-types` via file: protocol
- **Domain Exports**: Types organized by domain (domain/, api/, events/, config/)
- **Build Dependencies**: Infrastructure and API depend on shared types

### Development Workflow
- **Nx Caching**: Build outputs cached for faster subsequent builds
- **Parallel Execution**: Tasks run across packages simultaneously (max 3 parallel)
- **Affected Analysis**: Only rebuild/test packages that changed

## Platform Context

This is a **social wellness platform** with these core areas:
- **Concourse**: Main social feed/interaction space
- **Peer Circles**: Group support communities
- **Comedy Lounge**: Wellness through humor
- **Story Booth**: Personal narrative sharing
- **Marketplace**: Wellness products/services
- **Resource Hub**: Mental health resources

The platform emphasizes cultural sensitivity and community-driven mental health support.