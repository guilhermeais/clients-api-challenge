import { UseCase } from '@/core/types/use-case';
import { Customer } from '@/domain/enterprise/entities/customer';
import { Email } from '@/domain/enterprise/entities/value-objects/email';
import { CustomerRepository } from '../gateways/repositories/customer-repository.interface';
import { Logger } from '../gateways/tools/logger.interface';

export type CreateCustomerRequest = {
  name: string;
  email: string;
};

export type CreateCustomerResponse = Customer;

export class CreateCustomerUseCase
  implements UseCase<CreateCustomerRequest, CreateCustomerResponse>
{
  constructor(
    private readonly customerRepo: CustomerRepository,
    private readonly logger: Logger,
  ) {}

  async execute(request: CreateCustomerRequest): Promise<Customer> {
    try {
      this.logger.log(
        CreateCustomerUseCase.name,
        `Creating customer ${request.name} - ${request.email}`,
      );

      const email = Email.create(request.email);
      const customer = Customer.create({
        name: request.name,
        email,
      });

      await this.customerRepo.save(customer);

      this.logger.log(
        CreateCustomerUseCase.name,
        `Customer ${request.name} - ${request.email} created with id ${customer.id.toString()}`,
      );

      return customer;
    } catch (error) {
      this.logger.error(
        CreateCustomerUseCase.name,
        `Error creating customer ${request.name} - ${request.email}: ${error.message}`,
        error.stack,
      );

      throw error;
    }
  }
}
