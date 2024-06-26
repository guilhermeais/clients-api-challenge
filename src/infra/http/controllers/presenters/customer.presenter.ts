import { Customer } from '@/domain/enterprise/entities/customer';

export type CustomerHttpResponse = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt?: Date;
};

export class CustomerPresenter {
  static toHTTP(customer: Customer): CustomerHttpResponse {
    return {
      id: customer.id.toString(),
      name: customer.name,
      email: customer.email.value,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };
  }
}
