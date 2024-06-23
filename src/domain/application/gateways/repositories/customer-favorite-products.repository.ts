import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { PaginatedRequest, PaginatedResponse } from '@/core/types/pagination';
import { Repository } from '@/core/types/repository';
import { CustomerFavoriteProduct } from '@/domain/enterprise/entities/customer-favorite-product';

export abstract class CustomerFavoriteProductsRepository
  implements Repository<CustomerFavoriteProduct>
{
  abstract save(entity: CustomerFavoriteProduct): Promise<void>;
  abstract list(
    request: PaginatedRequest<{ customerId: UniqueEntityID }>,
  ): Promise<PaginatedResponse<CustomerFavoriteProduct>>;
}
