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
export declare class TitanAnalyticsProcessor {
    private readonly cache;
    constructor(cache: TitanKCache<TitanEvent[]>);
    record(event: TitanEvent): Promise<void>;
    getEvents(userId: string): Promise<TitanEvent[]>;
}
