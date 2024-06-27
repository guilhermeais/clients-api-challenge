import { Entity, Timestamp } from '@/core/entities/entity';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Email } from './value-objects/email';
import { Product } from './product';
import { ProductAlreadyFavoritedError } from './errors/product-already-favorited-error';

export type CustomerProps = {
  name: string;
  email: Email;
};

export class Customer extends Entity<CustomerProps> {
  #newFavoritedProducts: Product[] = [];

  favoriteProduct(...products: Product[]) {
    products.forEach((product) => {
      const productAlreadyFavorited = this.#newFavoritedProducts.some(
        (favoritedProduct) => favoritedProduct.id.equals(product.id),
      );

      if (productAlreadyFavorited) {
        throw new ProductAlreadyFavoritedError({
          id: product.id.toString(),
          title: product.title,
        });
      }

      this.#newFavoritedProducts.push(product);
    });
  }

  consumeNewFavoritedProducts() {
    const favoritedProducts = this.#newFavoritedProducts;
    this.#newFavoritedProducts = [];

    return favoritedProducts;
  }

  get name(): string {
    return this.props.name;
  }

  set name(name: string) {
    this.props.name = name;
  }

  get email(): Email {
    return this.props.email;
  }

  set email(email: Email) {
    this.props.email = email;
  }

  public static create(props: CustomerProps, timestamp?: Timestamp) {
    return new Customer(props, undefined, timestamp);
  }

  public static restore(
    props: CustomerProps,
    id: UniqueEntityID,
    timestamp?: Timestamp,
  ) {
    return new Customer(props, id, timestamp);
  }
}
