# Development Guide (Consolidated)

This is the canonical development reference. Original root `DEVELOPMENT.md` is retained and linked.

- Original: ../../DEVELOPMENT.md
- Monorepo commands are mirrored here for convenience.

## Quick Start

```bash
pnpm run dev
```

## Build, Test, Lint

```bash
pnpm run build:all
pnpm run test:all
pnpm run lint:all
```

## Packages

- Web App: packages/web-app
- API Gateway: packages/api-gateway
- Infrastructure: packages/infrastructure
- Shared Types: packages/shared-types

## Troubleshooting Cross-Refs

See ../troubleshooting/index.md