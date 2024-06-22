import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Product, ProductProps } from '@/domain/enterprise/entities/product';
import { faker } from '@faker-js/faker';

export function makeProduct(modifications?: Partial<ProductProps>): Product {
  return Product.restore(
    {
      image: faker.image.url(),
      price: Number(faker.commerce.price()),
      title: faker.commerce.productName(),
      ...modifications,
    },
    new UniqueEntityID(),
  );
}
