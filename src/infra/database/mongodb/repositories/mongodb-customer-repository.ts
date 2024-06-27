import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { PaginatedRequest, PaginatedResponse } from '@/core/types/pagination';
import { CustomerRepository } from '@/domain/application/gateways/repositories/customer-repository.interface';
import { Logger } from '@/domain/application/gateways/tools/logger.interface';
import { Customer } from '@/domain/enterprise/entities/customer';
import { Product } from '@/domain/enterprise/entities/product';
import { Email } from '@/domain/enterprise/entities/value-objects/email';
import { Inject, Injectable } from '@nestjs/common';
import { Collection, MongoClient } from 'mongodb';
import { MONGO_DB_CONNECTION } from '../mongodb-connection';

export type ProductDocument = {
  _id: string;
  title: string;
  price: number;
  image: string;
};

export type CustomerDocument = {
  _id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  favoriteProducts?: ProductDocument[];
};
@Injectable()
export class MongoDbCustomerRepository implements CustomerRepository {
  #customerCollection: Collection<CustomerDocument>;
  constructor(
    @Inject(MONGO_DB_CONNECTION)
    private readonly connection: MongoClient,
    private readonly logger: Logger,
  ) {
    this.#customerCollection = this.connection.db().collection('customers');
  }

  async save(customer: Customer): Promise<void> {
    try {
      this.logger.log(
        MongoDbCustomerRepository.name,
        `Saving customer ${customer.name} - ${customer.email.value}...`,
      );

      await this.#customerCollection.updateOne(
        {
          _id: customer.id.toValue(),
        },
        {
          $set: {
            _id: customer.id.toValue(),
            name: customer.name,
            email: customer.email.value,
            createdAt: customer.createdAt,
            updatedAt: new Date(),
          },
          $addToSet: {
            favoriteProducts: {
              $each: customer.consumeNewFavoritedProducts().map((product) => ({
                _id: product.id.toValue(),
                title: product.title,
                price: product.price,
                image: product.image,
                createdAt: product.createdAt,
              })),
            },
          },
        },
        {
          upsert: true,
        },
      );

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

      const customer = await this.#customerCollection.findOne(
        {
          _id: id.toValue(),
        },
        {
          projection: {
            _id: 1,
            name: 1,
            email: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
      );

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

  async existsByEmail(email: Email): Promise<boolean> {
    try {
      this.logger.log(
        MongoDbCustomerRepository.name,
        `Checking if customer with email ${email.value} exists...`,
      );

      const customer = await this.#customerCollection.findOne({
        email: email.value,
      });

      if (!customer) {
        this.logger.warn(
          MongoDbCustomerRepository.name,
          `Customer with email ${email.value} not found`,
        );

        return false;
      }

      this.logger.log(
        MongoDbCustomerRepository.name,
        `Customer with email ${email.value} found`,
      );

      return true;
    } catch (error) {
      this.logger.error(
        MongoDbCustomerRepository.name,
        `Error checking if customer with email ${email.value} exists: ${error.message}`,
        error.stack,
      );

      throw error;
    }
  }

  async exists(id: UniqueEntityID): Promise<boolean> {
    try {
      this.logger.log(
        MongoDbCustomerRepository.name,
        `Checking if customer ${id.toString()} exists...`,
      );

      const customer = await this.#customerCollection.findOne({
        _id: id.toValue(),
      });

      if (!customer) {
        this.logger.warn(
          MongoDbCustomerRepository.name,
          `Customer ${id.toString()} not found`,
        );

        return false;
      }

      this.logger.log(
        MongoDbCustomerRepository.name,
        `Customer ${id.toString()} found`,
      );

