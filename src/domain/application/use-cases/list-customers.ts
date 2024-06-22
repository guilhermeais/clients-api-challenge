import { PaginatedRequest, PaginatedResponse } from '@/core/types/pagination';
import { UseCase } from '@/core/types/use-case';
import { Customer } from '@/domain/enterprise/entities/customer';
import { CustomerRepository } from '../gateways/repositories/customer-repository.interface';
import { Logger } from '../gateways/tools/logger.interface';
import { Email } from '@/domain/enterprise/entities/value-objects/email';

export type ListCustomersRequest = PaginatedRequest<
  Partial<{
    name: string;
    email: string;
  }>
>;

export type ListCustomersResponse = PaginatedResponse<Customer>;

export class ListCustomersUseCase
  implements UseCase<ListCustomersRequest, ListCustomersResponse>
{
  constructor(
    private readonly customerRepo: CustomerRepository,
    private readonly logger: Logger,
  ) {}

  async execute(request: ListCustomersRequest): Promise<ListCustomersResponse> {
    try {
      this.logger.log(
        ListCustomersUseCase.name,
        `Listing customers with request: ${JSON.stringify(request, null, 2)}`,
      );

      const response = await this.customerRepo.list({
        ...request,
        email: request.email && Email.create(request.email),
        name: request.name,
      });

      this.logger.log(
        ListCustomersUseCase.name,
        `Found a total of ${response.total} customers...`,
      );

      return response;
    } catch (error) {
      this.logger.error(
        ListCustomersUseCase.name,
        `Error on listing customers with ${JSON.stringify(request, null, 2)}: ${error.message}`,
        error.stack,
      );

      throw error;
    }
  }
}
