import { TitanKCache } from './kcache';

export interface TitanEvent {
  userId: string;
  eventType: 'page' | 'interaction';
  name: string;
  timestamp?: number;
  data?: Record<string, unknown>;
}

/**
 * Basic analytics processor that stores events in TitanKCache so that
 * recommendation pipelines can leverage recent user activity.
 */
export class TitanAnalyticsProcessor {
  private readonly cache: TitanKCache<TitanEvent[]>;

  constructor(cache: TitanKCache<TitanEvent[]>) {
    this.cache = cache;
  }

  async record(event: TitanEvent): Promise<void> {
    const fullEvent: TitanEvent = { ...event, timestamp: event.timestamp || Date.now() };
    const key = ['events', fullEvent.userId];
    const existing = (await this.cache.get(key)) || [];
    existing.push(fullEvent);
    await this.cache.set(key, existing);
  }

  async getEvents(userId: string): Promise<TitanEvent[]> {
    return (await this.cache.get(['events', userId])) || [];
  }
}

