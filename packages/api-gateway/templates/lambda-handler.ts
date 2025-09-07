/**
 * Lambda Handler Template for MADMall API Gateway
 * 
 * This template shows how to create type-safe Lambda handlers
 * using the generated Smithy types and interfaces.
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { 
  createAPIError, 
  createValidationError, 
  createInternalServerError,
  getHTTPStatusForErrorCode,
  generateRequestId 
} from '../src/utils/helpers';

/**
 * Base Lambda handler interface
 */
export interface LambdaHandler<TInput = any, TOutput = any> {
  (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult>;
}

/**
 * Creates a type-safe Lambda handler wrapper
 */
export function createLambdaHandler<TInput, TOutput>(
  handler: (input: TInput, context: Context) => Promise<TOutput>
): LambdaHandler<TInput, TOutput> {
  return async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
    const requestId = generateRequestId();
    
    try {
      // Parse input from event
      let input: TInput;
      
      if (event.body) {
        try {
          input = JSON.parse(event.body);
        } catch (error) {
          const validationError = createValidationError(
            'Invalid JSON in request body',
            undefined,
            requestId,
            event.path
          );
          
          return {
            statusCode: getHTTPStatusForErrorCode(validationError.code),
            headers: {
              'Content-Type': 'application/json',
              'X-Request-ID': requestId
            },
            body: JSON.stringify(validationError)
          };
        }
      } else {
        // For GET requests, use path and query parameters
        input = {
          ...event.pathParameters,
          ...event.queryStringParameters
        } as TInput;
      }
      
      // Execute handler
      const result = await handler(input, context);
      
      // Return success response
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId
        },
        body: JSON.stringify(result)
      };
      
    } catch (error) {
      console.error('Lambda handler error:', error);
      
      // Handle known API errors
      if (error && typeof error === 'object' && 'code' in error) {
        const apiError = error as any;
        return {
          statusCode: getHTTPStatusForErrorCode(apiError.code),
          headers: {
            'Content-Type': 'application/json',
            'X-Request-ID': requestId
          },
          body: JSON.stringify(apiError)
        };
      }
      
      // Handle unknown errors
      const internalError = createInternalServerError(
        'An unexpected error occurred',
        requestId,
        event.path
      );
      
      return {
        statusCode: getHTTPStatusForErrorCode(internalError.code),
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId
        },
        body: JSON.stringify(internalError)
      };
    }
  };
}

/**
 * Example: Create User Lambda Handler
 */
export interface CreateUserInput {
  email: string;
  profile: {
    firstName: string;
    lastName: string;
    culturalBackground: string[];
    communicationStyle: string;
    diagnosisStage: string;
    supportNeeds: string[];
  };
}

export interface CreateUserOutput {
  user: {
    id: string;
    email: string;
    profile: any;
    createdAt: string;
  };
  message: string;
}

export const createUserHandler = createLambdaHandler<CreateUserInput, CreateUserOutput>(
  async (input: CreateUserInput, context: Context): Promise<CreateUserOutput> => {
    // Validate input
    if (!input.email || !input.profile) {
      throw createValidationError('Email and profile are required');
    }
    
    // Business logic would go here
    // For now, return a mock response
    const user = {
      id: `user_${Date.now()}`,
      email: input.email,
      profile: input.profile,
      createdAt: new Date().toISOString()
    };
    
    return {
      user,
      message: 'User created successfully'
    };
  }
);

/**
 * Example: Get User Lambda Handler
 */
export interface GetUserInput {
  userId: string;
}

export interface GetUserOutput {
  user: {
    id: string;
    email: string;
    profile: any;
    createdAt: string;
    updatedAt: string;
  };
}

export const getUserHandler = createLambdaHandler<GetUserInput, GetUserOutput>(
  async (input: GetUserInput, context: Context): Promise<GetUserOutput> => {
    // Validate input
    if (!input.userId) {
      throw createValidationError('User ID is required');
    }
    
    // Business logic would go here
    // For now, return a mock response
    const user = {
      id: input.userId,
      email: 'user@example.com',
      profile: {
        firstName: 'John',
        lastName: 'Doe'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return { user };
  }
);

/**
 * Example: Health Check Lambda Handler
 */
export interface GetHealthOutput {
  status: string;
  message: string;
  timestamp: string;
  dataInitialized: boolean;
}

export const getHealthHandler = createLambdaHandler<{}, GetHealthOutput>(
  async (input: {}, context: Context): Promise<GetHealthOutput> => {
    return {
      status: 'healthy',
      message: 'MADMall API is running',
      timestamp: new Date().toISOString(),
      dataInitialized: true
    };
  }
);