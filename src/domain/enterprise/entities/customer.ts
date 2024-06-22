import { Entity, Timestamp } from '@/core/entities/entity';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Email } from './value-objects/email';

export type CustomerProps = {
  name: string;
  email: Email;
};

export class Customer extends Entity<CustomerProps> {
  get name(): string {
    return this.props.name;
  }

  get email(): Email {
    return this.props.email;
  }

  public static create(
    props: CustomerProps,
    id?: UniqueEntityID,
    timestamp?: Timestamp,
  ) {
    return new Customer(props, id, timestamp);
  }
}
