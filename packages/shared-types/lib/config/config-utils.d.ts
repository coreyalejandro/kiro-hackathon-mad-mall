/**
 * Configuration Utilities
 * Helper functions for configuration management
 */
import { AppConfig, Environment, ConfigValidationRule, ConfigValidationResult } from './environment';
export declare function loadConfigFromEnvironment(): Partial<AppConfig>;
export declare function validateConfig(config: Partial<AppConfig>, rules: ConfigValidationRule[]): ConfigValidationResult;
export declare function mergeConfigs(base: Partial<AppConfig>, override: Partial<AppConfig>): Partial<AppConfig>;
export declare function deepMerge(target: any, source: any): any;
export declare function getNestedValue(obj: any, path: string): any;
export declare function setNestedValue(obj: any, path: string, value: any): void;
export declare function getEnvironmentConfig(environment: Environment): Partial<AppConfig>;
export declare const MADMALL_CONFIG_RULES: ConfigValidationRule[];
//# sourceMappingURL=config-utils.d.ts.map