# MADMall Documentation

## Overview

This directory organizes all hackathon documentation in a cohesive structure. Use these entry points:

- Getting Started: ./guides/development.md
- Demo Guide: ./guides/titanengine-demo.md
- Research Validation: ./research/validation-index.md
- Testing Strategy: ./testing/test-plan.md
- Troubleshooting & Debugging: ./troubleshooting/index.md
- Platform Specs: ./specs/overview.md

Each document includes inline troubleshooting and explicit validation steps.

## API Reference

- OpenAPI spec is generated from Smithy definitions in `packages/api-gateway`.
- To regenerate the spec, run at repo root: `pnpm run docs:api`.
- Output is written to `packages/docs/openapi.json`.

