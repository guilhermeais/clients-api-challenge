import { CustomerRepository } from '@/domain/application/gateways/repositories/customer-repository.interface';
import { DatabaseModule } from '@/infra/database/database.module';
import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { makeFakeApp } from 'test/utils/make-fake-app';
import { DefaultExceptionFilter } from '../filters/default-exception-filter.filter';
import { CustomerController } from './customer.controller';
import { TCreateCustomerSchema } from './schemas/create-customer.schema';
import { CustomerHttpResponse } from './presenters/customer.presenter';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { makeCustomer } from 'test/mocks/domain/enterprise/entities/customer.mock';

describe(`${CustomerController.name} E2E`, () => {
  let app: INestApplication;
  let customerRepository: CustomerRepository;

  beforeAll(async () => {
    const moduleRef = await makeFakeApp({
      imports: [DatabaseModule],
    }).compile();

    app = moduleRef.createNestApplication();

    app.useGlobalFilters(new DefaultExceptionFilter());

    customerRepository = moduleRef.get(CustomerRepository);

    await app.init();
  });

  describe('POST /customers', () => {
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
});
