import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { EntityNotFoundError } from '@/core/errors/commom/entity-not-found-error';
import { PaginatedRequest, PaginatedResponse } from '@/core/types/pagination';
import { UseCase } from '@/core/types/use-case';
import { Product } from '@/domain/enterprise/entities/product';
import { CustomerRepository } from '../gateways/repositories/customer-repository.interface';
import { Logger } from '../gateways/tools/logger.interface';

export type GetCustomerFavoriteProductsRequest = PaginatedRequest<{
  customerId: string;
}>;

export type GetCustomerFavoriteProductsResponse = PaginatedResponse<Product>;

export class GetCustomerFavoriteProductsUseCase
  implements
    UseCase<
      GetCustomerFavoriteProductsRequest,
      GetCustomerFavoriteProductsResponse
    >
{
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly logger: Logger,
  ) {}

  async execute(
    request: GetCustomerFavoriteProductsRequest,
  ): Promise<GetCustomerFavoriteProductsResponse> {
    const { customerId, ...requestWithoutCustomerId } = request;
    try {
      this.logger.log(
        GetCustomerFavoriteProductsUseCase.name,
        `Getting customer favorite products for customer ${customerId}`,
      );

      const customerEntityId = new UniqueEntityID(customerId);

      const customerExists =
        await this.customerRepository.exists(customerEntityId);

      if (!customerExists) {
        throw new EntityNotFoundError('Cliente', customerId);
      }

      const response = await this.customerRepository.listFavoriteProducts({
        ...requestWithoutCustomerId,
        customerId: customerEntityId,
      });

      this.logger.log(
        GetCustomerFavoriteProductsUseCase.name,
        `Found ${response.total} favorite products for customer ${customerId}`,
      );

      return response;
    } catch (error) {
      this.logger.error(
        GetCustomerFavoriteProductsUseCase.name,
        `Failed to get customer favorite products for customer ${customerId}: ${error.message}`,
        error.stack,
      );

      throw error;
    }
  }
}
