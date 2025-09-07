/**
 * Event Utilities
 * Helper functions and utilities for working with events
 */
// Event creation utilities
export function createEventId() {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
export function createCorrelationId() {
    return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
export function createDomainEvent(type, aggregateId, aggregateType, aggregateVersion, data, options) {
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
export function createIntegrationEvent(type, data, options) {
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
export function createEventEnvelope(event, options) {
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
export function isValidEvent(event) {
    return (event &&
        typeof event.id === 'string' &&
        typeof event.type === 'string' &&
        typeof event.version === 'string' &&
        typeof event.source === 'string' &&
        typeof event.timestamp === 'string');
}
export function isDomainEvent(event) {
    return ('aggregateId' in event &&
        'aggregateType' in event &&
        'aggregateVersion' in event &&
        'data' in event);
}
export function isIntegrationEvent(event) {
    return 'data' in event && !isDomainEvent(event);
}
// Event filtering utilities
export function filterEventsByType(events, eventType) {
    return events.filter((event) => event.type === eventType);
}
export function filterEventsByAggregateId(events, aggregateId) {
    return events.filter(event => event.aggregateId === aggregateId);
}
export function filterEventsByTimeRange(events, startTime, endTime) {
    return events.filter(event => {
        const eventTime = new Date(event.timestamp);
        return eventTime >= startTime && eventTime <= endTime;
    });
}
// Event serialization utilities
export function serializeEvent(event) {
    return JSON.stringify(event, null, 0);
}
export function deserializeEvent(eventJson) {
    const event = JSON.parse(eventJson);
    if (!isValidEvent(event)) {
        throw new Error('Invalid event format');
    }
    return event;
}
// Event stream utilities
export function sortEventsByTimestamp(events) {
    return [...events].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}
export function groupEventsByAggregateId(events) {
    const grouped = new Map();
    for (const event of events) {
        const existing = grouped.get(event.aggregateId) || [];
        existing.push(event);
        grouped.set(event.aggregateId, existing);
    }
    return grouped;
}
export function getLatestEventByAggregateId(events, aggregateId) {
    const aggregateEvents = events
        .filter(event => event.aggregateId === aggregateId)
        .sort((a, b) => b.aggregateVersion - a.aggregateVersion);
    return aggregateEvents[0];
}
// Event metadata utilities
export function addEventMetadata(event, metadata) {
    return {
        ...event,
        metadata: {
            ...event.metadata,
            ...metadata,
        },
    };
}
export function getEventMetadata(event, key) {
    return event.metadata?.[key];
}
// Event correlation utilities
export function correlateEvents(events, correlationId) {
    return events.filter(event => event.correlationId === correlationId);
}
export function createEventChain(events) {
    const chain = [];
    const eventMap = new Map();
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
function buildChainFromEvent(event, eventMap, chain) {
    chain.push(event);
    // Find events caused by this event
    const causedEvents = Array.from(eventMap.values())
        .filter(e => e.causationId === event.id);
    for (const causedEvent of causedEvents) {
        buildChainFromEvent(causedEvent, eventMap, chain);
    }
}
