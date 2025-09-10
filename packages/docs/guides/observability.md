---
title: Monitoring, Logging, and Observability
description: CloudWatch dashboards, alarms, X-Ray tracing, and synthetics
---

## Overview

This guide covers how the platform implements observability: metrics, logs, traces, dashboards, alarms, and synthetic monitoring.

## Metrics and Dashboards

- Central dashboard per environment: `MADMall-<env>-Overview`
- Widgets for API Gateway, Lambda, DynamoDB, Cognito
- Custom log-based metrics for business errors and user actions

See `packages/infrastructure/src/constructs/monitoring.ts`.

## Alarms and Notifications

- SNS topic `madmall-<env>-alerts`
- Email subscriptions from stack config
- Optional Slack webhook subscription

Alarms:
- API 5XX
- Lambda Errors and Duration
- DynamoDB throttles

## Tracing

- Lambda configured with X-Ray tracing active
- API Gateway stage tracing enabled
- Use correlation IDs in logs: header `X-Correlation-Id` or requestId fallback

## Structured Logging

- Handlers log JSON with `level`, `message`, and context fields
- Utilities in `packages/api-gateway/src/utils/helpers.ts`

## Synthetic Monitoring

- CloudWatch Synthetics canary hits `/health` every 5 minutes
- Artifacts retained in dedicated S3 bucket

## How to Access

- Dashboard URL output: `DashboardUrl`
- Alert Topic ARN: `AlertTopicArn`

