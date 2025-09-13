# Bedrock Agents Package

AWS Bedrock AI agents for the MADMall platform, providing intelligent content validation, personalized recommendations, and wellness coaching capabilities.

## Overview

This package implements AI-powered agents using AWS Bedrock foundation models to enhance the MADMall social wellness platform with:

- **Cultural Validation Agent**: Ensures content cultural appropriateness and sensitivity
- **Content Moderation Agent**: Automated safety and compliance validation
- **Recommendation Agent**: Personalized content and connection suggestions
- **Wellness Coach Agent**: AI-powered wellness guidance and support

## Features

### 🤖 AI Agents

- **Type-safe agent implementations** with comprehensive input/output validation
- **Configurable Bedrock model integration** with support for multiple foundation models
- **Error handling and retry logic** with circuit breaker patterns
- **Structured response parsing** with Zod schema validation

### 🔄 Workflow Orchestration

- **Multi-step workflow execution** with conditional logic and error handling
- **Agent composition** for complex business processes
- **Retry policies and fallback mechanisms** for robust execution
- **Real-time execution monitoring** and status tracking

### 🛡️ Safety & Compliance

- **Cultural sensitivity validation** with context-aware analysis
- **Content moderation** with configurable safety levels
- **Crisis detection** with automatic escalation protocols
- **Privacy-preserving design** with data sanitization

### 🎯 Personalization

- **User profile-based recommendations** with cultural context
- **Wellness goal alignment** and progress tracking
- **Connection matching** for peer support networks
- **Activity suggestions** based on current state and preferences

## Installation

```bash
# Install the package
pnpm install @madmall/bedrock-agents

# Install peer dependencies
pnpm install @aws-sdk/client-bedrock @aws-sdk/client-bedrock-runtime
```

## Quick Start

### Basic Agent Usage

```typescript
import { CulturalValidationAgent } from '@madmall/bedrock-agents';

// Initialize the agent
const culturalAgent = new CulturalValidationAgent('us-east-1');

// Validate content
const result = await culturalAgent.execute({
  content: "Welcome to our supportive community!",
  contentType: 'text',
  culturalContext: {
    primaryCulture: 'American',
    region: 'North America',
    language: 'English',
    // ... other context
  },
  targetAudience: {
    ageRange: { min: 18, max: 65 },
    diagnosisStage: 'newly_diagnosed',
    supportNeeds: ['emotional_support']
  }
}, {
  sessionId: 'session-123',
  correlationId: 'req-456',
  timestamp: new Date(),
  userId: 'user-789'
});

if (result.response.success) {
  console.log('Validation result:', result.response.data);
}
```

### Workflow Orchestration

```typescript
import { 
  BedrockWorkflowOrchestrator,
  CulturalValidationAgent,
  ContentModerationAgent,
  predefinedWorkflows
} from '@madmall/bedrock-agents';

// Initialize orchestrator
const orchestrator = new BedrockWorkflowOrchestrator();

// Register agents
orchestrator.registerAgent('cultural-validation-agent', new CulturalValidationAgent());
orchestrator.registerAgent('content-moderation-agent', new ContentModerationAgent());

// Register predefined workflows
predefinedWorkflows.forEach(workflow => {
  orchestrator.registerWorkflow(workflow);
});

// Execute content validation workflow
const result = await orchestrator.executeWorkflow(
  'content-validation',
  {
    content: "User-generated content to validate",
    contentType: 'text',
    culturalContext: { /* ... */ },
    targetAudience: { /* ... */ }
  },
  {
    sessionId: 'session-123',
    correlationId: 'req-456',
    timestamp: new Date()
  }
);
```

## Configuration

### Environment Variables

```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Bedrock Configuration
BEDROCK_DEFAULT_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
BEDROCK_DEFAULT_TEMPERATURE=0.7
BEDROCK_DEFAULT_MAX_TOKENS=2000
BEDROCK_TIMEOUT=30000

# Workflow Configuration
WORKFLOW_MAX_EXECUTION_TIME=300000
WORKFLOW_DEFAULT_RETRY_ATTEMPTS=3

# Logging
LOG_LEVEL=info
ENABLE_METRICS=true
ENABLE_TRACING=false
```

### Programmatic Configuration

```typescript
import { ConfigManager, createConfigFromEnvironment } from '@madmall/bedrock-agents';

// Use environment-based configuration
const config = createConfigFromEnvironment();

// Or create custom configuration
const customConfig = ConfigManager.getInstance({
  aws: {
    region: 'us-west-2'
  },
  agents: {
    defaultTemperature: 0.5,
    defaultMaxTokens: 1500
  }
});
```

