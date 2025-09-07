/**
 * MADMall API Gateway Package
 * 
 * This package contains Smithy IDL definitions for the MADMall Social Wellness Platform API.
 * The actual client code is generated from the Smithy models and placed in the lib/ directory.
 * 
 * To use the generated client:
 * 1. Run `npm run generate` to build the TypeScript client from Smithy models
 * 2. Import from the generated lib/ directory
 * 
 * @example
 * ```typescript
 * import { MADMallAPIClient } from '../lib';
 * 
 * const client = new MADMallAPIClient({
 *   endpoint: 'https://api.madmall.com/v1'
 * });
 * ```
 */

export * from './utils/validation';
export * from './utils/constants';
export * from './utils/helpers';