import { Repository } from '@/core/types/repository';
import { CustomerFavoriteProduct } from '@/domain/enterprise/entities/customer-favorite-product';

export abstract class CustomerFavoriteProductsRepository
  implements Repository<CustomerFavoriteProduct>
{
  abstract save(entity: CustomerFavoriteProduct): Promise<void>;
}
