export abstract class Cache {
  abstract get<T>(key: string): Promise<T | null>;
  abstract set<T>(key: string, value: T): Promise<void>;
  abstract del(key: string): Promise<void>;
}
