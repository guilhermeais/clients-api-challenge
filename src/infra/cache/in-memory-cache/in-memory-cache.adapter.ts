import { Injectable } from '@nestjs/common';
import NodeCache from 'node-cache';
import { Cache } from '../cache.interface';

@Injectable()
export class InMemoryCacheAdapter implements Cache {
  private readonly nodeCache = new NodeCache();
  async get<T>(key: string): Promise<T> {
    return this.nodeCache.get(key);
  }

  async set<T>(key: string, value: T): Promise<void> {
    this.nodeCache.set(key, value);
  }

  async del(key: string): Promise<void> {
    this.nodeCache.del(key);
  }
}
