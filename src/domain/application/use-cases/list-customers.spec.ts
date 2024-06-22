import { MockProxy, mock } from 'vitest-mock-extended';
import { CustomerRepository } from '../gateways/repositories/customer-repository.interface';
import { ListCustomersRequest, ListCustomersUseCase } from './list-customers';
import { Logger } from '../gateways/tools/logger.interface';
import { Customer } from '@/domain/enterprise/entities/customer';
import { PaginatedResponse } from '@/core/types/pagination';
import { makeCustomer } from 'test/mocks/domain/enterprise/entities/customer.mock';
import { faker } from '@faker-js/faker';
import { Email } from '@/domain/enterprise/entities/value-objects/email';
import { InvalidEmailFormatError } from '@/domain/enterprise/entities/value-objects/errors/invalid-email-format-error';

describe(`${ListCustomersUseCase.name}`, () => {
  let sut: ListCustomersUseCase;
  let customerRepo: MockProxy<CustomerRepository>;
  let logger: MockProxy<Logger>;

  let defaultCustomerList: PaginatedResponse<Customer>;
  beforeEach(() => {
    defaultCustomerList = {
      total: 1,
      currentPage: 1,
      items: [makeCustomer()],
      limit: 10,
      pages: 1,
    };

    customerRepo = mock();
    logger = mock();

    customerRepo.list.mockResolvedValue(defaultCustomerList);

    sut = new ListCustomersUseCase(customerRepo, logger);
  });

  function makeListCustomersRequest(
    modifications?: Partial<ListCustomersRequest>,
  ): ListCustomersRequest {
    return {
      limit: defaultCustomerList.limit,
      page: defaultCustomerList.currentPage,
      email: faker.internet.email(),
      name: faker.person.fullName(),
      ...modifications,
    };
  }

  it('should list the customers', async () => {
    const request = makeListCustomersRequest();

    const response = await sut.execute(request);

    expect(customerRepo.list).toHaveBeenCalledWith({
      ...request,
      email: Email.restore(request.email),
      name: request.name,
    });

    expect(response).toEqual(defaultCustomerList);
  });

  it('should throw if the email is invalid', async () => {
    const request = makeListCustomersRequest({ email: 'invalid-email' });

    await expect(sut.execute(request)).rejects.toThrowError(
      new InvalidEmailFormatError('invalid-email'),
    );
  });
});
