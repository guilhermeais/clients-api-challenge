import { CustomerRepository } from '@/domain/application/gateways/repositories/customer-repository.interface';
import { INestApplication } from '@nestjs/common';
import { makeCustomer } from 'test/mocks/domain/enterprise/entities/customer.mock';
import { makeFakeApp } from 'test/utils/make-fake-app';
import { DatabaseModule } from '../../database.module';
import { MongoDbCustomerRepository } from './mongodb-customer-repository';
import { MongoServerError } from 'mongodb';

describe(`${MongoDbCustomerRepository.name}`, () => {
  let app: INestApplication;
  let sut: MongoDbCustomerRepository;

  beforeAll(async () => {
    const module = await makeFakeApp({
      imports: [DatabaseModule],
    }).compile();

    app = module.createNestApplication();

    sut = module.get(CustomerRepository);

    await app.init();
  });

  describe('save()', () => {
    it('should save an customer', async () => {
      const customer = makeCustomer();

      await sut.save(customer);

      const customerSaved = await sut.findById(customer.id);

      expect(customerSaved).toEqual(customer);
    });

    it('should not save a customer with duplicated email', async () => {
      const firstCustomer = makeCustomer();
      const secondCustomer = makeCustomer({
        email: firstCustomer.email,
      });

      await sut.save(firstCustomer);

      await expect(sut.save(secondCustomer)).rejects.toThrowError(
        new MongoServerError({
          message: `E11000 duplicate key error collection: test.customers index: email_1 dup key: { : "${firstCustomer.email.value}" }`,
        }),
      );
    });
  });

  describe('findById()', () => {
    it('should find a customer by id', async () => {
      const customer = makeCustomer();

      await sut.save(customer);

      const customerFound = await sut.findById(customer.id);

      expect(customerFound).toEqual(customer);
    });

    it('should return null if customer is not found', async () => {
      const customer = makeCustomer();

      const customerFound = await sut.findById(customer.id);

      expect(customerFound).toBeNull();
    });
  });
});
