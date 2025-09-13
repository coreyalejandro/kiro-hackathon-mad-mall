"use strict";
/**
 * Database Layer Types and Interfaces
 * Core database abstractions and DynamoDB-specific types
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
__exportStar(require("./base-entity"), exports);
__exportStar(require("./dao-interfaces"), exports);
__exportStar(require("./query-builder"), exports);
__exportStar(require("./migration-types"), exports);
__exportStar(require("./validation"), exports);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zaGFyZWQtdHlwZXMvc3JjL2RhdGFiYXNlL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O0dBR0c7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFSCxnREFBOEI7QUFDOUIsbURBQWlDO0FBQ2pDLGtEQUFnQztBQUNoQyxvREFBa0M7QUFDbEMsK0NBQTZCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBEYXRhYmFzZSBMYXllciBUeXBlcyBhbmQgSW50ZXJmYWNlc1xuICogQ29yZSBkYXRhYmFzZSBhYnN0cmFjdGlvbnMgYW5kIER5bmFtb0RCLXNwZWNpZmljIHR5cGVzXG4gKi9cblxuZXhwb3J0ICogZnJvbSAnLi9iYXNlLWVudGl0eSc7XG5leHBvcnQgKiBmcm9tICcuL2Rhby1pbnRlcmZhY2VzJztcbmV4cG9ydCAqIGZyb20gJy4vcXVlcnktYnVpbGRlcic7XG5leHBvcnQgKiBmcm9tICcuL21pZ3JhdGlvbi10eXBlcyc7XG5leHBvcnQgKiBmcm9tICcuL3ZhbGlkYXRpb24nOyJdfQ==