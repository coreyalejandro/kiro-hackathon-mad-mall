# API Gateway Package

This package contains the Smithy IDL API definitions and Lambda handlers for the MADMall Social Wellness Platform API migration from Express to AWS serverless architecture.

## Overview

This package implements Task 5 of the AWS PDK Enterprise Migration: migrating existing Express server APIs to Lambda functions with Smithy-generated handlers.

## Structure

```
packages/api-gateway/
├── models/                 # Smithy IDL definitions
│   ├── main.smithy        # Main service definition
│   ├── common.smithy      # Common types and structures
│   ├── errors.smithy      # Error definitions
│   ├── user.smithy        # User-related operations
│   ├── story.smithy       # Story operations
│   ├── circle.smithy      # Circle operations
│   ├── business.smithy    # Business operations
│   └── system.smithy      # System operations
├── src/
│   ├── handlers/          # Lambda function handlers
│   ├── services/          # Business logic services
│   └── generated/         # Generated types from Smithy
├── test/                  # Unit tests
└── templates/             # Lambda handler templates
```

## API Endpoints Migrated

The following Express routes have been migrated to Lambda handlers:

### Health and System
- `GET /health` → `healthHandler`
- `GET /api/stats` → `statsHandler`
- `GET /api/highlights` → `getHighlightsHandler`

### Stories
- `GET /api/stories` → `getStoriesHandler`
- `GET /api/stories/featured` → `getFeaturedStoriesHandler`

### Comedy
- `GET /api/comedy` → `getComedyHandler`
- `GET /api/comedy/featured` → `getFeaturedComedyHandler`

### Discussions
- `GET /api/discussions` → `getDiscussionsHandler`
- `GET /api/discussions/active` → `getActiveDiscussionsHandler`

### Resources
- `GET /api/resources` → `getResourcesHandler`
- `GET /api/resources/featured` → `getFeaturedResourcesHandler`

### Products
- `GET /api/products` → `getProductsHandler`
- `GET /api/products/featured` → `getFeaturedProductsHandler`

### Users
- `GET /api/users` → `getUserProfilesHandler`

### Search and Recommendations
- `GET /api/search` → `searchHandler`
- `GET /api/recommendations` → `getRecommendationsHandler`
- `GET /api/categories/:contentType` → `getCategoriesHandler`

### Interactions
- `POST /api/interact` → `interactWithContentHandler`

## Key Features

### Type Safety
- All handlers implement Smithy-generated TypeScript interfaces
- Comprehensive type definitions for requests and responses
- Compile-time validation of API contracts

### Error Handling
- Standardized error responses matching Smithy error definitions
- Proper HTTP status codes and error structures
- Request ID tracking for debugging

### CORS Support
- All handlers include proper CORS headers
- Support for cross-origin requests from web applications

### Data Compatibility
- Maintains identical functionality to original Express routes
- Uses existing MockDataService for data operations
- Preserves all query parameters and response formats

## Development

### Building
```bash
npm run build
```

### Testing
```bash
npm test
npm run test:coverage
```

### Code Generation
```bash
npm run generate
```

### Linting
```bash
npm run lint
npm run lint:fix
```

## Deployment

These Lambda handlers are designed to be deployed using AWS CDK constructs defined in the infrastructure package. Each handler can be deployed as a separate Lambda function or combined based on performance requirements.

## Environment Variables

The handlers expect the following environment variables:
- `NODE_ENV`: Environment (development, staging, production)
- `LOG_LEVEL`: Logging level (debug, info, warn, error)
- `CORS_ORIGIN`: Allowed CORS origins (default: *)

## Testing

The package includes comprehensive unit tests that verify:
- Handler functionality matches original Express routes
- Proper error handling and status codes
- CORS header inclusion
- Request/response format compliance
- Type safety and validation

## Migration Notes

This migration preserves 100% API compatibility with the original Express server while adding:
- Enhanced type safety through Smithy IDL
- Better error handling and standardization
- Improved scalability through serverless architecture
- Automatic API documentation generation
- Contract-first development approach

The handlers use the existing MockDataService to maintain data compatibility during the migration phase. In production, this will be replaced with actual DynamoDB operations.