import { createClient, RedisClientType } from 'redis';

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

export class TitanKCache<T = unknown> {
  private client: RedisClientType;
  private readonly ttlSeconds: number;
  private readonly namespace: string;
  private stats: CacheStats = { hits: 0, misses: 0, sets: 0, errors: 0 };
  private readonly useMemory: boolean;
  private memoryStore: Map<string, { value: T; expiresAt: number }>; 

  constructor(config?: KCacheConfig) {
    const url = config?.url || (globalThis as any).process?.env?.REDIS_URL || 'redis://localhost:6379';
    this.ttlSeconds = config?.ttlSeconds ?? 300;
    this.namespace = (config?.namespace || 'titan') + ':kcache:';
    this.client = createClient({ url });
    this.client.on('error', () => {
      this.stats.errors += 1;
    });
    this.useMemory = String((globalThis as any).process?.env?.KCACHE_INMEMORY || '').toLowerCase() === 'true';
    this.memoryStore = new Map();
  }

  async connect(): Promise<void> {
    if (this.useMemory) return;
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
    } catch {
      // Fallback to in-memory
      (this as any).useMemory = true;
    }
  }

  async disconnect(): Promise<void> {
    if (this.useMemory) return;
    if (this.client.isOpen) {
      await this.client.quit();
    }
  }

  private makeKey(keyParts: Array<string | number>): string {
    return this.namespace + keyParts.map((p) => String(p)).join('|');
  }

  async get(keyParts: Array<string | number>): Promise<T | null> {
    const key = this.makeKey(keyParts);
    if (this.useMemory) {
      const entry = this.memoryStore.get(key);
      if (!entry || entry.expiresAt < Date.now()) {
        this.memoryStore.delete(key);
        this.stats.misses += 1;
        return null;
      }
      this.stats.hits += 1;
      return entry.value;
    } else {
      try {
        const value = await this.client.get(key);
        if (value === null) {
          this.stats.misses += 1;
          return null;
        }
        this.stats.hits += 1;
        return JSON.parse(value) as T;
      } catch {
        this.stats.errors += 1;
        return null;
      }
    }
  }

  async set(keyParts: Array<string | number>, value: T, ttlSeconds?: number): Promise<void> {
    const key = this.makeKey(keyParts);
    if (this.useMemory) {
      const expiresAt = Date.now() + 1000 * (ttlSeconds ?? this.ttlSeconds);
      this.memoryStore.set(key, { value, expiresAt });
      this.stats.sets += 1;
    } else {
      try {
        await this.client.set(key, JSON.stringify(value), {
          EX: ttlSeconds ?? this.ttlSeconds,
        });
        this.stats.sets += 1;
      } catch {
        this.stats.errors += 1;
      }
    }
  }

  async withCache(
    keyParts: Array<string | number>,
    producer: () => Promise<T>,
    ttlSeconds?: number,
  ): Promise<{ data: T; cached: boolean } > {
    const cached = await this.get(keyParts);
    if (cached !== null) {
      return { data: cached, cached: true };
    }
    const data = await producer();
    await this.set(keyParts, data, ttlSeconds);
    return { data, cached: false };
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }
}

