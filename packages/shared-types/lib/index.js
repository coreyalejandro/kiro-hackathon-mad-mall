/**
 * Shared Types Package
 * Main entry point for all shared TypeScript definitions
 */
// Domain models
export * from './domain';
// API contract types
export * from './api';
// Event schemas
export * from './events';
// Configuration types
export * from './config';
// Database types
export * from './database';
// Package metadata
export const PACKAGE_VERSION = '0.0.0';
export const PACKAGE_NAME = '@madmall/shared-types';
// Common enums
export var SortOrder;
(function (SortOrder) {
    SortOrder["ASC"] = "asc";
    SortOrder["DESC"] = "desc";
})(SortOrder || (SortOrder = {}));
export var ContentStatus;
(function (ContentStatus) {
    ContentStatus["DRAFT"] = "draft";
    ContentStatus["PUBLISHED"] = "published";
    ContentStatus["ARCHIVED"] = "archived";
    ContentStatus["DELETED"] = "deleted";
})(ContentStatus || (ContentStatus = {}));
export var UserRole;
(function (UserRole) {
    UserRole["USER"] = "user";
    UserRole["MODERATOR"] = "moderator";
    UserRole["ADMIN"] = "admin";
    UserRole["SUPER_ADMIN"] = "super_admin";
})(UserRole || (UserRole = {}));
