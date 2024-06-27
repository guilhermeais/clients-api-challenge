import { AddProductToFavoritesUseCase } from '@/domain/application/use-cases/add-product-to-favorites';
import { CreateCustomerUseCase } from '@/domain/application/use-cases/create-customer';
import { DeleteCustomerUseCase } from '@/domain/application/use-cases/delete-customer';
import { GetCustomerByIdUseCase } from '@/domain/application/use-cases/get-customer-by-id';
import { ListCustomerFavoriteProductsUseCase } from '@/domain/application/use-cases/list-customer-favorite-products';
import { ListCustomersUseCase } from '@/domain/application/use-cases/list-customers';
import { UpdateCustomerUseCase } from '@/domain/application/use-cases/update-customer';
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ExternalModule } from '../external/external-module';
import { ToolsModule } from '../tools/tools.module';
import { CustomerController } from './controllers/customer.controller';

@Module({
  imports: [DatabaseModule, ToolsModule, ExternalModule],
  controllers: [CustomerController],
  providers: [
    CreateCustomerUseCase,
    UpdateCustomerUseCase,
    DeleteCustomerUseCase,
    ListCustomersUseCase,
    GetCustomerByIdUseCase,
    AddProductToFavoritesUseCase,
    ListCustomerFavoriteProductsUseCase,
  ],
})
export class HttpModule {}
