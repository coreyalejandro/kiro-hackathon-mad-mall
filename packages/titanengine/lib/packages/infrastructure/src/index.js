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
//# sourceMappingURL=index.js.map