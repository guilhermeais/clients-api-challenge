import { Customer } from '@/domain/enterprise/entities/customer';
import { CustomerRepository } from '../gateways/repositories/customer-repository.interface';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { EntityNotFoundError } from '@/core/errors/commom/entity-not-found-error';
import { Logger } from '../gateways/tools/logger.interface';
import { Injectable } from '@nestjs/common';

export type GetCustomerByIdRequest = {
  id: string;
};

export type GetCustomerByIdResponse = Customer;

@Injectable()
export class GetCustomerByIdUseCase {
  constructor(
    private readonly customerRepo: CustomerRepository,
    private readonly logger: Logger,
  ) {}

  async execute(
    request: GetCustomerByIdRequest,
  ): Promise<GetCustomerByIdResponse> {
    try {
      this.logger.log(
        GetCustomerByIdUseCase.name,
        `Getting customer with id: ${request.id}`,
      );

      const entityId = new UniqueEntityID(request.id);

      const customer = await this.customerRepo.findById(entityId);

      if (!customer) {
        this.logger.error(
          GetCustomerByIdUseCase.name,
          `Customer with id: ${request.id} not found`,
        );

        throw new EntityNotFoundError('Cliente', request.id);
      }

      this.logger.log(
        GetCustomerByIdUseCase.name,
        `Customer with id: ${request.id} found successfully`,
      );

      return customer;
    } catch (error) {
      this.logger.error(
        GetCustomerByIdUseCase.name,
        `Error on getting customer with id: ${request.id}: ${error.message}`,
        error.stack,
      );

      throw error;
    }
  }
}
