#!/bin/bash

# MADMall API Gateway Validation Script
# Validates Smithy models and checks for common issues

set -e

echo "🔍 Validating Smithy models..."

# Note: Smithy CLI validation would go here when available
echo "📋 Running basic model validation..."

# Check for required files
echo "📁 Checking required model files..."
required_files=(
    "models/main.smithy"
    "models/common.smithy"
    "models/errors.smithy"
    "models/user.smithy"
    "models/circle.smithy"
    "models/story.smithy"
    "models/business.smithy"
    "models/system.smithy"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Missing required file: $file"
        exit 1
    else
        echo "✅ Found: $file"
    fi
done

# Check for common patterns in main service
echo "🔍 Validating main service definition..."
if ! grep -q "service MADMallAPI" models/main.smithy; then
    echo "❌ Main service 'MADMallAPI' not found in main.smithy"
    exit 1
fi

if ! grep -q "@restJson1" models/main.smithy; then
    echo "❌ @restJson1 protocol not found in main.smithy"
    exit 1
fi

# Check for required operations
echo "🔍 Validating required operations..."
required_operations=(
    "CreateUser"
    "GetUser"
    "CreateCircle"
    "GetCircle"
    "CreateStory"
    "GetStory"
    "CreateBusiness"
    "GetBusiness"
    "GetHealth"
    "Search"
)

for operation in "${required_operations[@]}"; do
    if ! grep -r "operation $operation" models/; then
        echo "❌ Missing required operation: $operation"
        exit 1
    else
        echo "✅ Found operation: $operation"
    fi
done

# Check for error definitions
echo "🔍 Validating error definitions..."
required_errors=(
    "ValidationError"
    "UnauthorizedError"
    "NotFoundError"
    "InternalServerError"
)

for error in "${required_errors[@]}"; do
    if ! grep -q "structure $error" models/errors.smithy; then
        echo "❌ Missing required error: $error"
        exit 1
    else
        echo "✅ Found error: $error"
    fi
done

# Check smithy-build.json configuration
echo "🔍 Validating build configuration..."
if [ ! -f "smithy-build.json" ]; then
    echo "❌ Missing smithy-build.json"
    exit 1
fi

if ! grep -q "typescript-codegen" smithy-build.json; then
    echo "❌ TypeScript codegen plugin not configured"
    exit 1
fi

if ! grep -q "openapi" smithy-build.json; then
    echo "❌ OpenAPI plugin not configured"
    exit 1
fi

# Validate JSON syntax
echo "🔍 Validating JSON configuration files..."
if ! python -m json.tool smithy-build.json > /dev/null 2>&1; then
    echo "❌ Invalid JSON in smithy-build.json"
    exit 1
fi

if ! python -m json.tool package.json > /dev/null 2>&1; then
    echo "❌ Invalid JSON in package.json"
    exit 1
fi

echo "✅ All validations passed!"
echo "🎉 Smithy models are valid and ready for code generation"