import { PaginatedResponse } from '@/core/types/pagination';
import { z } from 'zod';
import { CustomerHttpResponse } from '../presenters/customer.presenter';

export const ListCustomersSchema = z.object({
  page: z
    .number({
      coerce: true,
    })
    .int()
    .positive()
    .default(1),
  limit: z
    .number({
      coerce: true,
    })
    .int()
    .positive()
    .default(10),
  name: z.string().optional(),
  email: z.string().email().optional(),
});

export type TListCustomersSchema = z.infer<typeof ListCustomersSchema>;

export type TListCustomersResponse = PaginatedResponse<CustomerHttpResponse>;
