export interface KCacheConfig {
    url?: string;
    ttlSeconds?: number;
    namespace?: string;
}
export interface CacheStats {
    hits: number;
    misses: number;
    sets: number;
    errors: number;
}
export declare class TitanKCache<T = unknown> {
    private client;
    private readonly ttlSeconds;
    private readonly namespace;
    private stats;
    private readonly useMemory;
    private memoryStore;
    constructor(config?: KCacheConfig);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    private makeKey;
    get(keyParts: Array<string | number>): Promise<T | null>;
    set(keyParts: Array<string | number>, value: T, ttlSeconds?: number): Promise<void>;
    withCache(keyParts: Array<string | number>, producer: () => Promise<T>, ttlSeconds?: number): Promise<{
        data: T;
        cached: boolean;
    }>;
    getStats(): CacheStats;
}
