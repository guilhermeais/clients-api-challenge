import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Repository } from '@/core/types/repository';
import { Customer } from '@/domain/enterprise/entities/customer';
import { Email } from '@/domain/enterprise/entities/value-objects/email';

export abstract class CustomerRepository implements Repository<Customer> {
  abstract save(entity: Customer): Promise<void>;
  abstract existsByEmail(email: Email): Promise<boolean>;
  abstract exists(id: UniqueEntityID): Promise<boolean>;
  abstract findById(id: UniqueEntityID): Promise<Customer>;
  abstract delete(id: UniqueEntityID): Promise<void>;
}
