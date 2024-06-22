import { Entity } from '@/core/entities/entity';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Product } from './product';

export type CustomerFavoriteProductProps = {
  customerId: UniqueEntityID;
  product: Product;
};

export class CustomerFavoriteProduct extends Entity<CustomerFavoriteProductProps> {
  constructor(props: CustomerFavoriteProductProps) {
    super(props);
  }
  get customerId(): UniqueEntityID {
    return this.props.customerId;
  }

  get product(): Product {
    return this.props.product;
  }
}
