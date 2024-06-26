import { UseCase } from '@/core/types/use-case';
import { Customer } from '@/domain/enterprise/entities/customer';
import { CustomerRepository } from '../gateways/repositories/customer-repository.interface';
import { Logger } from '../gateways/tools/logger.interface';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { EntityNotFoundError } from '@/core/errors/commom/entity-not-found-error';
import { Email } from '@/domain/enterprise/entities/value-objects/email';
import { CustomerAlreadyExistsError } from './errors/customer-already-exists';
import { Injectable } from '@nestjs/common';

export type UpdateCustomerRequest = {
  id: string;
  name: string;
  email: string;
};

export type UpdateCustomerResponse = Customer;

@Injectable()
export class UpdateCustomerUseCase
  implements UseCase<UpdateCustomerRequest, UpdateCustomerResponse>
{
  constructor(
    private readonly customerRepo: CustomerRepository,
    private readonly logger: Logger,
  ) {}

  async execute(request: UpdateCustomerRequest): Promise<Customer> {
    try {
      this.logger.log(
        UpdateCustomerUseCase.name,
        `Updating customer ${request.id} with name ${request.name} and email ${request.email}`,
      );
      const { id, email, ...restOfData } = request;
      const entityId = new UniqueEntityID(id);

      const customer = await this.customerRepo.findById(entityId);

      if (!customer) {
        throw new EntityNotFoundError('Cliente', id);
      }

      if (email) {
        const newEmail = Email.create(email);

        const exists = await this.customerRepo.existsByEmail(newEmail);

        if (exists) {
          throw new CustomerAlreadyExistsError(newEmail.value);
        }

        customer.email = newEmail;
      }

      Object.assign(customer, restOfData);

      await this.customerRepo.save(customer);

      this.logger.log(
        UpdateCustomerUseCase.name,
        `Customer ${request.id} updated with name ${request.name} and email ${request.email}`,
      );

      return customer;
    } catch (error) {
      this.logger.error(
        UpdateCustomerUseCase.name,
        `Error updating customer ${request.id} with name ${request.name} and email ${request.email}: ${error.message}`,
        error.stack,
      );

      throw error;
    }
  }
}
