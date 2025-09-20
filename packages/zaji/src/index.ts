// Export working simplified TitanEngine that the web app can actually use
export { TitanEngine } from './simple-titanengine';

// Export complex version with full dependencies (currently broken due to missing deps)
export { TitanEngine as FullTitanEngine } from './service/titanengine';

export * from './providers';
export * from './repository/image-asset-repository';
export * from './handlers/http-handlers';
export * from './handlers/audit-images';
export * from './service/dspy-bridge';
export * from './service/kcache';
export * from './service/analytics-processor';

