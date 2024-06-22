import { Product } from '@/domain/enterprise/entities/product';

export abstract class ProductsServiceGateway {
  abstract findById(id: string): Promise<Product>;
}
