#!/usr/bin/env bash
set -euo pipefail

pnpm env:copy
pnpm localstack:up

echo "Starting monorepo dev tasks (web + lambda)..."
pnpm -w nx run-many -t dev --parallel

