import { AgentConfig } from '../types/agent-types';

// Environment configuration
export interface BedrockAgentsConfig {
  aws: {
    region: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    sessionToken?: string;
  };
  agents: {
    defaultModelId: string;
    defaultTemperature: number;
    defaultMaxTokens: number;
    defaultTopP: number;
    timeout: number;
  };
  workflows: {
    maxExecutionTime: number;
    defaultRetryAttempts: number;
    cleanupInterval: number;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    enableMetrics: boolean;
    enableTracing: boolean;
  };
}

// Default configuration
export const defaultConfig: BedrockAgentsConfig = {
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN,
  },
  agents: {
    defaultModelId: process.env.BEDROCK_DEFAULT_MODEL_ID || 'anthropic.claude-3-sonnet-20240229-v1:0',
    defaultTemperature: parseFloat(process.env.BEDROCK_DEFAULT_TEMPERATURE || '0.7'),
    defaultMaxTokens: parseInt(process.env.BEDROCK_DEFAULT_MAX_TOKENS || '2000'),
    defaultTopP: parseFloat(process.env.BEDROCK_DEFAULT_TOP_P || '0.9'),
    timeout: parseInt(process.env.BEDROCK_TIMEOUT || '30000'), // 30 seconds
  },
  workflows: {
    maxExecutionTime: parseInt(process.env.WORKFLOW_MAX_EXECUTION_TIME || '300000'), // 5 minutes
    defaultRetryAttempts: parseInt(process.env.WORKFLOW_DEFAULT_RETRY_ATTEMPTS || '3'),
    cleanupInterval: parseInt(process.env.WORKFLOW_CLEANUP_INTERVAL || '3600000'), // 1 hour
  },
  logging: {
    level: (process.env.LOG_LEVEL as any) || 'info',
    enableMetrics: process.env.ENABLE_METRICS === 'true',
    enableTracing: process.env.ENABLE_TRACING === 'true',
  },
};

// Configuration manager
export class ConfigManager {
  private static instance: ConfigManager;
  private config: BedrockAgentsConfig;

  private constructor(config?: Partial<BedrockAgentsConfig>) {
    this.config = this.mergeConfig(defaultConfig, config || {});
  }

  static getInstance(config?: Partial<BedrockAgentsConfig>): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager(config);
    }
    return ConfigManager.instance;
  }

  getConfig(): BedrockAgentsConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<BedrockAgentsConfig>): void {
    this.config = this.mergeConfig(this.config, updates);
  }

  // Get agent-specific configuration
  getAgentConfig(agentId: string, overrides?: Partial<AgentConfig>): AgentConfig {
    const baseConfig: AgentConfig = {
      agentId,
      agentName: agentId,
      description: `Agent: ${agentId}`,
      modelId: this.config.agents.defaultModelId,
      temperature: this.config.agents.defaultTemperature,
      maxTokens: this.config.agents.defaultMaxTokens,
      topP: this.config.agents.defaultTopP,
    };

    return { ...baseConfig, ...overrides };
  }

  // Validate configuration
  validateConfig(): void {
    const errors: string[] = [];

    // Validate AWS configuration
    if (!this.config.aws.region) {
      errors.push('AWS region is required');
    }

    // Validate agent configuration
    if (this.config.agents.defaultTemperature < 0 || this.config.agents.defaultTemperature > 1) {
      errors.push('Default temperature must be between 0 and 1');
    }

    if (this.config.agents.defaultMaxTokens <= 0) {
      errors.push('Default max tokens must be positive');
    }

    if (this.config.agents.defaultTopP < 0 || this.config.agents.defaultTopP > 1) {
      errors.push('Default top-p must be between 0 and 1');
    }

    // Validate workflow configuration
    if (this.config.workflows.maxExecutionTime <= 0) {
      errors.push('Max execution time must be positive');
    }

    if (this.config.workflows.defaultRetryAttempts < 0) {
      errors.push('Default retry attempts must be non-negative');
    }

    if (errors.length > 0) {
      throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
    }
  }

  // Deep merge configuration objects
  private mergeConfig(base: BedrockAgentsConfig, updates: Partial<BedrockAgentsConfig>): BedrockAgentsConfig {
    const result = { ...base };

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          (result as any)[key] = { ...(result as any)[key], ...value };
        } else {
          (result as any)[key] = value;
        }
      }
    }

    return result;
  }
}

// Environment-specific configurations
export const developmentConfig: Partial<BedrockAgentsConfig> = {
  logging: {
    level: 'debug',
    enableMetrics: true,
    enableTracing: true,
  },
  workflows: {
    maxExecutionTime: 600000, // 10 minutes for development
    defaultRetryAttempts: 1, // Fewer retries for faster feedback
    cleanupInterval: 1800000, // 30 minutes
  },
};

export const productionConfig: Partial<BedrockAgentsConfig> = {
  logging: {
    level: 'warn',
    enableMetrics: true,
    enableTracing: false,
  },
  workflows: {
    maxExecutionTime: 300000, // 5 minutes
    defaultRetryAttempts: 3,
    cleanupInterval: 3600000, // 1 hour
  },
};

export const testConfig: Partial<BedrockAgentsConfig> = {
  agents: {
    defaultModelId: 'mock-model',
    defaultTemperature: 0.5,
    defaultMaxTokens: 1000,
    defaultTopP: 0.8,
    timeout: 5000, // 5 seconds for tests
  },
  logging: {
    level: 'error',
    enableMetrics: false,
    enableTracing: false,
  },
  workflows: {
    maxExecutionTime: 30000, // 30 seconds for tests
    defaultRetryAttempts: 1,
    cleanupInterval: 60000, // 1 minute
  },
};

// Utility functions
export function getEnvironmentConfig(): Partial<BedrockAgentsConfig> {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      return productionConfig;
    case 'test':
      return testConfig;
    case 'development':
    default:
      return developmentConfig;
  }
}

export function createConfigFromEnvironment(): BedrockAgentsConfig {
  const envConfig = getEnvironmentConfig();
  const manager = ConfigManager.getInstance(envConfig);
  manager.validateConfig();
  return manager.getConfig();
}