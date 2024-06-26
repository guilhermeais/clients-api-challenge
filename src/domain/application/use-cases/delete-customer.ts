import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { EntityNotFoundError } from '@/core/errors/commom/entity-not-found-error';
import { UseCase } from '@/core/types/use-case';
import { Injectable } from '@nestjs/common';
import { CustomerRepository } from '../gateways/repositories/customer-repository.interface';
import { Logger } from '../gateways/tools/logger.interface';

export type DeleteCustomerRequest = {
  id: string;
};

export type DeleteCustomerResponse = void;

@Injectable()
export class DeleteCustomerUseCase
  implements UseCase<DeleteCustomerRequest, DeleteCustomerResponse>
{
  constructor(
    private readonly customerRepo: CustomerRepository,
    private readonly logger: Logger,
  ) {}

  async execute(
    request: DeleteCustomerRequest,
  ): Promise<DeleteCustomerResponse> {
    try {
      this.logger.log(
        DeleteCustomerUseCase.name,
        `Deleting customer with id: ${request.id}`,
      );

      const entityId = new UniqueEntityID(request.id);

      const exists = await this.customerRepo.exists(entityId);

      if (!exists) {
        this.logger.error(
          DeleteCustomerUseCase.name,
          `Customer with id: ${request.id} not found`,
        );

        throw new EntityNotFoundError('Cliente', request.id);
      }

      await this.customerRepo.delete(entityId);

      this.logger.log(
        DeleteCustomerUseCase.name,
        `Customer with id: ${request.id} deleted successfully`,
      );
    } catch (error) {
      this.logger.error(
        DeleteCustomerUseCase.name,
        `Error on deleting customer with id: ${request.id}: ${error.message}`,
        error.stack,
      );

      throw error;
    }
  }
}
