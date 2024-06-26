import { CreateCustomerUseCase } from '@/domain/application/use-cases/create-customer';
import { UpdateCustomerUseCase } from '@/domain/application/use-cases/update-customer';
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ToolsModule } from '../tools/tools.module';
import { CustomerController } from './controllers/customer.controller';

@Module({
  imports: [DatabaseModule, ToolsModule],
  controllers: [CustomerController],
  providers: [CreateCustomerUseCase, UpdateCustomerUseCase],
})
export class HttpModule {}
