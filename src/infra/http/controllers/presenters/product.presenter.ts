import { Product } from '@/domain/enterprise/entities/product';

export type ProductHttpResponse = {
  id: string;
  title: string;
  image: string;
  price: number;
};

export class ProductPresenter {
  static toHTTP(product: Product): ProductHttpResponse {
    return {
      id: product.id.toString(),
      title: product.title,
      image: product.image,
      price: product.price,
    };
  }
}
