// Jest setup file for bedrock-agents package

// Mock AWS SDK clients for testing
jest.mock('@aws-sdk/client-bedrock-runtime', () => ({
  BedrockRuntimeClient: jest.fn().mockImplementation(() => ({
    send: jest.fn(),
  })),
  InvokeModelCommand: jest.fn(),
}));

jest.mock('@aws-sdk/client-bedrock-agent', () => ({
  BedrockAgentClient: jest.fn().mockImplementation(() => ({
    send: jest.fn(),
  })),
}));

// Set up test environment variables
process.env.NODE_ENV = 'test';
process.env.AWS_REGION = 'us-east-1';
process.env.BEDROCK_DEFAULT_MODEL_ID = 'mock-model';

// Global test utilities
(global as any).mockBedrockResponse = (response: any) => {
  const mockSend = jest.fn().mockResolvedValue({
    body: new TextEncoder().encode(JSON.stringify(response)),
  });
  
  return mockSend;
};

// Suppress console logs during tests unless explicitly needed
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

beforeEach(() => {
  if (!process.env.VERBOSE_TESTS) {
    console.error = jest.fn();
    console.warn = jest.fn();
    console.log = jest.fn();
  }
});

afterEach(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  console.log = originalConsoleLog;
});