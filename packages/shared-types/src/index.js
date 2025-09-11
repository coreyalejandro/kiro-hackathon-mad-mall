"use strict";
/**
 * Shared Types Package
 * Main entry point for all shared TypeScript definitions
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
exports.UserRole = exports.ContentStatus = exports.SortOrder = exports.PACKAGE_NAME = exports.PACKAGE_VERSION = void 0;
// Domain models
__exportStar(require("./domain"), exports);
// API contract types
__exportStar(require("./api"), exports);
// Event schemas
__exportStar(require("./events"), exports);
// Configuration types
__exportStar(require("./config"), exports);
// Database types
__exportStar(require("./database"), exports);
// Package metadata
exports.PACKAGE_VERSION = '0.0.0';
exports.PACKAGE_NAME = '@madmall/shared-types';
// Common enums
var SortOrder;
(function (SortOrder) {
    SortOrder["ASC"] = "asc";
    SortOrder["DESC"] = "desc";
})(SortOrder || (exports.SortOrder = SortOrder = {}));
var ContentStatus;
(function (ContentStatus) {
    ContentStatus["DRAFT"] = "draft";
    ContentStatus["PUBLISHED"] = "published";
    ContentStatus["ARCHIVED"] = "archived";
    ContentStatus["DELETED"] = "deleted";
})(ContentStatus || (exports.ContentStatus = ContentStatus = {}));
var UserRole;
(function (UserRole) {
    UserRole["USER"] = "user";
    UserRole["MODERATOR"] = "moderator";
    UserRole["ADMIN"] = "admin";
    UserRole["SUPER_ADMIN"] = "super_admin";
})(UserRole || (exports.UserRole = UserRole = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztHQUdHOzs7Ozs7Ozs7Ozs7Ozs7OztBQUVILGdCQUFnQjtBQUNoQiwyQ0FBeUI7QUFFekIscUJBQXFCO0FBQ3JCLHdDQUFzQjtBQUV0QixnQkFBZ0I7QUFDaEIsMkNBQXlCO0FBRXpCLHNCQUFzQjtBQUN0QiwyQ0FBeUI7QUFFekIsaUJBQWlCO0FBQ2pCLDZDQUEyQjtBQUUzQixtQkFBbUI7QUFDTixRQUFBLGVBQWUsR0FBRyxPQUFPLENBQUM7QUFDMUIsUUFBQSxZQUFZLEdBQUcsdUJBQXVCLENBQUM7QUFvQnBELGVBQWU7QUFDZixJQUFZLFNBR1g7QUFIRCxXQUFZLFNBQVM7SUFDbkIsd0JBQVcsQ0FBQTtJQUNYLDBCQUFhLENBQUE7QUFDZixDQUFDLEVBSFcsU0FBUyx5QkFBVCxTQUFTLFFBR3BCO0FBRUQsSUFBWSxhQUtYO0FBTEQsV0FBWSxhQUFhO0lBQ3ZCLGdDQUFlLENBQUE7SUFDZix3Q0FBdUIsQ0FBQTtJQUN2QixzQ0FBcUIsQ0FBQTtJQUNyQixvQ0FBbUIsQ0FBQTtBQUNyQixDQUFDLEVBTFcsYUFBYSw2QkFBYixhQUFhLFFBS3hCO0FBRUQsSUFBWSxRQUtYO0FBTEQsV0FBWSxRQUFRO0lBQ2xCLHlCQUFhLENBQUE7SUFDYixtQ0FBdUIsQ0FBQTtJQUN2QiwyQkFBZSxDQUFBO0lBQ2YsdUNBQTJCLENBQUE7QUFDN0IsQ0FBQyxFQUxXLFFBQVEsd0JBQVIsUUFBUSxRQUtuQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogU2hhcmVkIFR5cGVzIFBhY2thZ2VcbiAqIE1haW4gZW50cnkgcG9pbnQgZm9yIGFsbCBzaGFyZWQgVHlwZVNjcmlwdCBkZWZpbml0aW9uc1xuICovXG5cbi8vIERvbWFpbiBtb2RlbHNcbmV4cG9ydCAqIGZyb20gJy4vZG9tYWluJztcblxuLy8gQVBJIGNvbnRyYWN0IHR5cGVzXG5leHBvcnQgKiBmcm9tICcuL2FwaSc7XG5cbi8vIEV2ZW50IHNjaGVtYXNcbmV4cG9ydCAqIGZyb20gJy4vZXZlbnRzJztcblxuLy8gQ29uZmlndXJhdGlvbiB0eXBlc1xuZXhwb3J0ICogZnJvbSAnLi9jb25maWcnO1xuXG4vLyBEYXRhYmFzZSB0eXBlc1xuZXhwb3J0ICogZnJvbSAnLi9kYXRhYmFzZSc7XG5cbi8vIFBhY2thZ2UgbWV0YWRhdGFcbmV4cG9ydCBjb25zdCBQQUNLQUdFX1ZFUlNJT04gPSAnMC4wLjAnO1xuZXhwb3J0IGNvbnN0IFBBQ0tBR0VfTkFNRSA9ICdAbWFkbWFsbC9zaGFyZWQtdHlwZXMnO1xuXG4vLyBDb21tb24gdXRpbGl0eSB0eXBlc1xuZXhwb3J0IHR5cGUgTnVsbGFibGU8VD4gPSBUIHwgbnVsbDtcbmV4cG9ydCB0eXBlIE9wdGlvbmFsPFQ+ID0gVCB8IHVuZGVmaW5lZDtcbmV4cG9ydCB0eXBlIE1heWJlPFQ+ID0gVCB8IG51bGwgfCB1bmRlZmluZWQ7XG5cbi8vIEdlbmVyaWMgSUQgdHlwZXNcbmV4cG9ydCB0eXBlIEVudGl0eUlkID0gc3RyaW5nO1xuZXhwb3J0IHR5cGUgVXNlcklkID0gc3RyaW5nO1xuZXhwb3J0IHR5cGUgQ2lyY2xlSWQgPSBzdHJpbmc7XG5leHBvcnQgdHlwZSBTdG9yeUlkID0gc3RyaW5nO1xuZXhwb3J0IHR5cGUgUmVzb3VyY2VJZCA9IHN0cmluZztcbmV4cG9ydCB0eXBlIEJ1c2luZXNzSWQgPSBzdHJpbmc7XG5leHBvcnQgdHlwZSBQcm9kdWN0SWQgPSBzdHJpbmc7XG5cbi8vIFRpbWVzdGFtcCB0eXBlc1xuZXhwb3J0IHR5cGUgSVNPRGF0ZVN0cmluZyA9IHN0cmluZztcbmV4cG9ydCB0eXBlIFVuaXhUaW1lc3RhbXAgPSBudW1iZXI7XG5cbi8vIENvbW1vbiBlbnVtc1xuZXhwb3J0IGVudW0gU29ydE9yZGVyIHtcbiAgQVNDID0gJ2FzYycsXG4gIERFU0MgPSAnZGVzYycsXG59XG5cbmV4cG9ydCBlbnVtIENvbnRlbnRTdGF0dXMge1xuICBEUkFGVCA9ICdkcmFmdCcsXG4gIFBVQkxJU0hFRCA9ICdwdWJsaXNoZWQnLFxuICBBUkNISVZFRCA9ICdhcmNoaXZlZCcsXG4gIERFTEVURUQgPSAnZGVsZXRlZCcsXG59XG5cbmV4cG9ydCBlbnVtIFVzZXJSb2xlIHtcbiAgVVNFUiA9ICd1c2VyJyxcbiAgTU9ERVJBVE9SID0gJ21vZGVyYXRvcicsXG4gIEFETUlOID0gJ2FkbWluJyxcbiAgU1VQRVJfQURNSU4gPSAnc3VwZXJfYWRtaW4nLFxufVxuXG4vLyBVdGlsaXR5IHR5cGUgaGVscGVyc1xuZXhwb3J0IHR5cGUgRGVlcFBhcnRpYWw8VD4gPSB7XG4gIFtQIGluIGtleW9mIFRdPzogVFtQXSBleHRlbmRzIG9iamVjdCA/IERlZXBQYXJ0aWFsPFRbUF0+IDogVFtQXTtcbn07XG5cbmV4cG9ydCB0eXBlIFJlcXVpcmVkRmllbGRzPFQsIEsgZXh0ZW5kcyBrZXlvZiBUPiA9IFQgJiBSZXF1aXJlZDxQaWNrPFQsIEs+PjtcblxuZXhwb3J0IHR5cGUgT3B0aW9uYWxGaWVsZHM8VCwgSyBleHRlbmRzIGtleW9mIFQ+ID0gT21pdDxULCBLPiAmIFBhcnRpYWw8UGljazxULCBLPj47XG5cbmV4cG9ydCB0eXBlIFdyaXRlYWJsZTxUPiA9IHsgLXJlYWRvbmx5IFtQIGluIGtleW9mIFRdOiBUW1BdIH07XG5cbmV4cG9ydCB0eXBlIERlZXBXcml0ZWFibGU8VD4gPSB7IC1yZWFkb25seSBbUCBpbiBrZXlvZiBUXTogRGVlcFdyaXRlYWJsZTxUW1BdPiB9O1xuXG4vLyBCcmFuZCB0eXBlcyBmb3IgdHlwZSBzYWZldHlcbmV4cG9ydCB0eXBlIEJyYW5kPFQsIEI+ID0gVCAmIHsgX19icmFuZDogQiB9O1xuXG5leHBvcnQgdHlwZSBVc2VybmFtZVN0cmluZyA9IEJyYW5kPHN0cmluZywgJ1VzZXJuYW1lJz47XG5leHBvcnQgdHlwZSBFbWFpbFN0cmluZyA9IEJyYW5kPHN0cmluZywgJ0VtYWlsJz47XG5leHBvcnQgdHlwZSBQYXNzd29yZFN0cmluZyA9IEJyYW5kPHN0cmluZywgJ1Bhc3N3b3JkJz47XG5leHBvcnQgdHlwZSBVcmxTdHJpbmcgPSBCcmFuZDxzdHJpbmcsICdVcmwnPjtcblxuLy8gUmVzdWx0IHR5cGUgZm9yIGVycm9yIGhhbmRsaW5nXG5leHBvcnQgdHlwZSBSZXN1bHQ8VCwgRSA9IEVycm9yPiA9IFxuICB8IHsgc3VjY2VzczogdHJ1ZTsgZGF0YTogVCB9XG4gIHwgeyBzdWNjZXNzOiBmYWxzZTsgZXJyb3I6IEUgfTtcblxuLy8gQXN5bmMgcmVzdWx0IHR5cGVcbmV4cG9ydCB0eXBlIEFzeW5jUmVzdWx0PFQsIEUgPSBFcnJvcj4gPSBQcm9taXNlPFJlc3VsdDxULCBFPj47XG5cbi8vIENvbW1vbiByZXNwb25zZSB3cmFwcGVyXG5leHBvcnQgaW50ZXJmYWNlIFJlc3BvbnNlV3JhcHBlcjxUPiB7XG4gIGRhdGE6IFQ7XG4gIHN1Y2Nlc3M6IGJvb2xlYW47XG4gIG1lc3NhZ2U/OiBzdHJpbmc7XG4gIHRpbWVzdGFtcDogc3RyaW5nO1xufVxuXG4vLyBFcnJvciB0eXBlc1xuZXhwb3J0IGludGVyZmFjZSBCYXNlRXJyb3Ige1xuICBjb2RlOiBzdHJpbmc7XG4gIG1lc3NhZ2U6IHN0cmluZztcbiAgZGV0YWlscz86IFJlY29yZDxzdHJpbmcsIGFueT47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVmFsaWRhdGlvbkVycm9yIGV4dGVuZHMgQmFzZUVycm9yIHtcbiAgZmllbGQ6IHN0cmluZztcbiAgdmFsdWU/OiBhbnk7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQnVzaW5lc3NFcnJvciBleHRlbmRzIEJhc2VFcnJvciB7XG4gIGJ1c2luZXNzUnVsZTogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFN5c3RlbUVycm9yIGV4dGVuZHMgQmFzZUVycm9yIHtcbiAgc3lzdGVtQ29tcG9uZW50OiBzdHJpbmc7XG4gIHNldmVyaXR5OiAnbG93JyB8ICdtZWRpdW0nIHwgJ2hpZ2gnIHwgJ2NyaXRpY2FsJztcbn0iXX0=