import { Entity } from '@/core/entities/entity';

export type ProductProps = {
  title: string;
  price: number;
  image: string;
};

export class Product extends Entity<ProductProps> {
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
