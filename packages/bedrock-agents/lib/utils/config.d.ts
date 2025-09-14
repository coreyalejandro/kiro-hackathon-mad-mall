import { AgentConfig } from '../types/agent-types';
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
export declare const defaultConfig: BedrockAgentsConfig;
export declare class ConfigManager {
    private static instance;
    private config;
    private constructor();
    static getInstance(config?: Partial<BedrockAgentsConfig>): ConfigManager;
    getConfig(): BedrockAgentsConfig;
    updateConfig(updates: Partial<BedrockAgentsConfig>): void;
    getAgentConfig(agentId: string, overrides?: Partial<AgentConfig>): AgentConfig;
    validateConfig(): void;
    private mergeConfig;
}
export declare const developmentConfig: Partial<BedrockAgentsConfig>;
export declare const productionConfig: Partial<BedrockAgentsConfig>;
export declare const testConfig: Partial<BedrockAgentsConfig>;
export declare function getEnvironmentConfig(): Partial<BedrockAgentsConfig>;
export declare function createConfigFromEnvironment(): BedrockAgentsConfig;
//# sourceMappingURL=config.d.ts.map