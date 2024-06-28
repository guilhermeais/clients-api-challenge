import { ProductsServiceGateway } from '@/domain/application/gateways/external/products-service.interface';
import { Module } from '@nestjs/common';
import { CacheModule } from '../cache/cache.module';
import { EnvModule } from '../env/env.module';
import { ToolsModule } from '../tools/tools.module';
import { HttpClient } from './http-client.interface';
import { AxiosHttpClient } from './http-client/axios-http-client';
import { LuizaLabsProductsService } from './products-service/luizalabs-products-service';

@Module({
  imports: [EnvModule, ToolsModule, CacheModule],
  providers: [
    {
      provide: HttpClient,
      useClass: AxiosHttpClient,
    },
    {
      provide: ProductsServiceGateway,
      useClass: LuizaLabsProductsService,
    },
  ],
  exports: [ProductsServiceGateway, HttpClient],
})
export class ExternalModule {}
