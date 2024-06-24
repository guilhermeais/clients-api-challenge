import axios, { isAxiosError } from 'axios';
import { GetOptions, HttpClient, HttpResponse } from '../http-client.interface';
import { BaseError } from '@/core/errors/base-error';
import { HttpStatus } from '@nestjs/common';
import { Logger } from '@/domain/application/gateways/tools/logger.interface';

export class AxiosHttpClient implements HttpClient {
  constructor(private readonly logger: Logger) {}

  async get<T>(url: URL, options?: GetOptions): Promise<HttpResponse<T>> {
    try {
      this.logger.log(
        AxiosHttpClient.name,
        `GET ${url.toString()} with options: ${JSON.stringify(options, null, 2)}`,
      );
      const response = await axios(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      this.logger.log(
        AxiosHttpClient.name,
        `Response from GET ${url.toString()}: ${response.status}`,
      );

      const body = await response.data;

      return {
        status: response.status,
        body,
      };
    } catch (error) {
      if (isAxiosError(error)) {
        this.logger.error(
          AxiosHttpClient.name,
          `Error ${error.response?.status} on GET ${url.toString()} with ${JSON.stringify(options, null, 2)}: ${JSON.stringify(error.response?.data, null, 2)}`,
          error.stack,
        );

        throw new BaseError({
          message: `Erro ${error.response.status} ao acessar aplicação externa.`,
          code: error.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
          details: `Erro: ${JSON.stringify(error.response?.data)}`,
          isClientError: false,
        });
      }

      this.logger.error(
        AxiosHttpClient.name,
        `Error on GET ${url.toString()}: ${error.message}`,
        error.stack,
      );

      throw new BaseError({
        message: error.message,
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        isClientError: false,
      });
    }
  }
}
