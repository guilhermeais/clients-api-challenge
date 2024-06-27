import { Logger } from '@/domain/application/gateways/tools/logger.interface';
import { AddProductToFavoritesUseCase } from '@/domain/application/use-cases/add-product-to-favorites';
import { CreateCustomerUseCase } from '@/domain/application/use-cases/create-customer';
import { DeleteCustomerUseCase } from '@/domain/application/use-cases/delete-customer';
import { GetCustomerByIdUseCase } from '@/domain/application/use-cases/get-customer-by-id';
import { ListCustomersUseCase } from '@/domain/application/use-cases/list-customers';
import { UpdateCustomerUseCase } from '@/domain/application/use-cases/update-customer';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import {
  CustomerHttpResponse,
  CustomerPresenter,
} from './presenters/customer.presenter';
import {
  CreateCustomerSchema,
  TCreateCustomerSchema,
} from './schemas/create-customer.schema';
import {
  ListCustomersSchema,
  TListCustomersResponse,
  TListCustomersSchema,
} from './schemas/list-customers.schema';
import {
  TUpdateCustomerSchema,
  UpdateCustomerSchema,
} from './schemas/update-customer.schema';

@Controller('customers')
export class CustomerController {
  constructor(
    private readonly createCustomerUseCase: CreateCustomerUseCase,
    private readonly updateCustomerUseCase: UpdateCustomerUseCase,
    private readonly deleteCustomerUseCase: DeleteCustomerUseCase,
    private readonly listCustomersUseCase: ListCustomersUseCase,
    private readonly getCustomerByIdUseCase: GetCustomerByIdUseCase,
    private readonly addProductToFavoritesUseCase: AddProductToFavoritesUseCase,
    private readonly logger: Logger,
  ) {}

  @Get()
  async listCustomers(
    @Query(new ZodValidationPipe(ListCustomersSchema))
    query: TListCustomersSchema,
  ): Promise<TListCustomersResponse> {
    try {
      this.logger.log(
        CustomerController.name,
        `Listing customers with query ${JSON.stringify(query, null, 2)}`,
      );

      const customers = await this.listCustomersUseCase.execute({
        limit: query.limit,
        page: query.page,
        email: query.email,
        name: query.name,
      });

      this.logger.log(
        CustomerController.name,
        `Found a total of ${customers.total} customers...`,
      );

      return {
        items: customers.items.map(CustomerPresenter.toHTTP),
        total: customers.total,
        limit: customers.limit,
        currentPage: customers.currentPage,
        pages: customers.pages,
      };
    } catch (error) {
      this.logger.error(
        CustomerController.name,
        `Error listing customers with query ${JSON.stringify(query, null, 2)}: ${error?.message}`,
        error?.stack,
      );

      throw error;
    }
  }

  @Get(':id')
  async getCustomerById(
    @Param('id') id: string,
  ): Promise<CustomerHttpResponse> {
    try {
      this.logger.log(
        CustomerController.name,
        `Getting customer with id ${id}`,
      );

      const customer = await this.getCustomerByIdUseCase.execute({
        id,
      });

      this.logger.log(CustomerController.name, `Customer with id ${id} found`);

      return CustomerPresenter.toHTTP(customer);
    } catch (error) {
      this.logger.error(
        CustomerController.name,
        `Error getting customer with id ${id}: ${error?.message}`,
        error?.stack,
      );

      throw error;
    }
  }

  @Post()
  async createCustomer(
    @Body(new ZodValidationPipe(CreateCustomerSchema))
    body: TCreateCustomerSchema,
  ): Promise<CustomerHttpResponse> {
    try {
      this.logger.log(
        CustomerController.name,
        `Creating customer with name ${body.name} and email ${body.email}`,
      );

      const customer = await this.createCustomerUseCase.execute({
        email: body.email,
        name: body.name,
      });

      this.logger.log(
        CustomerController.name,
        `Customer created ${body.email} with id ${customer.id}`,
      );

      return CustomerPresenter.toHTTP(customer);
    } catch (error) {
      this.logger.error(
        CustomerController.name,
        `Error creating customer with name ${body.name} and email ${body.email}: ${error?.message}`,
        error?.stack,
      );

      throw error;
    }
  }

  @Patch(':id')
  @HttpCode(204)
  async updateCustomer(
    @Body(new ZodValidationPipe(UpdateCustomerSchema))
    body: TUpdateCustomerSchema,
    @Param('id') id: string,
  ): Promise<void> {
    try {
      this.logger.log(
        CustomerController.name,
        `Updating customer with id ${id} with name ${body.name} and email ${body.email}`,
      );

      await this.updateCustomerUseCase.execute({
        email: body.email,
        id,
        name: body.name,
      });

      this.logger.log(
        CustomerController.name,
        `Customer with id ${id} updated with name ${body.name} and email ${body.email}`,
      );

      return;
    } catch (error) {
      this.logger.error(
        CustomerController.name,
        `Error updating customer with id ${id} with name ${body.name} and email ${body.email}: ${error?.message}`,
        error?.stack,
      );

      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteCustomer(@Param('id') id: string): Promise<void> {
    try {
      this.logger.log(
        CustomerController.name,
        `Deleting customer with id ${id}`,
      );

      await this.deleteCustomerUseCase.execute({
        id,
      });

      this.logger.log(
        CustomerController.name,
        `Customer with id ${id} deleted`,
      );
    } catch (error) {
      this.logger.error(
        CustomerController.name,
        `Error deleting customer with id ${id}: ${error?.message}`,
        error?.stack,
      );

      throw error;
    }
  }

  @Post(':id/favorites')
  @HttpCode(204)
  async addProductToFavorites(
    @Param('id') id: string,
    @Body(
      'productId',
      new ZodValidationPipe(
        z.string().uuid({
          message: 'ID do produto deve ser um UUID.',
        }),
      ),
    )
    productId: string,
  ): Promise<void> {
    try {
      this.logger.log(
        CustomerController.name,
        `Adding product with id ${productId} to customer with id ${id}`,
      );

      await this.addProductToFavoritesUseCase.execute({
        customerId: id,
        productId,
      });

      this.logger.log(
        CustomerController.name,
        `Product with id ${productId} added to customer with id ${id}`,
      );
    } catch (error) {
      this.logger.error(
        CustomerController.name,
        `Error adding product with id ${productId} to customer with id ${id}: ${error?.message}`,
        error?.stack,
      );

      throw error;
    }
  }
}