      return true;
    } catch (error) {
      this.logger.error(
        MongoDbCustomerRepository.name,
        `Error checking if customer ${id.toString()} exists: ${error.message}`,
        error.stack,
      );

      throw error;
    }
  }

  async delete(id: UniqueEntityID): Promise<void> {
    try {
      this.logger.log(
        MongoDbCustomerRepository.name,
        `Deleting customer ${id.toString()}...`,
      );

      await this.#customerCollection.deleteOne({
        _id: id.toValue(),
      });

      this.logger.log(
        MongoDbCustomerRepository.name,
        `Customer ${id.toString()} deleted successfully`,
      );
    } catch (error) {
      this.logger.error(
        MongoDbCustomerRepository.name,
        `Error deleting customer ${id.toString()}: ${error.message}`,
        error.stack,
      );

      throw error;
    }
  }

  async list(
    request: PaginatedRequest<Partial<{ name: string; email?: Email }>>,
  ): Promise<PaginatedResponse<Customer>> {
    try {
      this.logger.log(
        MongoDbCustomerRepository.name,
        `Listing customers with ${JSON.stringify(request, null, 2)}...`,
      );

      const { email, name, limit, page } = request;

      const [result] = await this.#customerCollection
        .aggregate<{
          metadata: { total: number };
          items: CustomerDocument[];
        }>([
          {
            $project: {
              _id: 1,
              name: 1,
              email: 1,
              createdAt: 1,
              updatedAt: 1,
            },
          },
          {
            $match: {
              ...(email && { email: email.value }),
              ...(name && { name: { $regex: name, $options: 'i' } }),
            },
          },
          { $sort: { _id: 1 } },
          {
            $facet: {
              metadata: [
                {
                  $count: 'total',
                },
              ],
              items: [
                {
                  $skip: limit * (page - 1),
                },
                {
                  $limit: limit,
                },
              ],
            },
          },
          {
            $project: {
              metadata: {
                $arrayElemAt: ['$metadata', 0],
              },
              items: 1,
            },
          },
        ])
        .toArray();

      const { metadata, items } = result;

      this.logger.log(
        MongoDbCustomerRepository.name,
        `Customers listed a total of ${metadata?.total} successfully`,
      );

      const pages = Math.ceil((metadata?.total || 0) / limit);

      return {
        currentPage: page,
        items: items.map((item) =>
          Customer.restore(
            {
              name: item.name,
              email: Email.create(item.email),
            },
            new UniqueEntityID(item._id),
            {
              createdAt: item.createdAt,
              updatedAt: item.updatedAt,
            },
          ),
        ),
        limit,
        total: metadata?.total || 0,
        pages,
      };
    } catch (error) {
      this.logger.error(
        MongoDbCustomerRepository.name,
        `Error listing customers with ${JSON.stringify(request, null, 2)}: ${error.message}`,
        error.stack,
      );

      throw error;
    }
  }

  async listFavoriteProducts(
    request: PaginatedRequest<{ customerId: UniqueEntityID }>,
  ): Promise<PaginatedResponse<Product>> {
    try {
      this.logger.log(
        MongoDbCustomerRepository.name,
        `Listing favorite products of customer ${request.customerId.toString()}...`,
      );

      const { customerId, limit, page } = request;

      const [result] = await this.#customerCollection
        .aggregate<{
          metadata: { total: number };
          items: ProductDocument[];
        }>([
          {
            $match: {
              _id: customerId.toValue(),
            },
          },
          {
            $project: {
              favoriteProducts: 1,
            },
          },
          {
            $unwind: '$favoriteProducts',
          },
          {
            $project: {
              _id: '$favoriteProducts._id',
              title: '$favoriteProducts.title',
              price: '$favoriteProducts.price',
              image: '$favoriteProducts.image',
              createdAt: '$favoriteProducts.createdAt',
            },
          },
          { $sort: { title: 1 } },
          {
            $facet: {
              metadata: [
                {
                  $count: 'total',
                },
              ],
              items: [
                {
                  $skip: limit * (page - 1),
                },
                {
                  $limit: limit,
                },
              ],
            },
          },
          {
            $project: {
              metadata: {
                $arrayElemAt: ['$metadata', 0],
              },
              items: 1,
            },
          },
        ])
        .toArray();

      const { metadata, items } = result;

      this.logger.log(
        MongoDbCustomerRepository.name,
        `Favorite products of customer ${request.customerId.toString()} listed a total of ${metadata?.total} favorite products successfully`,
      );

      const pages = Math.ceil((metadata?.total || 0) / limit);

      return {
        currentPage: page,
        items: items.map((item) =>
          Product.restore(
            {
              title: item.title,
              price: item.price,
              image: item.image,
            },
            new UniqueEntityID(item._id),
          ),
        ),
        limit,
        total: metadata?.total || 0,
        pages,
      };
    } catch (error) {
      this.logger.error(
        MongoDbCustomerRepository.name,
        `Error listing favorite products of customer ${request.customerId.toString()}: ${error.message}`,
        error.stack,
      );

      throw error;
    }
  }
}
