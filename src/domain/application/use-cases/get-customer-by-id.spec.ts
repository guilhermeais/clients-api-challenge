import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { EntityNotFoundError } from '@/core/errors/commom/entity-not-found-error';
import { Customer } from '@/domain/enterprise/entities/customer';
import { makeCustomer } from 'test/mocks/domain/enterprise/entities/customer.mock';
import { MockProxy, mock } from 'vitest-mock-extended';
import { CustomerRepository } from '../gateways/repositories/customer-repository.interface';
import { Logger } from '../gateways/tools/logger.interface';
import {
  GetCustomerByIdRequest,
  GetCustomerByIdUseCase,
} from './get-customer-by-id';

describe(`${GetCustomerByIdUseCase.name}`, () => {
  let sut: GetCustomerByIdUseCase;
  let customerRepo: MockProxy<CustomerRepository>;
  let logger: MockProxy<Logger>;
  let defaultCustomer: Customer;

  beforeEach(() => {
    defaultCustomer = makeCustomer();

    customerRepo = mock();
    logger = mock();

    customerRepo.findById.mockResolvedValue(defaultCustomer);

    sut = new GetCustomerByIdUseCase(customerRepo, logger);
  });

  function makeGetCustomerByIdRequest(
    modifications?: Partial<GetCustomerByIdRequest>,
  ): GetCustomerByIdRequest {
    return {
      id: defaultCustomer.id.toString(),
      ...modifications,
    };
  }

  it('should get an existing customer', async () => {
    const request = makeGetCustomerByIdRequest();

    const response = await sut.execute(request);

    const entityId = new UniqueEntityID(request.id);

    expect(customerRepo.findById).toHaveBeenCalledWith(entityId);
    expect(response).toEqual(defaultCustomer);
  });

  it('should throw if the customer does not exists', async () => {
    const request = makeGetCustomerByIdRequest();
    customerRepo.findById.mockResolvedValue(null);

    await expect(sut.execute(request)).rejects.toThrowError(
      new EntityNotFoundError('Cliente', request.id),
    );
  });
});
