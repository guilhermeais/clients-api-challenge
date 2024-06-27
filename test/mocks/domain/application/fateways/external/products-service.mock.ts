import { ProductsServiceGateway } from '@/domain/application/gateways/external/products-service.interface';
import { Product } from '@/domain/enterprise/entities/product';

export class FakeProductsServiceGateway implements ProductsServiceGateway {
  products: Map<string, Product> = new Map();

  async findById(id: string): Promise<Product> {
    return this.products.get(id);
  }
}