## Available Agents

### Cultural Validation Agent

Validates content for cultural appropriateness and sensitivity.

```typescript
import { CulturalValidationAgent } from '@madmall/bedrock-agents';

const agent = new CulturalValidationAgent();
const result = await agent.execute(validationInput, context);
```

**Features:**
- Cultural sensitivity analysis
- Bias detection (racial, gender, religious)
- Inclusive language validation
- Age-appropriate content checking
- Medical accuracy verification

### Content Moderation Agent

Automated content safety and compliance validation.

```typescript
import { ContentModerationAgent } from '@madmall/bedrock-agents';

const agent = new ContentModerationAgent();
const result = await agent.moderateInRealTime(content, userId, context);
```

**Features:**
- Hate speech detection
- Harassment identification
- Violence and self-harm content flagging
- Spam and misinformation detection
- Crisis indicator recognition

### Recommendation Agent

Personalized content and connection recommendations.

```typescript
import { RecommendationAgent } from '@madmall/bedrock-agents';

const agent = new RecommendationAgent();
const recommendations = await agent.recommendCircles(userProfile, context);
```

**Features:**
- Circle recommendations based on interests and needs
- Peer connection matching
- Content personalization
- Wellness activity suggestions
- Cultural preference alignment

### Wellness Coach Agent

AI-powered wellness guidance and support.

```typescript
import { WellnessCoachAgent } from '@madmall/bedrock-agents';

const agent = new WellnessCoachAgent();
const coaching = await agent.execute(coachingInput, context);
```

**Features:**
- Wellness assessment and metrics tracking
- Goal setting and progress monitoring
- Crisis detection and intervention
- Personalized wellness recommendations
- Professional referral guidance

## Predefined Workflows

### Content Validation Workflow
Comprehensive content validation through cultural and moderation checks.

### Personalized Recommendations Workflow
Generate culturally-appropriate, wellness-aligned recommendations.

### Wellness Check-in Workflow
Complete wellness assessment with crisis detection and coaching.

### Community Onboarding Workflow
Personalized onboarding experience for new members.

## Error Handling

The package includes comprehensive error handling with:

- **Custom error types** for different failure scenarios
- **Retry logic** with exponential backoff
- **Circuit breaker patterns** for service protection
- **Graceful degradation** when services are unavailable

```typescript
import { ErrorHandler, BedrockAgentError } from '@madmall/bedrock-agents';

try {
  const result = await agent.execute(input, context);
} catch (error) {
  if (error instanceof BedrockAgentError) {
    console.error('Agent error:', error.agentId, error.code);
  }
  
  const sanitizedMessage = ErrorHandler.sanitizeErrorMessage(error);
  // Display user-friendly message
}
```

## Testing

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test --coverage

# Run tests in watch mode
pnpm test:watch
```

## Development

```bash
# Build the package
pnpm build

# Watch for changes
pnpm dev

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

## Architecture

The package follows a modular architecture with:

- **Agent Layer**: Individual AI agents with specific capabilities
- **Workflow Layer**: Orchestration and composition of multiple agents
- **Type Layer**: Comprehensive TypeScript definitions with runtime validation
- **Utility Layer**: Configuration, error handling, and common utilities

## Security Considerations

- **Input validation** with Zod schemas
- **Output sanitization** to prevent sensitive data leakage
- **Rate limiting** and timeout protection
- **Audit logging** for compliance and monitoring
- **Privacy-preserving** design with data minimization

## Contributing

1. Follow the existing code style and patterns
2. Add comprehensive tests for new features
3. Update documentation for API changes
4. Ensure all type definitions are accurate
5. Test with real Bedrock models when possible

## Credits and Acknowledgments

This package builds upon several key methodologies and technologies:

### Sierra AI Benchmarking Methodology
Our benchmarking system is inspired by [Sierra's rigorous AI agent evaluation approach](https://sierra.ai/blog/benchmarking-ai-agents), extending it with cultural competency assessment for healthcare AI.

### AWS Bedrock and Anthropic Claude
Powered by AWS Bedrock foundation models, particularly Anthropic's Claude-3 Sonnet, for natural language processing with cultural sensitivity.

### Teaching Hospital Model
The collaborative learning approach is inspired by medical residency programs where senior residents mentor junior residents through supervised practice.

See the main [CREDITS.md](../../CREDITS.md) file for comprehensive acknowledgments.

## License

Apache-2.0 - See LICENSE file for details.