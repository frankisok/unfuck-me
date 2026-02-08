import { Injectable } from '@angular/core';

export interface CacheOptions {
  enabled?: boolean
  duration?: number
  keyGenerator?: (...args: any[]) => string
}

export type AMPCacheItem = {
    data: any[],
    timestamp: number
}

export class CacheStore {
  private cache: Map<string, AMPCacheItem> = new Map();
  private options: CacheOptions;

  constructor(options: CacheOptions = {}) {
    this.options = options
  }

  public get<T>(key: string): T | null {
    if (!this.options.enabled) {
      return null;
    }

    const cacheEntry = this.cache.get(key);
    
    if (cacheEntry && this.isValid(cacheEntry)) {
      return cacheEntry.data as T;
    }
    
    return null;
  }

  public set(key: string, data: any): void {
    if (!this.options.enabled) {
      return;
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  public has(key: string): boolean {
    if (!this.options.enabled) {
      return false;
    }

    const cacheEntry = this.cache.get(key);
    return cacheEntry !== undefined && this.isValid(cacheEntry);
  }

  public delete(key: string): void {
    this.cache.delete(key);
  }

  public clear(): void {
    this.cache.clear();
  }

  /**
   * Invalidate all cache entries that match a pattern
   * @param pattern Regular expression pattern to match against keys
   */
  public invalidateByPattern(pattern: RegExp): void {
    const keys = Array.from(this.cache.keys());
    
    keys.forEach(key => {
      if (pattern.test(key)) {
        this.cache.delete(key);
      }
    });
  }

  public isValid(cacheEntry: AMPCacheItem): boolean {
    if (!cacheEntry) {
      return false;
    }

    return Date.now() - cacheEntry.timestamp < this.options.duration
  }

  public generateKey(...args: any[]): string {
    if (this.options.keyGenerator) {
      return this.options.keyGenerator(...args);
    }
    return null
  }
}

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private cacheStores: Map<string, CacheStore> = new Map();

  public createStore(storeName: string, options: CacheOptions = {}): CacheStore {
    const store = new CacheStore(options);
    this.cacheStores.set(storeName, store);
    return store;
  }

  public getStore(storeName: string): CacheStore | undefined {
    return this.cacheStores.get(storeName);
  }

  public clearAll(): void {
    this.cacheStores.forEach(store => store.clear());
  }
}
