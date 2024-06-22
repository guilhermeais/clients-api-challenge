import { UseCase } from '@/core/types/use-case';
import { CustomerRepository } from '../gateways/repositories/customer-repository.interface';
import { Logger } from '../gateways/tools/logger.interface';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { EntityNotFoundError } from '@/core/errors/commom/entity-not-found-error';
import { ProductsServiceGateway } from '../gateways/external/products-service.interface';
import { CustomerFavoriteProduct } from '@/domain/enterprise/entities/customer-favorite-product';
import { CustomerFavoriteProductsRepository } from '../gateways/repositories/customer-favorite-products.repository';

export type AddProductToFavoritesRequest = {
  customerId: string;
  productId: string;
};

export type AddProductToFavoritesResponse = void;

export class AddProductToFavorites
  implements
    UseCase<AddProductToFavoritesRequest, AddProductToFavoritesResponse>
{
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly productsServiceGateway: ProductsServiceGateway,
    private readonly customerFavoriteProductsRepository: CustomerFavoriteProductsRepository,
    private readonly logger: Logger,
  ) {}

  async execute(
    request: AddProductToFavoritesRequest,
  ): Promise<AddProductToFavoritesResponse> {
    const { customerId, productId } = request;
    try {
      this.logger.log(
        AddProductToFavorites.name,
        `Adding product ${productId} to customer ${customerId} favorites`,
      );

      const customerEntityId = new UniqueEntityID(customerId);
      const customerExists =
        await this.customerRepository.exists(customerEntityId);

      if (!customerExists) {
        throw new EntityNotFoundError('Cliente', customerId);
      }

      const product = await this.productsServiceGateway.findById(productId);

      if (!product) {
        throw new EntityNotFoundError('Produto', productId);
      }

      const customerFavoriteProduct = CustomerFavoriteProduct.create({
        customerId: customerEntityId,
        product,
      });

      await this.customerFavoriteProductsRepository.save(
        customerFavoriteProduct,
      );

      this.logger.log(
        AddProductToFavorites.name,
        `Product ${productId} added to customer ${customerId} favorites`,
      );
    } catch (error) {
      this.logger.error(
        AddProductToFavorites.name,
        `Error adding product ${productId} to customer ${customerId} favorites: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
