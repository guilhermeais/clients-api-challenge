import { ProductsServiceGateway } from '@/domain/application/gateways/external/products-service.interface';
import { AppModule } from '@/infra/app.module';
import { ModuleMetadata } from '@nestjs/common';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { FakeProductsServiceGateway } from 'test/mocks/domain/application/fateways/external/products-service.mock';

export function makeFakeApp(
  modifications?: Partial<ModuleMetadata>,
): TestingModuleBuilder {
  return Test.createTestingModule({
    ...modifications,
    imports: [AppModule, ...(modifications?.imports ?? [])],
  })
    .overrideProvider(ProductsServiceGateway)
    .useClass(FakeProductsServiceGateway);
}
