/**
 * Events Index
 * Exports all event types and schemas
 */
export * from './base';
export * from './user-events';
export * from './circle-events';
export * from './story-events';
export * from './resource-events';
export * from './business-events';
export * from './system-events';
export * from './event-utils';
import { UserEvent } from './user-events';
import { CircleEvent } from './circle-events';
import { StoryEvent } from './story-events';
import { ResourceEvent } from './resource-events';
import { BusinessEvent } from './business-events';
import { SystemEvent } from './system-events';
export type DomainEventUnion = UserEvent | CircleEvent | StoryEvent | ResourceEvent | BusinessEvent;
export type AllEvents = DomainEventUnion | SystemEvent;
