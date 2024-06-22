import { Customer, CustomerProps } from '@/domain/enterprise/entities/customer';
import { Email } from '@/domain/enterprise/entities/value-objects/email';
import { faker } from '@faker-js/faker';

export function makeCustomer(
  modifications: Partial<CustomerProps> = {},
): Customer {
  return Customer.create({
    email: Email.create(faker.internet.email()),
    name: faker.person.firstName(),
    ...modifications,
  });
}
