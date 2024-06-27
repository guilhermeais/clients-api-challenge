import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { EntityNotFoundError } from '@/core/errors/commom/entity-not-found-error';
import { PaginatedRequest, PaginatedResponse } from '@/core/types/pagination';
import { UseCase } from '@/core/types/use-case';
import { Product } from '@/domain/enterprise/entities/product';
import { Injectable } from '@nestjs/common';
import { CustomerRepository } from '../gateways/repositories/customer-repository.interface';
import { Logger } from '../gateways/tools/logger.interface';

export type ListCustomerFavoriteProductsRequest = PaginatedRequest<{
  customerId: string;
}>;

export type ListCustomerFavoriteProductsResponse = PaginatedResponse<Product>;

@Injectable()
export class ListCustomerFavoriteProductsUseCase
  implements
    UseCase<
      ListCustomerFavoriteProductsRequest,
      ListCustomerFavoriteProductsResponse
    >
{
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly logger: Logger,
  ) {}

  async execute(
    request: ListCustomerFavoriteProductsRequest,
  ): Promise<ListCustomerFavoriteProductsResponse> {
    const { customerId, ...requestWithoutCustomerId } = request;
    try {
      this.logger.log(
        ListCustomerFavoriteProductsUseCase.name,
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
        ListCustomerFavoriteProductsUseCase.name,
        `Found ${response.total} favorite products for customer ${customerId}`,
      );

      return response;
    } catch (error) {
      this.logger.error(
        ListCustomerFavoriteProductsUseCase.name,
        `Failed to get customer favorite products for customer ${customerId}: ${error.message}`,
        error.stack,
      );

      throw error;
    }
  }
}
