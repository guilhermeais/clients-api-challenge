import { EntityNotFoundError } from '@/core/errors/commom/entity-not-found-error';
import { Customer } from '@/domain/enterprise/entities/customer';
import { Product } from '@/domain/enterprise/entities/product';
import { makeCustomer } from 'test/mocks/domain/enterprise/entities/customer.mock';
import { makeProduct } from 'test/mocks/domain/enterprise/entities/product.mock';
import { MockProxy, mock } from 'vitest-mock-extended';
import { ProductsServiceGateway } from '../gateways/external/products-service.interface';
import { CustomerRepository } from '../gateways/repositories/customer-repository.interface';
import { Logger } from '../gateways/tools/logger.interface';
import {
  AddProductToFavorites,
  AddProductToFavoritesRequest,
} from './add-product-to-favorites';

describe(`${AddProductToFavorites.name}`, () => {
  let sut: AddProductToFavorites;
  let customerRepository: MockProxy<CustomerRepository>;
  let productsServiceGateway: MockProxy<ProductsServiceGateway>;
  let logger: MockProxy<Logger>;

  let defaultProduct: Product;
  let defaultCustomer: Customer;

  beforeEach(() => {
    customerRepository = mock();
    productsServiceGateway = mock();
    logger = mock();

    defaultProduct = makeProduct();
    defaultCustomer = makeCustomer();

    customerRepository.findById.mockResolvedValue(defaultCustomer);
    productsServiceGateway.findById.mockResolvedValue(defaultProduct);

    sut = new AddProductToFavorites(
      customerRepository,
      productsServiceGateway,
      logger,
    );
  });

  function makeAddProductToFavoritesRequest(
    modifications?: Partial<AddProductToFavoritesRequest>,
  ): AddProductToFavoritesRequest {
    return {
      customerId: defaultCustomer.id.toString(),
      productId: defaultProduct.id.toString(),
      ...modifications,
    };
  }

  it('should add product to favorites', async () => {
    const request = makeAddProductToFavoritesRequest();

    await sut.execute(request);

    expect(customerRepository.save).toHaveBeenCalledWith(defaultCustomer);
  });

  it('should throw if the customer does not exists', async () => {
    customerRepository.findById.mockResolvedValue(null);

    const request = makeAddProductToFavoritesRequest();

    await expect(sut.execute(request)).rejects.toThrow(
      new EntityNotFoundError('Cliente', request.customerId),
    );
  });

  it('should throw if the product does not exits', async () => {
    productsServiceGateway.findById.mockResolvedValue(null);

    const request = makeAddProductToFavoritesRequest();

    await expect(sut.execute(request)).rejects.toThrow(
      new EntityNotFoundError('Produto', request.productId),
    );
  });
});
