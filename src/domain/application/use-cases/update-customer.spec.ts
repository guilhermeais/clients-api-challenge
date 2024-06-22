import { MockProxy, mock } from 'vitest-mock-extended';
import { CustomerRepository } from '../gateways/repositories/customer-repository.interface';
import { Logger } from '../gateways/tools/logger.interface';
import {
  UpdateCustomerRequest,
  UpdateCustomerUseCase,
} from './update-customer';
import { makeCustomer } from 'test/mocks/domain/enterprise/entities/customer.mock';
import { Customer } from '@/domain/enterprise/entities/customer';
import { faker } from '@faker-js/faker';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { EntityNotFoundError } from '@/core/errors/commom/entity-not-found-error';
import { CustomerAlreadyExistsError } from './errors/customer-already-exists';
import { InvalidEmailFormatError } from '@/domain/enterprise/entities/value-objects/errors/invalid-email-format-error';

describe(`${UpdateCustomerUseCase.name}`, () => {
  let sut: UpdateCustomerUseCase;
  let customerRepo: MockProxy<CustomerRepository>;
  let logger: MockProxy<Logger>;

  let defaultCustomer: Customer;

  beforeEach(() => {
    customerRepo = mock();
    logger = mock();

    defaultCustomer = makeCustomer();
    customerRepo.findById.mockResolvedValue(defaultCustomer);
    customerRepo.existsByEmail.mockResolvedValue(false);
    customerRepo.save.mockResolvedValue();

    sut = new UpdateCustomerUseCase(customerRepo, logger);
  });

  function makeUpdateCustomerRequest(
    modifications?: Partial<UpdateCustomerRequest>,
  ): UpdateCustomerRequest {
    return {
      email: faker.internet.email(),
      id: defaultCustomer.id.toString(),
      name: faker.person.fullName(),
      ...modifications,
    };
  }

  it('should update and existing customer', async () => {
    const request = makeUpdateCustomerRequest();

    const updatedCustomer = await sut.execute(request);

    expect(updatedCustomer).toBeDefined();
    expect(updatedCustomer.name).toBe(request.name);
    expect(updatedCustomer.email.value).toBe(request.email);
    expect(updatedCustomer.id).toBe(defaultCustomer.id);

    expect(customerRepo.findById).toHaveBeenCalledWith(
      new UniqueEntityID(request.id),
    );
    expect(customerRepo.existsByEmail).toHaveBeenCalledWith(
      updatedCustomer.email,
    );

    expect(customerRepo.save).toHaveBeenCalledWith(updatedCustomer);
  });

  it('should throw an error if the customer does not exists', async () => {
    customerRepo.findById.mockResolvedValue(null);

    const request = makeUpdateCustomerRequest();

    await expect(sut.execute(request)).rejects.toThrowError(
      new EntityNotFoundError('Cliente', request.id),
    );
  });

  it('should throw if tries to update the email with an email already in use by other customer', async () => {
    customerRepo.existsByEmail.mockResolvedValue(true);

    const request = makeUpdateCustomerRequest();

    await expect(sut.execute(request)).rejects.toThrowError(
      new CustomerAlreadyExistsError(request.email),
    );
  });

  it('should throw if tries to update with an invalid email', async () => {
    const request = makeUpdateCustomerRequest({ email: 'invalidemail' });

    await expect(sut.execute(request)).rejects.toThrowError(
      new InvalidEmailFormatError('invalidemail'),
    );
  });

  it('should handle a request with invalid data', async () => {
    const request: any = {
      ...makeUpdateCustomerRequest(),
      invalidProp: 'invalidprop',
    };

    const customer = await sut.execute(request);

    expect(customerRepo.save).toHaveBeenCalledWith(customer);
  });
});
