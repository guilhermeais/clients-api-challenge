import { z } from 'zod';

export const CreateCustomerSchema = z.object({
  name: z.string({
    message: 'Nome do cliente é obrigatório!',
  }),
  email: z
    .string({
      message: 'E-mail do cliente é obrigatório!',
    })
    .email({
      message:
        'E-mail do cliente deve estar no formato válido (mail@mail.com)!',
    }),
});

export type TCreateCustomerSchema = z.infer<typeof CreateCustomerSchema>;
