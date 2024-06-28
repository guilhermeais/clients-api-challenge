import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ProductsServiceGateway } from '@/domain/application/gateways/external/products-service.interface';
import { CustomerRepository } from '@/domain/application/gateways/repositories/customer-repository.interface';
import { DatabaseModule } from '@/infra/database/database.module';
import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { FakeProductsServiceGateway } from 'test/mocks/domain/application/fateways/external/products-service.mock';
import { makeCustomer } from 'test/mocks/domain/enterprise/entities/customer.mock';
import { makeProduct } from 'test/mocks/domain/enterprise/entities/product.mock';
import { makeFakeApp } from 'test/utils/make-fake-app';
import { DefaultExceptionFilter } from '../filters/default-exception-filter.filter';
import { CustomerController } from './customer.controller';
import { CustomerHttpResponse } from './presenters/customer.presenter';
import { TCreateCustomerSchema } from './schemas/create-customer.schema';
import { TListCustomersResponse } from './schemas/list-customers.schema';

describe(`${CustomerController.name} E2E`, () => {
  let app: INestApplication;
  let customerRepository: CustomerRepository;
  let productsServiceGateway: FakeProductsServiceGateway;

  beforeAll(async () => {
    const moduleRef = await makeFakeApp({
      imports: [DatabaseModule],
    }).compile();

    app = moduleRef.createNestApplication();

    app.useGlobalFilters(new DefaultExceptionFilter());

    customerRepository = moduleRef.get(CustomerRepository);
    productsServiceGateway = moduleRef.get(ProductsServiceGateway);

    await app.init();
  });

  beforeEach(() => {
    productsServiceGateway.products.clear();
  });

  describe('[GET] /customers', () => {
    it('should get empty customers if there is no customer', async () => {
      const response = await request(app.getHttpServer()).get('/customers');

      expect(response.status).toBe(200);
      const responseBody = response.body as TListCustomersResponse;

      expect(responseBody).toEqual<TListCustomersResponse>({
        items: [],
        limit: 10,
        pages: 0,
        currentPage: 1,
        total: 0,
      });
    });

    it('should get customers with pagination', async () => {
      const customers = Array.from({ length: 10 }, () => makeCustomer());
      await Promise.all(
        customers.map((customer) => customerRepository.save(customer)),
      );

      const response = await request(app.getHttpServer()).get(
        '/customers?limit=5',
      );

      expect(response.status).toBe(200);
      const responseBody = response.body as TListCustomersResponse;

      expect(responseBody.items).toHaveLength(5);
      expect(responseBody.total).toBe(10);
      expect(responseBody.pages).toBe(2);
      expect(responseBody.currentPage).toBe(1);

      const secondPage = await request(app.getHttpServer()).get(
        '/customers?page=2&limit=5',
      );

      expect(secondPage.status).toBe(200);
      const secondPageBody = secondPage.body as TListCustomersResponse;

      expect(secondPageBody.items).toHaveLength(5);
      expect(secondPageBody.total).toBe(10);
      expect(secondPageBody.pages).toBe(2);
      expect(secondPageBody.currentPage).toBe(2);
    });

    it('should get customers by email', async () => {
      const customers = Array.from({ length: 10 }, () => makeCustomer());
      await Promise.all(
        customers.map((customer) => customerRepository.save(customer)),
      );

      const customerToFind = customers[5];

      const response = await request(app.getHttpServer()).get(
        `/customers?email=${customerToFind.email.value}`,
      );

      expect(response.status).toBe(200);
      const responseBody = response.body as TListCustomersResponse;

      expect(responseBody.items).toHaveLength(1);
      expect(responseBody.items[0].id).toBe(customerToFind.id.toString());
    });

    it('should get customers by name', async () => {
      const customers = Array.from({ length: 10 }, () => makeCustomer());
      await Promise.all(
        customers.map((customer) => customerRepository.save(customer)),
      );

      const customerToFind = customers[5];

      const response = await request(app.getHttpServer()).get(
        `/customers?name=${customerToFind.name}`,
      );

      expect(response.status).toBe(200);
      const responseBody = response.body as TListCustomersResponse;

      expect(responseBody.items).toHaveLength(1);
      expect(responseBody.items[0].id).toBe(customerToFind.id.toString());
    });
  });

  describe('[GET] /customers/:id', () => {
    it('should get 404 if the customer does not exists', async () => {
      const id = new UniqueEntityID().toString();
      const response = await request(app.getHttpServer()).get(
        `/customers/${id}`,
      );

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        details: `A entidade Cliente - ${id} não foi encontrada`,
        error: 'EntityNotFoundError',
        message: ['Recurso não encontrado!'],
        statusCode: 404,
      });
    });

    it('should get an existing customer', async () => {
      const customer = makeCustomer();
      await customerRepository.save(customer);

      const response = await request(app.getHttpServer()).get(
        `/customers/${customer.id.toString()}`,
      );

      expect(response.status).toBe(200);
      const responseBody = response.body as CustomerHttpResponse;

      expect(responseBody.id).toBe(customer.id.toString());
      expect(responseBody.name).toBe(customer.name);
      expect(responseBody.email).toBe(customer.email.value);
    });
  });

  describe('[POST] /customers', () => {
    function makeCreateCustomerBodyRequest(
      modifications?: Partial<TCreateCustomerSchema>,
    ): TCreateCustomerSchema {
      return {
        email: faker.internet.email(),
        name: faker.person.fullName(),
        ...modifications,
      };
    }

    it('should create an customer', async () => {
      const bodyRequest = makeCreateCustomerBodyRequest();

      const response = await request(app.getHttpServer())
        .post('/customers')
        .send(bodyRequest);

      expect(response.status).toBe(201);
      const body = response.body as CustomerHttpResponse;

      expect(body.id).toBeDefined();
      expect(body.name).toBe(body.name);
      expect(body.email).toBe(body.email);
      expect(body.createdAt).toBeDefined();

      const customerOnRepository = await customerRepository.findById(
        new UniqueEntityID(body.id),
      );

      expect(customerOnRepository).toBeDefined();
    });

    it('should not create an customer with invalid email', async () => {
      const bodyRequest = makeCreateCustomerBodyRequest({
        email: 'invalid-email',
      });

      const response = await request(app.getHttpServer())
        .post('/customers')
        .send(bodyRequest);

      expect(response.status).toBe(400);

      expect(response.body).toEqual({
        error: 'BadRequestException',
        message: [
          'E-mail do cliente deve estar no formato válido (mail@mail.com)!',
        ],
        statusCode: 400,
      });
    });

    it('should not create an customer without a name', async () => {
      const bodyRequest = makeCreateCustomerBodyRequest({
        name: null,
      });

      const response = await request(app.getHttpServer())
        .post('/customers')
        .send(bodyRequest);

      expect(response.status).toBe(400);

      expect(response.body).toEqual({
        error: 'BadRequestException',
        message: ['Nome do cliente é obrigatório!'],
        statusCode: 400,
      });
    });

    it('should not create a customer with email in use', async () => {
      const existingCustomer = makeCustomer();
      await customerRepository.save(existingCustomer);

      const bodyRequest = makeCreateCustomerBodyRequest({
        email: existingCustomer.email.value,
      });

      const response = await request(app.getHttpServer())
        .post('/customers')
        .send(bodyRequest);

      expect(response.status).toBe(409);
      expect(response.body).toEqual({
        error: 'CustomerAlreadyExistsError',
        message: [
          `Já existe um cliente usando o email ${existingCustomer.email.value}!`,
        ],
        details: '',
        statusCode: 409,
      });
    });
  });

  describe('[PATCH] /customers/:id', () => {
    it('should update an customer name', async () => {
      const customer = makeCustomer();
      await customerRepository.save(customer);

      const newName = faker.person.fullName();

      const response = await request(app.getHttpServer())
        .patch(`/customers/${customer.id.toString()}`)
        .send({
          name: newName,
        });

      expect(response.status).toBe(204);

      const customerUpdated = await customerRepository.findById(customer.id);

      expect(customerUpdated.name).toBe(newName);
    });

    it('should update an customer name', async () => {
      const customer = makeCustomer();
      await customerRepository.save(customer);

      const newEmail = faker.internet.email();

      const response = await request(app.getHttpServer())
        .patch(`/customers/${customer.id.toString()}`)
        .send({
          email: newEmail,
        });

      expect(response.status).toBe(204);

      const customerUpdated = await customerRepository.findById(customer.id);

      expect(customerUpdated.email.value).toBe(newEmail);
    });
  });

  describe('[DELETE] /customers/:id', () => {
    it('should delete an existing customer', async () => {
      const customer = makeCustomer();
      await customerRepository.save(customer);

      const response = await request(app.getHttpServer()).delete(
        `/customers/${customer.id.toString()}`,
      );

      expect(response.status).toBe(204);

      const customerDeleted = await customerRepository.findById(customer.id);

      expect(customerDeleted).toBeNull();
    });

    it('should return 404 if the customer does not exists', async () => {
      const id = new UniqueEntityID().toString();
      const response = await request(app.getHttpServer()).delete(
        `/customers/${id}`,
      );

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        details: `A entidade Cliente - ${id} não foi encontrada`,
        error: 'EntityNotFoundError',
        message: ['Recurso não encontrado!'],
        statusCode: 404,
      });
    });
  });

  describe('[POST] /customers/:id/favorites', () => {
    it('should favorite an product', async () => {
      const product = makeProduct();
      productsServiceGateway.products.set(product.id.toString(), product);

      const customer = makeCustomer();
      await customerRepository.save(customer);

      const response = await request(app.getHttpServer())
        .post(`/customers/${customer.id.toString()}/favorites`)
        .send({
          productId: product.id.toString(),
        });

      expect(response.status).toBe(204);

      const { items: customerFavoriteProducts } =
        await customerRepository.listFavoriteProducts({
          customerId: customer.id,
          limit: 1,
          page: 1,
        });

      expect(customerFavoriteProducts).toHaveLength(1);
      expect(customerFavoriteProducts[0].id).toEqual(product.id);
      expect(customerFavoriteProducts[0].title).toBe(product.title);
      expect(customerFavoriteProducts[0].image).toBe(product.image);
      expect(customerFavoriteProducts[0].price).toBe(product.price);
    });

    it('should favorite two products', async () => {
      const products = Array.from({ length: 2 }, (_, i) => {
        const product = makeProduct({
          title: i.toString(),
        });
        productsServiceGateway.products.set(product.id.toString(), product);

        return product;
      });

      const customer = makeCustomer();
      await customerRepository.save(customer);

      await Promise.all(
        products.map(
          async (product) =>
            await request(app.getHttpServer())
              .post(`/customers/${customer.id.toString()}/favorites`)
              .send({
                productId: product.id.toString(),
              }),
        ),
      );

      const { items: customerFavoriteProducts } =
        await customerRepository.listFavoriteProducts({
          customerId: customer.id,
          limit: 1000,
          page: 1,
        });

      expect(customerFavoriteProducts).toHaveLength(2);
      expect(customerFavoriteProducts.map((p) => p.id)).toEqual(
        products.map((p) => p.id),
      );
    });

    it.only('should return 404 if try to favorite an product that does not exists', async () => {
      const customer = makeCustomer();
      await customerRepository.save(customer);
      const productId = new UniqueEntityID().toString();

      const response = await request(app.getHttpServer())
        .post(`/customers/${customer.id.toString()}/favorites`)
        .send({
          productId,
        });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        details: `A entidade Produto - ${productId.toString()} não foi encontrada`,
        error: 'EntityNotFoundError',
        message: ['Recurso não encontrado!'],
        statusCode: 404,
      });
    });

    it('should not favorite the same product twice', async () => {
      const product = makeProduct();
      productsServiceGateway.products.set(product.id.toString(), product);

      const customer = makeCustomer();
      await customerRepository.save(customer);

      await Promise.all(
        Array.from({ length: 50 }, () =>
          request(app.getHttpServer())
            .post(`/customers/${customer.id.toString()}/favorites`)
            .send({
              productId: product.id.toString(),
            }),
        ),
      );

      const { items: customerFavoriteProducts } =
        await customerRepository.listFavoriteProducts({
          customerId: customer.id,
          limit: 1000,
          page: 1,
        });

      expect(customerFavoriteProducts).toHaveLength(1);
      expect(customerFavoriteProducts[0].id).toEqual(product.id);
    });
  });

  describe('[GET] /customers/:id/favorites', () => {
    it('should get empty list if the customer does not have favorite products', async () => {
      const customer = makeCustomer();
      await customerRepository.save(customer);

      const response = await request(app.getHttpServer()).get(
        `/customers/${customer.id.toString()}/favorites`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        items: [],
        total: 0,
        limit: 10,
        pages: 0,
        currentPage: 1,
      });
    });

    it('should get customer favorite products paginated', async () => {
      const customer = makeCustomer();
      await customerRepository.save(customer);

      const products = Array.from({ length: 10 }, (_, i) => {
        const product = makeProduct({
          title: i.toString(),
        });
        productsServiceGateway.products.set(product.id.toString(), product);

        return product;
      });

      await Promise.all(
        products.map(
          async (product) =>
            await request(app.getHttpServer())
              .post(`/customers/${customer.id.toString()}/favorites`)
              .send({
                productId: product.id.toString(),
              }),
        ),
      );

      const response = await request(app.getHttpServer()).get(
        `/customers/${customer.id.toString()}/favorites?limit=5`,
      );

      expect(response.status).toBe(200);
      const responseBody = response.body as TListCustomersResponse;

      expect(responseBody.items).toHaveLength(5);
      expect(responseBody.items.map((p) => p.id)).toEqual(
        products.slice(0, 5).map((p) => p.id.toString()),
      );
      expect(responseBody.total).toBe(10);
      expect(responseBody.pages).toBe(2);
      expect(responseBody.currentPage).toBe(1);

      const secondPage = await request(app.getHttpServer()).get(
        `/customers/${customer.id.toString()}/favorites?page=2&limit=5`,
      );

      expect(secondPage.status).toBe(200);
      const secondPageBody = secondPage.body as TListCustomersResponse;

      expect(secondPageBody.items).toHaveLength(5);
      expect(secondPageBody.total).toBe(10);
      expect(secondPageBody.pages).toBe(2);
      expect(secondPageBody.currentPage).toBe(2);
    });

    it('should get 404 if the customer does not exists', async () => {
      const id = new UniqueEntityID().toString();
      const response = await request(app.getHttpServer()).get(
        `/customers/${id}/favorites`,
      );

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        details: `A entidade Cliente - ${id} não foi encontrada`,
        error: 'EntityNotFoundError',
        message: ['Recurso não encontrado!'],
        statusCode: 404,
      });
    });
  });
});
