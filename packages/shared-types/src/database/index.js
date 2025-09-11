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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztHQUdHOzs7Ozs7Ozs7Ozs7Ozs7O0FBRUgsZ0RBQThCO0FBQzlCLG1EQUFpQztBQUNqQyxrREFBZ0M7QUFDaEMsb0RBQWtDO0FBQ2xDLCtDQUE2QiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogRGF0YWJhc2UgTGF5ZXIgVHlwZXMgYW5kIEludGVyZmFjZXNcbiAqIENvcmUgZGF0YWJhc2UgYWJzdHJhY3Rpb25zIGFuZCBEeW5hbW9EQi1zcGVjaWZpYyB0eXBlc1xuICovXG5cbmV4cG9ydCAqIGZyb20gJy4vYmFzZS1lbnRpdHknO1xuZXhwb3J0ICogZnJvbSAnLi9kYW8taW50ZXJmYWNlcyc7XG5leHBvcnQgKiBmcm9tICcuL3F1ZXJ5LWJ1aWxkZXInO1xuZXhwb3J0ICogZnJvbSAnLi9taWdyYXRpb24tdHlwZXMnO1xuZXhwb3J0ICogZnJvbSAnLi92YWxpZGF0aW9uJzsiXX0=