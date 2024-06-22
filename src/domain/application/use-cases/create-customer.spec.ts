import { CustomerRepository } from '../gateways/repositories/customer-repository.interface';
import { Logger } from '../gateways/tools/logger.interface';
import {
  CreateCustomerRequest,
  CreateCustomerUseCase,
} from './create-customer';
import { MockProxy, mock } from 'vitest-mock-extended';
import { faker } from '@faker-js/faker';
import { InvalidEmailFormatError } from '@/domain/enterprise/entities/value-objects/errors/invalid-email-format-error';

function makeCreateCustomerRequest(
  modifications?: Partial<CreateCustomerRequest>,
): CreateCustomerRequest {
  return {
    email: faker.internet.email(),
    name: faker.person.fullName(),
    ...modifications,
  };
}

describe(`${CreateCustomerUseCase.name}`, () => {
  let sut: CreateCustomerUseCase;
  let customerRepo: MockProxy<CustomerRepository>;
  let logger: MockProxy<Logger>;

  beforeEach(() => {
    customerRepo = mock();
    logger = mock();

    sut = new CreateCustomerUseCase(customerRepo, logger);
  });

  it('should create a customer', async () => {
    const request = makeCreateCustomerRequest();

    const createdCustomer = await sut.execute(request);

    expect(createdCustomer).toBeDefined();
    expect(createdCustomer.name).toBe(request.name);
    expect(createdCustomer.email.value).toBe(request.email);
    expect(createdCustomer.id).toBeDefined();

    expect(customerRepo.save).toHaveBeenCalledWith(createdCustomer);
  });

  it('should not create a customer with invalid email', async () => {
    const invalidEmail = 'abobrinha';

    const request = makeCreateCustomerRequest({ email: invalidEmail });

    await expect(sut.execute(request)).rejects.toThrowError(
      new InvalidEmailFormatError(invalidEmail),
    );

    expect(customerRepo.save).not.toHaveBeenCalled();
  });
});
