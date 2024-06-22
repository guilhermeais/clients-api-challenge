import { EntityNotFoundError } from '@/core/errors/commom/entity-not-found-error';
import { Customer } from '@/domain/enterprise/entities/customer';
import { Product } from '@/domain/enterprise/entities/product';
import { makeCustomer } from 'test/mocks/domain/enterprise/entities/customer.mock';
import { makeProduct } from 'test/mocks/domain/enterprise/entities/product.mock';
import { MockProxy, mock } from 'vitest-mock-extended';
import { ProductsServiceGateway } from '../gateways/external/products-service.interface';
import { CustomerFavoriteProductsRepository } from '../gateways/repositories/customer-favorite-products.repository';
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
  let customerFavoriteProductsRepository: MockProxy<CustomerFavoriteProductsRepository>;
  let logger: MockProxy<Logger>;

  let defaultProduct: Product;
  let defaultCustomer: Customer;

  beforeEach(() => {
    customerRepository = mock();
    productsServiceGateway = mock();
    customerFavoriteProductsRepository = mock();
    logger = mock();

    defaultProduct = makeProduct();
    defaultCustomer = makeCustomer();

    customerRepository.exists.mockResolvedValue(true);
    productsServiceGateway.findById.mockResolvedValue(defaultProduct);

    sut = new AddProductToFavorites(
      customerRepository,
      productsServiceGateway,
      customerFavoriteProductsRepository,
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

    expect(customerFavoriteProductsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        customerId: defaultCustomer.id,
        product: defaultProduct,
      }),
    );
  });

  it('should throw if the customer does not exists', async () => {
    customerRepository.exists.mockResolvedValue(false);

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
