import { CreateCustomerUseCase } from '@/domain/application/use-cases/create-customer';
import { DeleteCustomerUseCase } from '@/domain/application/use-cases/delete-customer';
import { GetCustomerByIdUseCase } from '@/domain/application/use-cases/get-customer-by-id';
import { ListCustomersUseCase } from '@/domain/application/use-cases/list-customers';
import { UpdateCustomerUseCase } from '@/domain/application/use-cases/update-customer';
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ToolsModule } from '../tools/tools.module';
import { CustomerController } from './controllers/customer.controller';

@Module({
  imports: [DatabaseModule, ToolsModule],
  controllers: [CustomerController],
  providers: [
    CreateCustomerUseCase,
    UpdateCustomerUseCase,
    DeleteCustomerUseCase,
    ListCustomersUseCase,
    GetCustomerByIdUseCase,
  ],
})
export class HttpModule {}
