# Troubleshooting & Debugging

## Philosophy

Document errors as you go. Include symptoms, causes, and fixes. Prefer reproducible checks.

## Common Issues

- Web app build fails: run `pnpm install`, then `pnpm --filter @madmall/web-app build`.
- Jest not found: ensure devDependencies installed; run `pnpm -C packages/web-app install`.
- API mock data not loading: check `packages/api-gateway/src/services/mockDataService.ts` initialization logs.

## Debug Recipes

- Run all tests with coverage: `pnpm --filter @madmall/web-app test:coverage`.
- Lint fixes: `pnpm --filter @madmall/web-app lint`.
- Verify env: see `packages/web-app/src/lib/env.ts` and `.env.local.example`.