import { BaseError } from '@/core/errors/base-error';
import { HttpStatus } from '@nestjs/common';

export class CustomerAlreadyExistsError extends BaseError {
  constructor(email: string) {
    super({
      message: `Já existe um cliente usando o email ${email}!`,
      code: HttpStatus.CONFLICT,
      isClientError: true,
    });
  }
}
