import { Logger } from '@/domain/application/gateways/tools/logger.interface';
import { Injectable } from '@nestjs/common';
import { pino } from 'pino';

@Injectable()
export class PinoLogger implements Logger {
  #logger = pino();

  log(context: string, message: string): void {
    this.#logger.info(context, message);
  }

  error(context: string, message: string, trace: string): void {
    this.#logger.error(context, `${message}\n${trace}`, trace);
  }

  warn(context: string, message: string): void {
    this.#logger.warn(context, message);
  }
  debug(context: string, message: string): void {
    this.#logger.debug(context, message);
  }
}
