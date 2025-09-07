/**
 * Base Event Types
 * Core event structures for inter-service communication
 */
export interface BaseEvent {
    id: string;
    type: string;
    version: string;
    source: string;
    timestamp: string;
    correlationId?: string;
    causationId?: string;
    metadata?: EventMetadata;
}
export interface EventMetadata {
    userId?: string;
    tenantId?: string;
    sessionId?: string;
    requestId?: string;
    userAgent?: string;
    ipAddress?: string;
    traceId?: string;
    spanId?: string;
    tags?: Record<string, string>;
}
export interface DomainEvent<T = any> extends BaseEvent {
    aggregateId: string;
    aggregateType: string;
    aggregateVersion: number;
    data: T;
}
export interface IntegrationEvent<T = any> extends BaseEvent {
    data: T;
}
export interface EventEnvelope<T extends BaseEvent = BaseEvent> {
    event: T;
    headers: Record<string, string>;
    messageId: string;
    timestamp: string;
    retryCount?: number;
    maxRetries?: number;
    delayUntil?: string;
}
export interface EventHandlerResult {
    success: boolean;
    error?: string;
    retry?: boolean;
    delaySeconds?: number;
}
export interface EventSubscription {
    id: string;
    eventType: string;
    handlerName: string;
    isActive: boolean;
    filterExpression?: string;
    deadLetterQueue?: string;
    maxRetries?: number;
    retryDelaySeconds?: number;
    createdAt: string;
    updatedAt: string;
}
export interface EventStoreRecord {
    streamId: string;
    eventId: string;
    eventType: string;
    eventVersion: string;
    aggregateId: string;
    aggregateType: string;
    aggregateVersion: number;
    eventData: string;
    eventMetadata: string;
    timestamp: string;
    position: number;
}
export interface EventProjection {
    id: string;
    name: string;
    version: string;
    lastProcessedPosition: number;
    lastProcessedAt: string;
    status: 'running' | 'stopped' | 'error' | 'rebuilding';
    error?: string;
    createdAt: string;
    updatedAt: string;
}
export interface Snapshot<T = any> {
    aggregateId: string;
    aggregateType: string;
    aggregateVersion: number;
    data: T;
    timestamp: string;
}
//# sourceMappingURL=base.d.ts.map