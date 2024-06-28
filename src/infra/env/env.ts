import 'dotenv/config';
import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.coerce.number().optional().default(3000),
  PRODUCTS_SERVICE_URL: z.string().url(),

  MONGO_URI: z.string().url(),

  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
    .optional()
    .default('info'),
});

export type Env = z.infer<typeof envSchema>;
