# MADMall Development Guide

## 🚀 Quick Start Commands

### Development Environment
```bash
# Start full development environment (RECOMMENDED)
pnpm run dev

# This starts:
# - Next.js web app (packages/web-app) on http://localhost:3000
# - API Gateway development server (if configured)
# - Infrastructure watch mode for CDK changes
# - Shared types compilation in watch mode
```

### Build & Test
```bash
# Build everything
pnpm run build:all

# Test everything  
pnpm run test:all

# Lint everything
pnpm run lint:all

# Clean and rebuild
pnpm run clean && pnpm run build:all
```

### Single Package Commands
```bash
# Web App only
pnpm --filter @madmall/web-app dev
pnpm --filter @madmall/web-app build

# API Gateway only
pnpm --filter @madmall/api-gateway dev
pnpm --filter @madmall/api-gateway build

# Infrastructure only
pnpm --filter @madmall/infrastructure deploy
```

## 📁 Project Structure

```
kiro-hackathon-mad-mall/
├── packages/
│   ├── web-app/          # Next.js 15 App Router application
│   ├── api-gateway/      # Smithy API definitions & Lambda handlers
│   ├── infrastructure/   # AWS CDK constructs
│   └── shared-types/     # TypeScript definitions
├── madmall-web-legacy-backup/  # Old Vite app (backup)
└── DEVELOPMENT.md        # This file
```

## 🛠️ AWS PDK Commands

```bash
# PDK is now working (space removed from directory name)
npx pdk --version         # Check PDK version
npx pdk --help           # Full command reference
npx pdk generate client  # Generate API clients
npx pdk deploy --env dev # Deploy to AWS
```

## 🌐 Development URLs

- **Web App**: http://localhost:3000 (Next.js)
- **API Gateway**: http://localhost:8000 (if running)

## 🎯 Common Workflows

### Adding New Components
1. Add to `packages/web-app/src/components/`
2. Import in relevant pages
3. Build automatically rebuilds with watch mode

### API Changes
1. Update Smithy models in `packages/api-gateway/models/`
2. Run `pnpm --filter @madmall/api-gateway generate`
3. Rebuild web app to pick up new types

### Infrastructure Updates
1. Edit CDK constructs in `packages/infrastructure/`
2. Run `pnpm --filter @madmall/infrastructure synth`
3. Deploy with `pnpm --filter @madmall/infrastructure deploy`

## ⚡ Pro Tips

- Use **`pnpm run dev`** as your primary command - it's the enterprise pattern
- Nx caching makes subsequent builds much faster
- All packages share TypeScript definitions from `shared-types`
- The monorepo setup aligns with AWS best practices

## 🔧 Troubleshooting

### Workspace Not Recognized
```bash
# Refresh workspace
pnpm install
```

### Build Failures
```bash
# Clean and rebuild
pnpm run clean
pnpm run build:all
```

### PDK Issues
- Ensure directory name has no spaces (✅ fixed: `kiro-hackathon-mad-mall`)
- Run `npx pdk --version` to verify installation

---

**Last Updated**: September 2024  
**Framework**: Next.js 15 + AWS PDK + pnpm Workspaces