"use strict";
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
exports.getEnvironmentConfig = void 0;
// Export all constructs for reuse in other packages
__exportStar(require("./constructs/networking"), exports);
__exportStar(require("./constructs/database"), exports);
__exportStar(require("./constructs/lambda"), exports);
__exportStar(require("./constructs/api-gateway"), exports);
__exportStar(require("./constructs/authentication"), exports);
__exportStar(require("./constructs/monitoring"), exports);
__exportStar(require("./constructs/security"), exports);
// Export stacks
__exportStar(require("./stacks/main-stack"), exports);
// Export utility functions
const getEnvironmentConfig = (environment) => {
    const configs = {
        dev: {
            enableSocialLogin: false,
            requireMfa: false,
            alertEmails: ['dev-team@madmall.com'],
        },
        staging: {
            enableSocialLogin: true,
            requireMfa: false,
            alertEmails: ['staging-alerts@madmall.com'],
        },
        prod: {
            enableSocialLogin: true,
            requireMfa: true,
            alertEmails: ['alerts@madmall.com', 'engineering@madmall.com'],
        },
    };
    return configs[environment] || configs.dev;
};
exports.getEnvironmentConfig = getEnvironmentConfig;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxvREFBb0Q7QUFDcEQsMERBQXdDO0FBQ3hDLHdEQUFzQztBQUN0QyxzREFBb0M7QUFDcEMsMkRBQXlDO0FBQ3pDLDhEQUE0QztBQUM1QywwREFBd0M7QUFDeEMsd0RBQXNDO0FBRXRDLGdCQUFnQjtBQUNoQixzREFBb0M7QUFrQnBDLDJCQUEyQjtBQUNwQixNQUFNLG9CQUFvQixHQUFHLENBQUMsV0FBbUIsRUFBaUMsRUFBRTtJQUN6RixNQUFNLE9BQU8sR0FBRztRQUNkLEdBQUcsRUFBRTtZQUNILGlCQUFpQixFQUFFLEtBQUs7WUFDeEIsVUFBVSxFQUFFLEtBQUs7WUFDakIsV0FBVyxFQUFFLENBQUMsc0JBQXNCLENBQUM7U0FDdEM7UUFDRCxPQUFPLEVBQUU7WUFDUCxpQkFBaUIsRUFBRSxJQUFJO1lBQ3ZCLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFdBQVcsRUFBRSxDQUFDLDRCQUE0QixDQUFDO1NBQzVDO1FBQ0QsSUFBSSxFQUFFO1lBQ0osaUJBQWlCLEVBQUUsSUFBSTtZQUN2QixVQUFVLEVBQUUsSUFBSTtZQUNoQixXQUFXLEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSx5QkFBeUIsQ0FBQztTQUMvRDtLQUNGLENBQUM7SUFFRixPQUFPLE9BQU8sQ0FBQyxXQUFtQyxDQUFDLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQztBQUNyRSxDQUFDLENBQUM7QUFwQlcsUUFBQSxvQkFBb0Isd0JBb0IvQiIsInNvdXJjZXNDb250ZW50IjpbIi8vIEV4cG9ydCBhbGwgY29uc3RydWN0cyBmb3IgcmV1c2UgaW4gb3RoZXIgcGFja2FnZXNcbmV4cG9ydCAqIGZyb20gJy4vY29uc3RydWN0cy9uZXR3b3JraW5nJztcbmV4cG9ydCAqIGZyb20gJy4vY29uc3RydWN0cy9kYXRhYmFzZSc7XG5leHBvcnQgKiBmcm9tICcuL2NvbnN0cnVjdHMvbGFtYmRhJztcbmV4cG9ydCAqIGZyb20gJy4vY29uc3RydWN0cy9hcGktZ2F0ZXdheSc7XG5leHBvcnQgKiBmcm9tICcuL2NvbnN0cnVjdHMvYXV0aGVudGljYXRpb24nO1xuZXhwb3J0ICogZnJvbSAnLi9jb25zdHJ1Y3RzL21vbml0b3JpbmcnO1xuZXhwb3J0ICogZnJvbSAnLi9jb25zdHJ1Y3RzL3NlY3VyaXR5JztcblxuLy8gRXhwb3J0IHN0YWNrc1xuZXhwb3J0ICogZnJvbSAnLi9zdGFja3MvbWFpbi1zdGFjayc7XG5cbi8vIFRoZSBmb2xsb3dpbmcgZXhwb3J0cyBwdWxsIGluIGFwcGxpY2F0aW9uIERBTy9zZXJ2aWNlcyBjb2RlIHdoaWNoIGlzIG91dHNpZGUgdGhlIGluZnJhIGJ1aWxkIHNjb3BlLlxuLy8gVGhleSBhcmUgaW50ZW50aW9uYWxseSBjb21tZW50ZWQgb3V0IGZvciB0aGUgaW5mcmEgYnVpbGQgcGlwZWxpbmUuXG4vLyBleHBvcnQgKiBmcm9tICcuL2Rhbyc7XG5cbi8vIEV4cG9ydCB0eXBlcyBhbmQgaW50ZXJmYWNlc1xuZXhwb3J0IGludGVyZmFjZSBJbmZyYXN0cnVjdHVyZUNvbmZpZyB7XG4gIGVudmlyb25tZW50OiBzdHJpbmc7XG4gIHJlZ2lvbjogc3RyaW5nO1xuICBhY2NvdW50OiBzdHJpbmc7XG4gIGRvbWFpbk5hbWU/OiBzdHJpbmc7XG4gIGVuYWJsZVNvY2lhbExvZ2luPzogYm9vbGVhbjtcbiAgcmVxdWlyZU1mYT86IGJvb2xlYW47XG4gIGFsZXJ0RW1haWxzOiBzdHJpbmdbXTtcbiAgc2xhY2tXZWJob29rVXJsPzogc3RyaW5nO1xufVxuXG4vLyBFeHBvcnQgdXRpbGl0eSBmdW5jdGlvbnNcbmV4cG9ydCBjb25zdCBnZXRFbnZpcm9ubWVudENvbmZpZyA9IChlbnZpcm9ubWVudDogc3RyaW5nKTogUGFydGlhbDxJbmZyYXN0cnVjdHVyZUNvbmZpZz4gPT4ge1xuICBjb25zdCBjb25maWdzID0ge1xuICAgIGRldjoge1xuICAgICAgZW5hYmxlU29jaWFsTG9naW46IGZhbHNlLFxuICAgICAgcmVxdWlyZU1mYTogZmFsc2UsXG4gICAgICBhbGVydEVtYWlsczogWydkZXYtdGVhbUBtYWRtYWxsLmNvbSddLFxuICAgIH0sXG4gICAgc3RhZ2luZzoge1xuICAgICAgZW5hYmxlU29jaWFsTG9naW46IHRydWUsXG4gICAgICByZXF1aXJlTWZhOiBmYWxzZSxcbiAgICAgIGFsZXJ0RW1haWxzOiBbJ3N0YWdpbmctYWxlcnRzQG1hZG1hbGwuY29tJ10sXG4gICAgfSxcbiAgICBwcm9kOiB7XG4gICAgICBlbmFibGVTb2NpYWxMb2dpbjogdHJ1ZSxcbiAgICAgIHJlcXVpcmVNZmE6IHRydWUsXG4gICAgICBhbGVydEVtYWlsczogWydhbGVydHNAbWFkbWFsbC5jb20nLCAnZW5naW5lZXJpbmdAbWFkbWFsbC5jb20nXSxcbiAgICB9LFxuICB9O1xuXG4gIHJldHVybiBjb25maWdzW2Vudmlyb25tZW50IGFzIGtleW9mIHR5cGVvZiBjb25maWdzXSB8fCBjb25maWdzLmRldjtcbn07Il19