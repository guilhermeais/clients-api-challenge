import { Logger } from '@/domain/application/gateways/tools/logger.interface';
import { CreateCustomerUseCase } from '@/domain/application/use-cases/create-customer';
import { Body, Controller, Post } from '@nestjs/common';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import {
  CustomerHttpResponse,
  CustomerPresenter,
} from './presenters/customer.presenter';
import {
  CreateCustomerSchema,
  TCreateCustomerSchema,
} from './schemas/create-customer.schema';

@Controller('customers')
export class CustomerController {
  constructor(
    private readonly createCustomerUseCase: CreateCustomerUseCase,
    private readonly logger: Logger,
  ) {}

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
}
