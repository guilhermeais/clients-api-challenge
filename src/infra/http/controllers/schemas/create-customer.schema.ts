import { z } from 'zod';

export const CreateCustomerSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

export type TCreateCustomerSchema = z.infer<typeof CreateCustomerSchema>;
