/**
 * Shared Types Package
 * Main entry point for all shared TypeScript definitions
 */
export * from './domain';
export * from './api';
export * from './events';
export * from './config';
export * from './database';
export declare const PACKAGE_VERSION = "0.0.0";
export declare const PACKAGE_NAME = "@madmall/shared-types";
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;
export type EntityId = string;
export type UserId = string;
export type CircleId = string;
export type StoryId = string;
export type ResourceId = string;
export type BusinessId = string;
export type ProductId = string;
export type ISODateString = string;
export type UnixTimestamp = number;
export declare enum SortOrder {
    ASC = "asc",
    DESC = "desc"
}
export declare enum ContentStatus {
    DRAFT = "draft",
    PUBLISHED = "published",
    ARCHIVED = "archived",
    DELETED = "deleted"
}
export declare enum UserRole {
    USER = "user",
    MODERATOR = "moderator",
    ADMIN = "admin",
    SUPER_ADMIN = "super_admin"
}
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type Writeable<T> = {
    -readonly [P in keyof T]: T[P];
};
export type DeepWriteable<T> = {
    -readonly [P in keyof T]: DeepWriteable<T[P]>;
};
export type Brand<T, B> = T & {
    __brand: B;
};
export type UsernameString = Brand<string, 'Username'>;
export type EmailString = Brand<string, 'Email'>;
export type PasswordString = Brand<string, 'Password'>;
export type UrlString = Brand<string, 'Url'>;
export type Result<T, E = Error> = {
    success: true;
    data: T;
} | {
    success: false;
    error: E;
};
export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;
export interface ResponseWrapper<T> {
    data: T;
    success: boolean;
    message?: string;
    timestamp: string;
}
export interface BaseError {
    code: string;
    message: string;
    details?: Record<string, any>;
}
export interface ValidationError extends BaseError {
    field: string;
    value?: any;
}
export interface BusinessError extends BaseError {
    businessRule: string;
}
export interface SystemError extends BaseError {
    systemComponent: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
}
//# sourceMappingURL=index.d.ts.map