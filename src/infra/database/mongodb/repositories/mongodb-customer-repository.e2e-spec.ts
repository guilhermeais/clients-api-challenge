import { CustomerRepository } from '@/domain/application/gateways/repositories/customer-repository.interface';
import { Email } from '@/domain/enterprise/entities/value-objects/email';
import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { MongoServerError } from 'mongodb';
import { makeCustomer } from 'test/mocks/domain/enterprise/entities/customer.mock';
import { makeFakeApp } from 'test/utils/make-fake-app';
import { DatabaseModule } from '../../database.module';
import { MongoDbCustomerRepository } from './mongodb-customer-repository';

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

    it('should update an existing customer', async () => {
      const customer = makeCustomer();

      await sut.save(customer);
      customer.name = `${customer.name} updated`;

      await sut.save(customer);

      const customerUpdated = await sut.findById(customer.id);

      expect(customerUpdated).toEqual(customer);
      expect(customerUpdated.name).toEqual(customer.name);
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

  describe('existsByEmail()', () => {
    it('should find a customer by email', async () => {
      const customer = makeCustomer();

      await sut.save(customer);

      const exists = await sut.existsByEmail(customer.email);

      expect(exists).toEqual(true);
    });

    it('should return null if customer is not found', async () => {
      const exists = await sut.existsByEmail(
        Email.create(faker.internet.email()),
      );

      expect(exists).toEqual(false);
    });
  });

  describe('exists()', () => {
    it('should find a customer by id', async () => {
      const customer = makeCustomer();

      await sut.save(customer);

      const exists = await sut.exists(customer.id);

      expect(exists).toEqual(true);
    });

    it('should return null if customer is not found', async () => {
      const exists = await sut.exists(makeCustomer().id);

      expect(exists).toEqual(false);
    });
  });

  describe('delete()', () => {
    it('should delete a document', async () => {
      const customer = makeCustomer();

      await sut.save(customer);

      const exists = await sut.exists(customer.id);

      expect(exists).toEqual(true);

      await sut.delete(customer.id);

      const customerFound = await sut.findById(customer.id);

      expect(customerFound).toBeNull();
    });

    it('should do nothing if the document does not exists', async () => {
      await sut.delete(makeCustomer().id);
    });
  });

  describe('list()', () => {
    it('should return empty if there is no customers', async () => {
      const customers = await sut.list({
        limit: 10,
        page: 1,
      });

      expect(customers.items).toEqual([]);
      expect(customers.pages).toEqual(0);
    });

    it('should paginated existing customers', async () => {
      const costumers = await Promise.all(
        Array.from({ length: 10 }).map(async () => {
          const customer = makeCustomer();
          await sut.save(customer);

          return customer;
        }),
      );

      const customers = await sut.list({
        limit: 5,
        page: 1,
      });

      expect(customers.items).toEqual(costumers.slice(0, 5));
      expect(customers.pages).toEqual(2);
      expect(customers.total).toEqual(10);

      const secondPage = await sut.list({
        limit: 5,
        page: 2,
      });

      expect(secondPage.items).toEqual(costumers.slice(5, 10));
      expect(secondPage.pages).toEqual(2);
      expect(secondPage.total).toEqual(10);
    });
  });
});
