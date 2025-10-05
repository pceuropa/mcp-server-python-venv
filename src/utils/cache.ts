interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

class Cache<T> {
    private cache = new Map<string, CacheEntry<T>>();
    private defaultTtl: number;

    constructor(defaultTtl = 300000) {
        this.defaultTtl = defaultTtl;
    }

    set(key: string, data: T, ttl?: number): void {
        const entry: CacheEntry<T> = {
            data,
            timestamp: Date.now(),
            ttl: ttl || this.defaultTtl
        };
        this.cache.set(key, entry);
    }

    get(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        const now = Date.now();
        if (now - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    has(key: string): boolean {
        return this.get(key) !== null;
    }

    delete(key: string): void {
        this.cache.delete(key);
    }

    clear(): void {
        this.cache.clear();
    }

    size(): number {
        return this.cache.size;
    }

    keys(): string[] {
        return Array.from(this.cache.keys());
    }
}

export const packageListCache = new Cache<any>(300000);
export const venvInfoCache = new Cache<any>(600000);
export const outdatedCache = new Cache<any>(600000);
export const requirementsCache = new Cache<any>(300000);

export function generateCacheKey(prefix: string, ...args: (string | number)[]): string {
    return `${prefix}:${args.join(':')}`;
}
