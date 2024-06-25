import { Module } from '@nestjs/common';
import { PinoLogger } from './logger/pino.logger';
import { Logger } from '@/domain/application/gateways/tools/logger.interface';

@Module({
  providers: [
    {
      provide: Logger,
      useClass: PinoLogger,
    },
  ],
  exports: [Logger],
})
export class ToolsModule {}
