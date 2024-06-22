import { MockProxy, mock } from 'vitest-mock-extended';
import {
  DeleteCustomerRequest,
  DeleteCustomerUseCase,
} from './delete-customer';
import { CustomerRepository } from '../gateways/repositories/customer-repository.interface';
import { Logger } from '../gateways/tools/logger.interface';
import { faker } from '@faker-js/faker';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { EntityNotFoundError } from '@/core/errors/commom/entity-not-found-error';

describe(`${DeleteCustomerUseCase.name}`, () => {
  let sut: DeleteCustomerUseCase;
  let customerRepo: MockProxy<CustomerRepository>;
  let logger: MockProxy<Logger>;

  beforeEach(() => {
    customerRepo = mock();
    logger = mock();

    customerRepo.exists.mockResolvedValue(true);
    customerRepo.delete.mockResolvedValue();

    sut = new DeleteCustomerUseCase(customerRepo, logger);
  });

  function makeDeleteCustomerRequest(
    modifications?: Partial<DeleteCustomerRequest>,
  ): DeleteCustomerRequest {
    return {
      id: faker.string.uuid(),
      ...modifications,
    };
  }

  it('should delete an existing customer', async () => {
    const request = makeDeleteCustomerRequest();

    await sut.execute(request);

    const entityId = new UniqueEntityID(request.id);

    expect(customerRepo.exists).toHaveBeenCalledWith(entityId);
    expect(customerRepo.delete).toHaveBeenCalledWith(entityId);
  });

  it('should throw if the customer does not exists', async () => {
    const request = makeDeleteCustomerRequest();
    customerRepo.exists.mockResolvedValue(false);

    await expect(sut.execute(request)).rejects.toThrowError(
      new EntityNotFoundError('Cliente', request.id),
    );
  });
});
