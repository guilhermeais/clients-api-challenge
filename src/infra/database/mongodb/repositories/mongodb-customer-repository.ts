import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { PaginatedRequest, PaginatedResponse } from '@/core/types/pagination';
import { CustomerRepository } from '@/domain/application/gateways/repositories/customer-repository.interface';
import { Logger } from '@/domain/application/gateways/tools/logger.interface';
import { Customer } from '@/domain/enterprise/entities/customer';
import { Email } from '@/domain/enterprise/entities/value-objects/email';
import { Inject, Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { MONGO_DB_CONNECTION } from '../mongodb-connection';

@Injectable()
export class MongoDbCustomerRepository implements CustomerRepository {
  constructor(
    @Inject(MONGO_DB_CONNECTION)
    private readonly connection: MongoClient,
    private readonly logger: Logger,
  ) {}

  async save(customer: Customer): Promise<void> {
    try {
      this.logger.log(
        MongoDbCustomerRepository.name,
        `Saving customer ${customer.name} - ${customer.email.value}...`,
      );

      const customerCollection = this.connection.db().collection('customers');

      await customerCollection.insertOne({
        _id: customer.id.toValue(),
        name: customer.name,
        email: customer.email.value,
        createdAt: customer.createdAt,
      });

      this.logger.log(
        MongoDbCustomerRepository.name,
        `Customer ${customer.id.toString()} - ${customer.name} saved successfully`,
      );
    } catch (error) {
      this.logger.error(
        MongoDbCustomerRepository.name,
        `Error saving customer ${JSON.stringify(customer, null, 2)}: ${error.message}`,
        error.stack,
      );

      throw error;
    }
  }

  async findById(id: UniqueEntityID): Promise<Customer> {
    try {
      this.logger.log(
        MongoDbCustomerRepository.name,
        `Finding customer ${id.toString()}...`,
      );

      const customerCollection = this.connection.db().collection('customers');

      const customer = await customerCollection.findOne({
        _id: id.toValue(),
      });

      if (!customer) {
        this.logger.warn(
          MongoDbCustomerRepository.name,
          `Customer ${id.toString()} not found`,
        );

        return null;
      }

      this.logger.log(
        MongoDbCustomerRepository.name,
        `Customer ${id.toString()} found successfully`,
      );

      return Customer.restore(
        {
          name: customer.name,
          email: Email.create(customer.email),
        },
        id,
        {
          createdAt: customer.createdAt,
          updatedAt: customer.updatedAt,
        },
      );
    } catch (error) {
      this.logger.error(
        MongoDbCustomerRepository.name,
        `Error finding customer ${id.toString()}`,
        error.stack,
      );

      throw error;
    }
  }

  existsByEmail(email: Email): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  exists(id: UniqueEntityID): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  delete(id: UniqueEntityID): Promise<void> {
    throw new Error('Method not implemented.');
  }
  list(
    request: PaginatedRequest<Partial<{ name: string; email?: Email }>>,
  ): Promise<PaginatedResponse<Customer>> {
    throw new Error('Method not implemented.');
  }
}
