import { AppModule } from '@/app.module';
import { ModuleMetadata } from '@nestjs/common';
import { Test, TestingModuleBuilder } from '@nestjs/testing';

export function makeFakeApp(
  modifications?: Partial<ModuleMetadata>,
): TestingModuleBuilder {
  return Test.createTestingModule({
    ...modifications,
    imports: [AppModule, ...(modifications?.imports ?? [])],
  });
}
