import { Logger, Module } from '@nestjs/common';
import { PinoLogger } from './logger/pino.logger';

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
