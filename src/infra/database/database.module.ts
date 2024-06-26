import { Module } from '@nestjs/common';
import { EnvModule } from '../env/env.module';
import { ToolsModule } from '../tools/tools.module';
import { MONGO_DB_CONNECTION_PROVIDER } from './mongodb/mongodb-connection';
import { CustomerRepository } from '@/domain/application/gateways/repositories/customer-repository.interface';
import { MongoDbCustomerRepository } from './mongodb/repositories/mongodb-customer-repository';

@Module({
  imports: [EnvModule, ToolsModule],
  providers: [
    MONGO_DB_CONNECTION_PROVIDER,
    {
      provide: CustomerRepository,
      useClass: MongoDbCustomerRepository,
    },
  ],
  exports: [CustomerRepository, MONGO_DB_CONNECTION_PROVIDER],
})
export class DatabaseModule {}