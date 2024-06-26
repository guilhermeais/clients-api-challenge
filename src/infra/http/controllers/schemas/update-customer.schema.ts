import { z } from 'zod';

export const UpdateCustomerSchema = z
  .object({
    name: z.string().optional(),
    email: z.string().email().optional(),
  })
  .refine((data) => data.name || data.email, {
    message: 'Ao menos um dos campos (name ou email) deve ser fornecido!',
  });

export type TUpdateCustomerSchema = z.infer<typeof UpdateCustomerSchema>;
