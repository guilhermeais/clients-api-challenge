import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { EntityNotFoundError } from '@/core/errors/commom/entity-not-found-error';
import { faker } from '@faker-js/faker';
import { MockProxy, mock } from 'vitest-mock-extended';
import { CustomerRepository } from '../gateways/repositories/customer-repository.interface';
import { Logger } from '../gateways/tools/logger.interface';
import {
  ListCustomerFavoriteProductsRequest,
  ListCustomerFavoriteProductsUseCase,
} from './list-customer-favorite-products';

describe(`${ListCustomerFavoriteProductsUseCase.name}`, () => {
  let sut: ListCustomerFavoriteProductsUseCase;
  let customerRepository: MockProxy<CustomerRepository>;
  let logger: MockProxy<Logger>;

  let defaultCustomerFavoriteProducts: Awaited<
    ReturnType<typeof customerRepository.listFavoriteProducts>
  >;

  beforeEach(() => {
    customerRepository = mock();
    logger = mock();

    customerRepository.exists.mockResolvedValue(true);

    defaultCustomerFavoriteProducts = {
      currentPage: 1,
      items: [],
      limit: 10,
      pages: 1,
      total: 0,
    };

    customerRepository.listFavoriteProducts.mockResolvedValue(
      defaultCustomerFavoriteProducts,
    );

    sut = new ListCustomerFavoriteProductsUseCase(customerRepository, logger);
  });

  function makeListCustomerFavoriteProductsRequest(
    modifications?: Partial<ListCustomerFavoriteProductsRequest>,
  ): ListCustomerFavoriteProductsRequest {
    return {
      customerId: faker.string.uuid(),
      limit: 10,
      page: 1,
      ...modifications,
    };
  }

  it('should return empty list if the customer does not have favorite products', async () => {
    const request = makeListCustomerFavoriteProductsRequest();

    const response = await sut.execute(request);

    expect(response).toEqual(defaultCustomerFavoriteProducts);

    expect(customerRepository.listFavoriteProducts).toHaveBeenCalledWith({
      ...request,
      customerId: new UniqueEntityID(request.customerId),
    });
  });

  it('should throw if the customer does not exists', async () => {
    customerRepository.exists.mockResolvedValue(false);

    const request = makeListCustomerFavoriteProductsRequest();

    await expect(sut.execute(request)).rejects.toThrowError(
      new EntityNotFoundError('Cliente', request.customerId),
    );
  });
});
