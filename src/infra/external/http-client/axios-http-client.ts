import { Logger } from '@/domain/application/gateways/tools/logger.interface';
import { HttpStatus, Injectable } from '@nestjs/common';
import axios, { isAxiosError } from 'axios';
import { ExternalApiError } from '../errors/external-api-error';
import { GetOptions, HttpClient, HttpResponse } from '../http-client.interface';

@Injectable()
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

        throw new ExternalApiError(
          error.response?.status,
          error.response?.data,
        );
      }

      this.logger.error(
        AxiosHttpClient.name,
        `Error on GET ${url.toString()}: ${error?.message}`,
        error.stack,
      );

      throw new ExternalApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.message,
      );
    }
  }
}
