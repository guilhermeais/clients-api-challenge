import { Repository } from '@/core/types/repository';
import { Customer } from '@/domain/enterprise/entities/customer';

export abstract class CustomerRepository implements Repository<Customer> {
  abstract save(entity: Customer): Promise<void>;
}
