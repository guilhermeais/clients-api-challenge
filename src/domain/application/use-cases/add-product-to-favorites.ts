import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { EntityNotFoundError } from '@/core/errors/commom/entity-not-found-error';
import { UseCase } from '@/core/types/use-case';
import { Injectable } from '@nestjs/common';
import { ProductsServiceGateway } from '../gateways/external/products-service.interface';
import { CustomerRepository } from '../gateways/repositories/customer-repository.interface';
import { Logger } from '../gateways/tools/logger.interface';

export type AddProductToFavoritesRequest = {
  customerId: string;
  productId: string;
};

export type AddProductToFavoritesResponse = void;

@Injectable()
export class AddProductToFavoritesUseCase
  implements
    UseCase<AddProductToFavoritesRequest, AddProductToFavoritesResponse>
{
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly productsServiceGateway: ProductsServiceGateway,
    private readonly logger: Logger,
  ) {}

  async execute(
    request: AddProductToFavoritesRequest,
  ): Promise<AddProductToFavoritesResponse> {
    const { customerId, productId } = request;
    try {
      this.logger.log(
        AddProductToFavoritesUseCase.name,
        `Adding product ${productId} to customer ${customerId} favorites`,
      );

      const customerEntityId = new UniqueEntityID(customerId);
      const customer = await this.customerRepository.findById(customerEntityId);

      if (!customer) {
        throw new EntityNotFoundError('Cliente', customerId);
      }

      const product = await this.productsServiceGateway.findById(productId);

      if (!product) {
        throw new EntityNotFoundError('Produto', productId);
      }

      customer.favoriteProduct(product);

      await this.customerRepository.save(customer);

      this.logger.log(
        AddProductToFavoritesUseCase.name,
        `Product ${productId} added to customer ${customerId} favorites`,
      );
    } catch (error) {
      this.logger.error(
        AddProductToFavoritesUseCase.name,
        `Error adding product ${productId} to customer ${customerId} favorites: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
