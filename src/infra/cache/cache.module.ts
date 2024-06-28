import { Module } from '@nestjs/common';
import { Cache } from './cache.interface';
import { InMemoryCacheAdapter } from './in-memory-cache/in-memory-cache.adapter';

@Module({
  providers: [
    {
      provide: Cache,
      useClass: InMemoryCacheAdapter,
    },
  ],
  exports: [Cache],
})
export class CacheModule {}
