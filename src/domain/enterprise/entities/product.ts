import { Entity } from '@/core/entities/entity';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';

export type ProductProps = {
  title: string;
  price: number;
  image: string;
};

export class Product extends Entity<ProductProps> {
  public static restore(props: ProductProps, id: UniqueEntityID): Product {
    return new Product(props, id);
  }

  get title(): string {
    return this.props.title;
  }

  get price(): number {
    return this.props.price;
  }

  get image(): string {
    return this.props.image;
  }
}
