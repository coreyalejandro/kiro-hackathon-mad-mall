/**
 * Events Index
 * Exports all event types and schemas
 */

// Base event types
export * from './base';

// Domain event types
export * from './user-events';
export * from './circle-events';
export * from './story-events';
export * from './resource-events';
export * from './business-events';

// Integration event types (to be implemented)
// export * from './comedy-events';
// export * from './discussion-events';

// System event types
export * from './system-events';

// Event utilities and helpers
export * from './event-utils';

// Union type for all events
import { UserEvent } from './user-events';
import { CircleEvent } from './circle-events';
import { StoryEvent } from './story-events';
import { ResourceEvent } from './resource-events';
import { BusinessEvent } from './business-events';
import { SystemEvent } from './system-events';

export type DomainEventUnion = 
  | UserEvent
  | CircleEvent
  | StoryEvent
  | ResourceEvent
  | BusinessEvent;

export type AllEvents = 
  | DomainEventUnion
  | SystemEvent;