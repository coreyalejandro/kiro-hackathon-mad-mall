/**
 * Event Utilities
 * Helper functions and utilities for working with events
 */
import { BaseEvent, DomainEvent, IntegrationEvent, EventEnvelope, EventMetadata } from './base';
export declare function createEventId(): string;
export declare function createCorrelationId(): string;
export declare function createDomainEvent<T>(type: string, aggregateId: string, aggregateType: string, aggregateVersion: number, data: T, options?: {
    source?: string;
    correlationId?: string;
    causationId?: string;
    metadata?: any;
}): DomainEvent<T>;
export declare function createIntegrationEvent<T>(type: string, data: T, options?: {
    source?: string;
    correlationId?: string;
    causationId?: string;
    metadata?: any;
}): IntegrationEvent<T>;
export declare function createEventEnvelope<T extends BaseEvent>(event: T, options?: {
    headers?: Record<string, string>;
    maxRetries?: number;
    delayUntil?: Date;
}): EventEnvelope<T>;
export declare function isValidEvent(event: any): event is BaseEvent;
export declare function isDomainEvent(event: BaseEvent): event is DomainEvent;
export declare function isIntegrationEvent(event: BaseEvent): event is IntegrationEvent;
export declare function filterEventsByType<T extends BaseEvent>(events: BaseEvent[], eventType: string): T[];
export declare function filterEventsByAggregateId(events: DomainEvent[], aggregateId: string): DomainEvent[];
export declare function filterEventsByTimeRange(events: BaseEvent[], startTime: Date, endTime: Date): BaseEvent[];
export declare function serializeEvent(event: BaseEvent): string;
export declare function deserializeEvent(eventJson: string): BaseEvent;
export declare function sortEventsByTimestamp(events: BaseEvent[]): BaseEvent[];
export declare function groupEventsByAggregateId(events: DomainEvent[]): Map<string, DomainEvent[]>;
export declare function getLatestEventByAggregateId(events: DomainEvent[], aggregateId: string): DomainEvent | undefined;
export declare function addEventMetadata(event: BaseEvent, metadata: Record<string, any>): BaseEvent;
export declare function getEventMetadata(event: BaseEvent, key: keyof EventMetadata): any;
export declare function correlateEvents(events: BaseEvent[], correlationId: string): BaseEvent[];
export declare function createEventChain(events: BaseEvent[]): BaseEvent[];
