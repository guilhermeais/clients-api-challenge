import { PaginatedResponse } from '@/core/types/pagination';
import { z } from 'zod';
import { ProductHttpResponse } from '../presenters/product.presenter';

export const ListCustomerFavoriteProductsSchema = z.object({
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
});

export type TListCustomerFavoriteProductsSchema = z.infer<
  typeof ListCustomerFavoriteProductsSchema
>;

export type TListCustomerFavoriteProductsResponse =
  PaginatedResponse<ProductHttpResponse>;
