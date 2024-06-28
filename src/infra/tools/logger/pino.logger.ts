import { Logger } from '@/domain/application/gateways/tools/logger.interface';
import { Injectable } from '@nestjs/common';
import { Logger as IPinoLogger } from 'pino';

@Injectable()
export class PinoLogger implements Logger {
  constructor(private readonly pinoLogger: IPinoLogger) {}

  log(context: string, message: string): void {
    this.pinoLogger.info(`[${context}] ${message}`);
  }

  error(context: string, message: string, trace: string): void {
    this.pinoLogger.error(`[${context}] ${message}\n${trace}`, trace);
  }

  warn(context: string, message: string): void {
    this.pinoLogger.warn(`[${context}] ${message}`);
  }
  debug(context: string, message: string): void {
    this.pinoLogger.debug(`[${context}] ${message}`);
  }
}
