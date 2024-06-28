import { CustomerRepository } from '@/domain/application/gateways/repositories/customer-repository.interface';
import { Email } from '@/domain/enterprise/entities/value-objects/email';
import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { Collection, MongoClient, MongoServerError } from 'mongodb';
import { makeCustomer } from 'test/mocks/domain/enterprise/entities/customer.mock';
import { makeFakeApp } from 'test/utils/make-fake-app';
import { DatabaseModule } from '../../database.module';
import {
  CustomerDocument,
  MongoDbCustomerRepository,
} from './mongodb-customer-repository';
import { makeProduct } from 'test/mocks/domain/enterprise/entities/product.mock';
import { MONGO_DB_CONNECTION } from '../mongodb-connection';

describe(`${MongoDbCustomerRepository.name}`, () => {
  let app: INestApplication;
  let sut: MongoDbCustomerRepository;
  let connection: MongoClient;
  let collection: Collection<CustomerDocument>;

  beforeAll(async () => {
    const module = await makeFakeApp({
      imports: [DatabaseModule],
    }).compile();

    app = module.createNestApplication();

    sut = module.get(CustomerRepository);
    connection = module.get(MONGO_DB_CONNECTION);

    collection = connection.db().collection('customers');

    await app.init();
  });

  beforeEach(() => {
    vi.useFakeTimers();
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

    it('should add new favorite products to the customer', async () => {
      const customer = makeCustomer();

      await sut.save(customer);

      const product = makeProduct();

      customer.favoriteProduct(product);

      await sut.save(customer);

      const customerDocument = await collection.findOne({
        _id: customer.id.toValue(),
      });

      expect(customerDocument.favoriteProducts).toEqual([
        {
          _id: product.id.toValue(),
          title: product.title,
          price: product.price,
          image: product.image,
        },
      ]);

      const newProduct = makeProduct();
      customer.favoriteProduct(newProduct);

      await sut.save(customer);

      const customerDocumentUpdated = await collection.findOne({
        _id: customer.id.toValue(),
      });

      expect(customerDocumentUpdated.favoriteProducts).toEqual([
        {
          _id: product.id.toValue(),
          title: product.title,
          price: product.price,
          image: product.image,
        },
        {
          _id: newProduct.id.toValue(),
          title: newProduct.title,
          price: newProduct.price,
          image: newProduct.image,
        },
      ]);
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

  describe('listFavoriteProducts()', () => {
    it('should return empty if the customer does not have favorite products', async () => {
      const customer = makeCustomer();

      await sut.save(customer);

      const result = await sut.listFavoriteProducts({
        limit: 10,
        page: 1,
        customerId: customer.id,
      });

      expect(result.items).toEqual([]);
      expect(result.pages).toEqual(0);
      expect(result.currentPage).toEqual(1);
      expect(result.total).toEqual(0);
    });

    it('should paginate the customer favorite products', async () => {
      vi.useRealTimers();
      const customer = makeCustomer();

      await sut.save(customer);

      const products = Array.from({ length: 10 }).map((_, i) => {
        const product = makeProduct({
          title: `${i}`,
        });

        return product;
      });

      customer.favoriteProduct(...products);

      await sut.save(customer);

      const result = await sut.listFavoriteProducts({
        limit: 5,
        page: 1,
        customerId: customer.id,
      });

      expect(result.items.map((p) => p.id)).toEqual(
        products.slice(0, 5).map((p) => p.id),
      );
      expect(result.pages).toEqual(2);
      expect(result.currentPage).toEqual(1);
      expect(result.total).toEqual(10);

      const secondPage = await sut.listFavoriteProducts({
        limit: 5,
        page: 2,
        customerId: customer.id,
      });

      expect(secondPage.items.map((p) => p.id)).toEqual(
        products.slice(5, 10).map((p) => p.id),
      );
      expect(secondPage.pages).toEqual(2);
      expect(secondPage.currentPage).toEqual(2);
      expect(secondPage.total).toEqual(products.length);
    });

    it('should return empty if the customer does not exists', async () => {
      const result = await sut.listFavoriteProducts({
        limit: 10,
        page: 1,
        customerId: makeCustomer().id,
      });

      expect(result.items).toEqual([]);
      expect(result.pages).toEqual(0);
      expect(result.currentPage).toEqual(1);
      expect(result.total).toEqual(0);
    });
  });
});
