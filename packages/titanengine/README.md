# TitanEngine

Image curation and generation service with AWS Bedrock integration. Provides importers for Pexels, Unsplash, Automatic1111, and a Placeholder provider. Persists `DynamoDBImageAsset` entities via the shared DynamoDB single-table design and runs cultural validation using Bedrock agents.

## Env Vars

- `AWS_REGION` (default `us-east-1`)
- `DYNAMO_TABLE` (e.g., `madmall-dev-main`)
- `DYNAMODB_ENDPOINT` (optional, local dev)
- `PEXELS_API_KEY` (optional)
- `UNSPLASH_ACCESS_KEY` (optional)
- `A1111_BASE_URL` (optional, e.g., `http://localhost:7860`)
- `IMAGE_BUCKET` (optional, if storing to S3)

## Quick Start

```ts
import { TitanEngine } from './src/service/titanengine';

const engine = TitanEngine.createDefault();
await engine.importFromPexels({ query: 'Black women wellness', category: 'wellness', count: 5 });
```

## Legacy-compatible Handlers

- `POST /api/images/import/pexels`
- `POST /api/images/import/unsplash`
- `POST /api/images/import/cultural`
- `GET  /api/images/pending`
- `POST /api/images/validate`
- `GET  /api/images/select?context=wellness`

These are provided as callable functions to adapt into Lambda or API Gateway integrations.