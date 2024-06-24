import { BaseError } from '@/core/errors/base-error';

export class ExternalApiError<Response = any> extends BaseError {
  response: Response;
  statusCode: number;

  constructor(statusCode: number, response?: Response) {
    super({
      message: `Erro ${statusCode} ao acessar aplicação externa.`,
      code: statusCode,
      details: `Erro: ${JSON.stringify(response)}`,
      isClientError: false,
    });

    this.response = response;
    this.statusCode = statusCode;
  }
}
