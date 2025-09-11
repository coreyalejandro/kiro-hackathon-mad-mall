"use strict";
/**
 * Configuration Types Index
 * Exports all configuration-related types
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
// Environment configuration
__exportStar(require("./environment"), exports);
// Feature flags configuration
__exportStar(require("./feature-flags"), exports);
// Configuration utilities and helpers (temporarily disabled due to incomplete implementation)
// export * from './config-utils';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztHQUdHOzs7Ozs7Ozs7Ozs7Ozs7O0FBRUgsNEJBQTRCO0FBQzVCLGdEQUE4QjtBQUU5Qiw4QkFBOEI7QUFDOUIsa0RBQWdDO0FBRWhDLDhGQUE4RjtBQUM5RixrQ0FBa0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvbmZpZ3VyYXRpb24gVHlwZXMgSW5kZXhcbiAqIEV4cG9ydHMgYWxsIGNvbmZpZ3VyYXRpb24tcmVsYXRlZCB0eXBlc1xuICovXG5cbi8vIEVudmlyb25tZW50IGNvbmZpZ3VyYXRpb25cbmV4cG9ydCAqIGZyb20gJy4vZW52aXJvbm1lbnQnO1xuXG4vLyBGZWF0dXJlIGZsYWdzIGNvbmZpZ3VyYXRpb25cbmV4cG9ydCAqIGZyb20gJy4vZmVhdHVyZS1mbGFncyc7XG5cbi8vIENvbmZpZ3VyYXRpb24gdXRpbGl0aWVzIGFuZCBoZWxwZXJzICh0ZW1wb3JhcmlseSBkaXNhYmxlZCBkdWUgdG8gaW5jb21wbGV0ZSBpbXBsZW1lbnRhdGlvbilcbi8vIGV4cG9ydCAqIGZyb20gJy4vY29uZmlnLXV0aWxzJzsiXX0=