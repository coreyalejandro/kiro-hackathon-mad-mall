/**
 * Event Utilities
 * Helper functions and utilities for working with events
 */

import { BaseEvent, DomainEvent, IntegrationEvent, EventEnvelope, EventMetadata } from './base';

// Event creation utilities
export function createEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function createCorrelationId(): string {
  return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function createDomainEvent<T>(
  type: string,
  aggregateId: string,
  aggregateType: string,
  aggregateVersion: number,
  data: T,
  options?: {
    source?: string;
    correlationId?: string;
    causationId?: string;
    metadata?: any;
  }
): DomainEvent<T> {
  return {
    id: createEventId(),
    type,
    version: '1.0',
    source: options?.source || 'madmall-platform',
    timestamp: new Date().toISOString(),
    correlationId: options?.correlationId,
    causationId: options?.causationId,
    metadata: options?.metadata,
    aggregateId,
    aggregateType,
    aggregateVersion,
    data,
  };
}

export function createIntegrationEvent<T>(
  type: string,
  data: T,
  options?: {
    source?: string;
    correlationId?: string;
    causationId?: string;
    metadata?: any;
  }
): IntegrationEvent<T> {
  return {
    id: createEventId(),
    type,
    version: '1.0',
    source: options?.source || 'madmall-platform',
    timestamp: new Date().toISOString(),
    correlationId: options?.correlationId,
    causationId: options?.causationId,
    metadata: options?.metadata,
    data,
  };
}

// Event envelope utilities
export function createEventEnvelope<T extends BaseEvent>(
  event: T,
  options?: {
    headers?: Record<string, string>;
    maxRetries?: number;
    delayUntil?: Date;
  }
): EventEnvelope<T> {
  return {
    event,
    headers: options?.headers || {},
    messageId: createEventId(),
    timestamp: new Date().toISOString(),
    retryCount: 0,
    maxRetries: options?.maxRetries || 3,
    delayUntil: options?.delayUntil?.toISOString(),
  };
}

// Event validation utilities
export function isValidEvent(event: any): event is BaseEvent {
  return (
    event &&
    typeof event.id === 'string' &&
    typeof event.type === 'string' &&
    typeof event.version === 'string' &&
    typeof event.source === 'string' &&
    typeof event.timestamp === 'string'
  );
}

export function isDomainEvent(event: BaseEvent): event is DomainEvent {
  return (
    'aggregateId' in event &&
    'aggregateType' in event &&
    'aggregateVersion' in event &&
    'data' in event
  );
}

export function isIntegrationEvent(event: BaseEvent): event is IntegrationEvent {
  return 'data' in event && !isDomainEvent(event);
}

// Event filtering utilities
export function filterEventsByType<T extends BaseEvent>(
  events: BaseEvent[],
  eventType: string
): T[] {
  return events.filter((event): event is T => event.type === eventType);
}

export function filterEventsByAggregateId(
  events: DomainEvent[],
  aggregateId: string
): DomainEvent[] {
  return events.filter(event => event.aggregateId === aggregateId);
}

export function filterEventsByTimeRange(
  events: BaseEvent[],
  startTime: Date,
  endTime: Date
): BaseEvent[] {
  return events.filter(event => {
    const eventTime = new Date(event.timestamp);
    return eventTime >= startTime && eventTime <= endTime;
  });
}

// Event serialization utilities
export function serializeEvent(event: BaseEvent): string {
  return JSON.stringify(event, null, 0);
}

export function deserializeEvent(eventJson: string): BaseEvent {
  const event = JSON.parse(eventJson);
  if (!isValidEvent(event)) {
    throw new Error('Invalid event format');
  }
  return event;
}

// Event stream utilities
export function sortEventsByTimestamp(events: BaseEvent[]): BaseEvent[] {
  return [...events].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}

export function groupEventsByAggregateId(events: DomainEvent[]): Map<string, DomainEvent[]> {
  const grouped = new Map<string, DomainEvent[]>();
  
  for (const event of events) {
    const existing = grouped.get(event.aggregateId) || [];
    existing.push(event);
    grouped.set(event.aggregateId, existing);
  }
  
  return grouped;
}

export function getLatestEventByAggregateId(
  events: DomainEvent[],
  aggregateId: string
): DomainEvent | undefined {
  const aggregateEvents = events
    .filter(event => event.aggregateId === aggregateId)
    .sort((a, b) => b.aggregateVersion - a.aggregateVersion);
  
  return aggregateEvents[0];
}

// Event metadata utilities
export function addEventMetadata(
  event: BaseEvent,
  metadata: Record<string, any>
): BaseEvent {
  return {
    ...event,
    metadata: {
      ...event.metadata,
      ...metadata,
    },
  };
}

export function getEventMetadata(event: BaseEvent, key: keyof EventMetadata): any {
  return event.metadata?.[key];
}

// Event correlation utilities
export function correlateEvents(events: BaseEvent[], correlationId: string): BaseEvent[] {
  return events.filter(event => event.correlationId === correlationId);
}

export function createEventChain(events: BaseEvent[]): BaseEvent[] {
  const chain: BaseEvent[] = [];
  const eventMap = new Map<string, BaseEvent>();
  
  // Index events by ID
  for (const event of events) {
    eventMap.set(event.id, event);
  }
  
  // Find root events (no causation ID)
  const rootEvents = events.filter(event => !event.causationId);
  
  // Build chains from root events
  for (const rootEvent of rootEvents) {
    buildChainFromEvent(rootEvent, eventMap, chain);
  }
  
  return chain;
}

function buildChainFromEvent(
  event: BaseEvent,
  eventMap: Map<string, BaseEvent>,
  chain: BaseEvent[]
): void {
  chain.push(event);
  
  // Find events caused by this event
  const causedEvents = Array.from(eventMap.values())
    .filter(e => e.causationId === event.id);
  
  for (const causedEvent of causedEvents) {
    buildChainFromEvent(causedEvent, eventMap, chain);
  }
}